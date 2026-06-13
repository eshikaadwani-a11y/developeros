/**
 * In-memory keyword store for tests/local dev. Scores chunks by the number of
 * distinct query terms they contain (a simple bag-of-words overlap).
 */

import type { KeywordStore, RetrievedChunk, StoredChunk } from "../types";

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

export class InMemoryKeywordStore implements KeywordStore {
  private readonly store: StoredChunk[] = [];

  upsert(chunks: StoredChunk[]): void {
    this.store.push(...chunks);
  }

  async search(projectId: string, query: string, topK: number): Promise<RetrievedChunk[]> {
    const terms = new Set(tokenize(query));
    if (terms.size === 0) {
      return [];
    }

    return this.store
      .filter((c) => c.projectId === projectId)
      .map((c) => {
        const tokens = new Set(tokenize(c.content));
        let hits = 0;
        for (const t of terms) {
          if (tokens.has(t)) hits += 1;
        }
        return {
          id: c.id,
          documentId: c.documentId,
          content: c.content,
          score: hits / terms.size,
          metadata: c.metadata,
        };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
