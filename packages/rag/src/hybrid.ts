/**
 * Hybrid retrieval: combine dense (vector) and sparse (keyword) results with
 * Reciprocal Rank Fusion (RRF). RRF is robust because it depends only on rank
 * position, not on each backend's incomparable score scales.
 */

import { buildContext, type RetrievalResult } from "./retrieve";
import type {
  EmbeddingClient,
  KeywordStore,
  RetrievedChunk,
  VectorStore,
} from "./types";

export type SearchMode = "semantic" | "keyword" | "hybrid";

export interface FusedItem<T> {
  item: T;
  score: number;
}

/**
 * Reciprocal Rank Fusion. `k` dampens the contribution of lower ranks
 * (60 is the value from the original RRF paper).
 */
export function reciprocalRankFusion<T extends { id: string }>(
  lists: T[][],
  k = 60,
): FusedItem<T>[] {
  const scores = new Map<string, number>();
  const items = new Map<string, T>();

  for (const list of lists) {
    list.forEach((item, idx) => {
      const rank = idx + 1;
      scores.set(item.id, (scores.get(item.id) ?? 0) + 1 / (k + rank));
      if (!items.has(item.id)) {
        items.set(item.id, item);
      }
    });
  }

  return [...scores.entries()]
    .map(([id, score]) => ({ item: items.get(id)!, score }))
    .sort((a, b) => b.score - a.score);
}

export interface HybridSearchOptions {
  topK?: number;
  mode?: SearchMode;
}

export interface HybridSearchResult extends RetrievalResult {
  mode: SearchMode;
}

export class HybridRetriever {
  constructor(
    private readonly embeddings: EmbeddingClient,
    private readonly vectorStore: VectorStore,
    private readonly keywordStore: KeywordStore,
  ) {}

  async search(
    projectId: string,
    query: string,
    opts: HybridSearchOptions = {},
  ): Promise<HybridSearchResult> {
    const topK = opts.topK ?? 5;
    const mode = opts.mode ?? "hybrid";

    let chunks: RetrievedChunk[];

    if (mode === "keyword") {
      chunks = await this.keywordStore.search(projectId, query, topK);
    } else if (mode === "semantic") {
      chunks = await this.semantic(projectId, query, topK);
    } else {
      // hybrid: fetch a wider net from both, then fuse.
      const wide = topK * 2;
      const [dense, sparse] = await Promise.all([
        this.semantic(projectId, query, wide),
        this.keywordStore.search(projectId, query, wide),
      ]);
      chunks = reciprocalRankFusion([dense, sparse])
        .slice(0, topK)
        .map((f) => f.item);
    }

    return { mode, chunks, ...buildContext(chunks) };
  }

  private async semantic(
    projectId: string,
    query: string,
    topK: number,
  ): Promise<RetrievedChunk[]> {
    const [embedding] = await this.embeddings.embed([query]);
    if (!embedding) {
      return [];
    }
    return this.vectorStore.query({ projectId, embedding, topK });
  }
}
