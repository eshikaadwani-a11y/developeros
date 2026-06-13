import { Schema, Types, model, models, type InferSchemaType, type Model } from "mongoose";

const agentSchema = new Schema(
  {
    projectId: { type: Types.ObjectId, ref: "Project", required: true },
    type: {
      type: String,
      enum: ["architect", "coder", "reviewer", "debugger", "research", "documentation"],
      required: true,
    },
    model: { type: String, default: "openai:gpt-4o" },
    enabled: { type: Boolean, default: true },
    systemPrompt: { type: String },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "agents" },
);

agentSchema.index({ projectId: 1 });
agentSchema.index({ projectId: 1, type: 1 }, { unique: true });

export type AgentDocument = InferSchemaType<typeof agentSchema>;

export const AgentModel: Model<AgentDocument> =
  (models.Agent as Model<AgentDocument>) ?? model<AgentDocument>("Agent", agentSchema);
