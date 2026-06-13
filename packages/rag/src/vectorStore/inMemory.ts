/**
 * In-memory vector store. Used for tests and local development; ranks chunks by
 * cosine similarity. Not for production scale.
 */

import { cosineSimilarity } from "../similarity";
import type { RetrievedChunk, StoredChunk, VectorQuery, VectorStore } from "../types";

export class InMemoryVectorStore implements VectorStore {
  private readonly store: StoredChunk[] = [];

  async upsert(chunks: StoredChunk[]): Promise<void> {
    for (const chunk of chunks) {
      const existing = this.store.findIndex((c) => c.id === chunk.id);
      if (existing >= 0) {
        this.store[existing] = chunk;
      } else {
        this.store.push(chunk);
      }
    }
  }

  async query(params: VectorQuery): Promise<RetrievedChunk[]> {
    return this.store
      .filter((c) => c.projectId === params.projectId)
      .map((c) => ({
        id: c.id,
        documentId: c.documentId,
        content: c.content,
        score: cosineSimilarity(params.embedding, c.embedding),
        metadata: c.metadata,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, params.topK);
  }

  async deleteByDocument(documentId: string): Promise<void> {
    for (let i = this.store.length - 1; i >= 0; i -= 1) {
      if (this.store[i]!.documentId === documentId) {
        this.store.splice(i, 1);
      }
    }
  }

  /** Test/debug helper. */
  size(): number {
    return this.store.length;
  }
}
