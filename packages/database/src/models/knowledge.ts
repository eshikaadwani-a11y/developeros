import { Schema, Types, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * A retrievable knowledge chunk: text content + its embedding + citation
 * metadata. The `embedding` field is indexed by an Atlas Vector Search index
 * (created out-of-band; see createIndexes() docs). A text index supports
 * keyword search for the hybrid retrieval path.
 */
const knowledgeSchema = new Schema(
  {
    documentId: { type: Types.ObjectId, ref: "Document", required: true },
    projectId: { type: Types.ObjectId, ref: "Project", required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    index: { type: Number, required: true },
    metadata: {
      filename: { type: String, required: true },
      page: { type: Number },
      startChar: { type: Number },
      endChar: { type: Number },
    },
  },
  { timestamps: true, collection: "knowledge" },
);

knowledgeSchema.index({ documentId: 1 });
knowledgeSchema.index({ projectId: 1 });
// Keyword search support for hybrid retrieval.
knowledgeSchema.index({ content: "text" });

export type KnowledgeDocument = InferSchemaType<typeof knowledgeSchema>;

export const KnowledgeModel: Model<KnowledgeDocument> =
  (models.Knowledge as Model<KnowledgeDocument>) ??
  model<KnowledgeDocument>("Knowledge", knowledgeSchema);

/**
 * Atlas Vector Search index definition for the `knowledge.embedding` field.
 * Create this via the Atlas UI/API or `db.knowledge.createSearchIndex(...)`.
 * Kept here as the single source of truth for the vector index shape.
 */
export const KNOWLEDGE_VECTOR_INDEX = {
  name: "knowledge_embedding_index",
  type: "vectorSearch",
  definition: {
    fields: [
      {
        type: "vector",
        path: "embedding",
        numDimensions: 1536,
        similarity: "cosine",
      },
      { type: "filter", path: "projectId" },
    ],
  },
} as const;
