/**
 * MongoDB full-text keyword store using the `content` text index on the
 * `knowledge` collection.
 */

import { KnowledgeModel, connectToDatabase } from "@developeros/database";
import type { KeywordStore, RetrievedChunk } from "../types";

export class AtlasKeywordStore implements KeywordStore {
  async search(projectId: string, query: string, topK: number): Promise<RetrievedChunk[]> {
    await connectToDatabase();
    const docs = await KnowledgeModel.find(
      { projectId, $text: { $search: query } },
      { score: { $meta: "textScore" }, content: 1, documentId: 1, metadata: 1 },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(topK)
      .lean();

    return docs.map((d: Record<string, unknown>) => ({
      id: String(d._id),
      documentId: String(d.documentId),
      content: String(d.content),
      score: Number(d.score ?? 0),
      metadata: d.metadata as RetrievedChunk["metadata"],
    }));
  }
}
