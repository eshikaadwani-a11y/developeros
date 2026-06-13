import { Schema, Types, model, models, type InferSchemaType, type Model } from "mongoose";

const documentSchema = new Schema(
  {
    projectId: { type: Types.ObjectId, ref: "Project", required: true },
    ownerId: { type: Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    chunkCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["uploaded", "processing", "indexed", "failed"],
      default: "uploaded",
    },
  },
  { timestamps: true, collection: "documents" },
);

documentSchema.index({ projectId: 1 });
documentSchema.index({ ownerId: 1 });

export type DocumentRecord = InferSchemaType<typeof documentSchema>;

export const DocumentModel: Model<DocumentRecord> =
  (models.Document as Model<DocumentRecord>) ??
  model<DocumentRecord>("Document", documentSchema);
