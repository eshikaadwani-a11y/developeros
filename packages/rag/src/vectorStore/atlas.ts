/**
 * MongoDB Atlas Vector Search store. Persists chunks in the `knowledge`
 * collection and queries them with the `$vectorSearch` aggregation stage
 * against the index defined by KNOWLEDGE_VECTOR_INDEX.
 */

import { KnowledgeModel, KNOWLEDGE_VECTOR_INDEX, connectToDatabase } from "@developeros/database";
import type { RetrievedChunk, StoredChunk, VectorQuery, VectorStore } from "../types";

export class AtlasVectorStore implements VectorStore {
  async upsert(chunks: StoredChunk[]): Promise<void> {
    if (chunks.length === 0) return;
    await connectToDatabase();
    await KnowledgeModel.insertMany(
      chunks.map((c) => ({
        documentId: c.documentId,
        projectId: c.projectId,
        content: c.content,
        embedding: c.embedding,
        index: c.index,
        metadata: c.metadata,
      })),
    );
  }

  async query(params: VectorQuery): Promise<RetrievedChunk[]> {
    await connectToDatabase();
    const docs = await KnowledgeModel.aggregate([
      {
        $vectorSearch: {
          index: KNOWLEDGE_VECTOR_INDEX.name,
          path: "embedding",
          queryVector: params.embedding,
          numCandidates: Math.max(params.topK * 10, 100),
          limit: params.topK,
          filter: { projectId: params.projectId },
        },
      },
      {
        $project: {
          content: 1,
          documentId: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    return docs.map((d: Record<string, unknown>) => ({
      id: String(d._id),
      documentId: String(d.documentId),
      content: String(d.content),
      score: Number(d.score ?? 0),
      metadata: d.metadata as RetrievedChunk["metadata"],
    }));
  }

  async deleteByDocument(documentId: string): Promise<void> {
    await connectToDatabase();
    await KnowledgeModel.deleteMany({ documentId });
  }
}
