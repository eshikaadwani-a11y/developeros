import { Schema, Types, model, models, type InferSchemaType, type Model } from "mongoose";

const projectSchema = new Schema(
  {
    ownerId: { type: Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    status: { type: String, enum: ["active", "archived"], default: "active" },
    repoUrl: { type: String },
  },
  { timestamps: true, collection: "projects" },
);

projectSchema.index({ ownerId: 1 });
projectSchema.index({ ownerId: 1, updatedAt: -1 });

export type ProjectDocument = InferSchemaType<typeof projectSchema>;

export const ProjectModel: Model<ProjectDocument> =
  (models.Project as Model<ProjectDocument>) ??
  model<ProjectDocument>("Project", projectSchema);
