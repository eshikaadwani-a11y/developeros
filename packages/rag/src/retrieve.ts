/**
 * Retrieval + context injection. Embeds the query, fetches the top-K chunks
 * from the vector store, and builds a budgeted, citation-annotated context
 * string suitable for injection into an agent/LLM prompt.
 */

import type { EmbeddingClient, RetrievedChunk, VectorStore } from "./types";

export interface RetrieveOptions {
  topK?: number;
  /** Drop chunks scoring below this cosine threshold. */
  minScore?: number;
}

export interface Citation {
  ref: number;
  documentId: string;
  filename: string;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  /** Prompt-ready context block with inline [n] citations. */
  context: string;
  citations: Citation[];
}

export class Retriever {
  constructor(
    private readonly embeddings: EmbeddingClient,
    private readonly store: VectorStore,
  ) {}

  async retrieve(
    projectId: string,
    query: string,
    opts: RetrieveOptions = {},
  ): Promise<RetrievalResult> {
    const topK = opts.topK ?? 5;
    const [embedding] = await this.embeddings.embed([query]);
    if (!embedding) {
      return { chunks: [], context: "", citations: [] };
    }

    let chunks = await this.store.query({ projectId, embedding, topK });
    if (opts.minScore !== undefined) {
      chunks = chunks.filter((c) => c.score >= opts.minScore!);
    }

    return { chunks, ...buildContext(chunks) };
  }
}

/** Build a citation-annotated context block from retrieved chunks. */
export function buildContext(chunks: RetrievedChunk[]): {
  context: string;
  citations: Citation[];
} {
  const citations: Citation[] = chunks.map((c, i) => ({
    ref: i + 1,
    documentId: c.documentId,
    filename: c.metadata.filename,
  }));

  const context = chunks
    .map((c, i) => `[${i + 1}] (${c.metadata.filename})\n${c.content}`)
    .join("\n\n");

  return { context, citations };
}
