/**
 * Ingestion pipeline: parse -> chunk -> embed -> store. Embeddings and storage
 * are injected so the pipeline is backend-agnostic and testable.
 */

import type { EmbeddingClient, StoredChunk, VectorStore, ChunkOptions } from "./types";
import { chunkText } from "./chunk";
import { parseFile } from "./parse";

export interface IngestInput {
  documentId: string;
  projectId: string;
  filename: string;
  /** Raw text (already extracted) or a Buffer for binary formats. */
  data: Buffer | string;
  chunkOptions?: ChunkOptions;
}

export interface IngestResult {
  documentId: string;
  chunkCount: number;
  totalTokensEmbedded: number;
}

let counter = 0;
function chunkId(documentId: string, index: number): string {
  counter += 1;
  return `${documentId}:${index}:${counter}`;
}

export class Ingestor {
  constructor(
    private readonly embeddings: EmbeddingClient,
    private readonly store: VectorStore,
  ) {}

  async ingest(input: IngestInput): Promise<IngestResult> {
    const parsed = await parseFile(input.filename, input.data);
    const chunks = chunkText(parsed.text, input.chunkOptions);

    if (chunks.length === 0) {
      return { documentId: input.documentId, chunkCount: 0, totalTokensEmbedded: 0 };
    }

    const vectors = await this.embeddings.embed(chunks.map((c) => c.content));

    const stored: StoredChunk[] = chunks.map((c, i) => ({
      id: chunkId(input.documentId, c.index),
      documentId: input.documentId,
      projectId: input.projectId,
      content: c.content,
      embedding: vectors[i] ?? [],
      index: c.index,
      metadata: {
        filename: input.filename,
        startChar: c.startChar,
        endChar: c.endChar,
      },
    }));

    await this.store.upsert(stored);

    return {
      documentId: input.documentId,
      chunkCount: stored.length,
      totalTokensEmbedded: chunks.reduce((sum, c) => sum + Math.ceil(c.content.length / 4), 0),
    };
  }
}
