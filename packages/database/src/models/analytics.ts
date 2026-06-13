import { Schema, Types, model, models, type InferSchemaType, type Model } from "mongoose";

const analyticsSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["agent_run", "token_usage", "query", "model_performance", "cost"],
      required: true,
    },
    projectId: { type: Types.ObjectId, ref: "Project" },
    userId: { type: Types.ObjectId, ref: "User" },
    model: { type: String },
    agent: {
      type: String,
      enum: ["architect", "coder", "reviewer", "debugger", "research", "documentation"],
    },
    value: { type: Number, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "analytics" },
);

analyticsSchema.index({ type: 1, createdAt: -1 });
analyticsSchema.index({ projectId: 1, createdAt: -1 });
analyticsSchema.index({ userId: 1, createdAt: -1 });

export type AnalyticsDocument = InferSchemaType<typeof analyticsSchema>;

export const AnalyticsModel: Model<AnalyticsDocument> =
  (models.Analytics as Model<AnalyticsDocument>) ??
  model<AnalyticsDocument>("Analytics", analyticsSchema);
