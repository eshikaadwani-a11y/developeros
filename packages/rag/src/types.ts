/**
 * RAG contracts. The core (chunking, similarity, ingest, retrieve) depends only
 * on these interfaces, so embeddings and the vector store can be swapped (Atlas,
 * Qdrant, in-memory) without touching the pipeline.
 */

export interface ChunkOptions {
  /** Target chunk size in approximate tokens. */
  maxTokens?: number;
  /** Overlap between consecutive chunks in approximate tokens. */
  overlapTokens?: number;
}

export interface Chunk {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
}

export interface StoredChunk {
  id: string;
  documentId: string;
  projectId: string;
  content: string;
  embedding: number[];
  index: number;
  metadata: {
    filename: string;
    page?: number;
    startChar?: number;
    endChar?: number;
  };
}

export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  score: number;
  metadata: StoredChunk["metadata"];
}

/** Produces embedding vectors for one or more strings. */
export interface EmbeddingClient {
  embed(texts: string[]): Promise<number[][]>;
  readonly model: string;
}

export interface VectorQuery {
  projectId: string;
  embedding: number[];
  topK: number;
}

/** Pluggable vector storage backend. */
export interface VectorStore {
  upsert(chunks: StoredChunk[]): Promise<void>;
  query(params: VectorQuery): Promise<RetrievedChunk[]>;
  deleteByDocument(documentId: string): Promise<void>;
}

export interface ParsedFile {
  text: string;
  /** Optional page count for paginated formats (PDF). */
  pages?: number;
}
