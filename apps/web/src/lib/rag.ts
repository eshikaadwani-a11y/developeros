/**
 * Wires the RAG pipeline to production backends: registry-backed embeddings,
 * Atlas vector search, and Atlas full-text keyword search.
 */

import { registry } from "@developeros/ai";
import {
  AtlasVectorStore,
  AtlasKeywordStore,
  createRegistryEmbeddingClient,
  Ingestor,
  HybridRetriever,
} from "@developeros/rag";

const embeddings = createRegistryEmbeddingClient(registry);
const vectorStore = new AtlasVectorStore();
const keywordStore = new AtlasKeywordStore();

export const ingestor = new Ingestor(embeddings, vectorStore);
export const hybridRetriever = new HybridRetriever(embeddings, vectorStore, keywordStore);
