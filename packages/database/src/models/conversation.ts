import { Schema, Types, model, models, type InferSchemaType, type Model } from "mongoose";

const messageSchema = new Schema(
  {
    role: { type: String, enum: ["system", "user", "assistant", "tool"], required: true },
    content: { type: String, required: true },
    name: { type: String },
  },
  { _id: false },
);

const conversationSchema = new Schema(
  {
    projectId: { type: Types.ObjectId, ref: "Project", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled conversation" },
    messages: { type: [messageSchema], default: [] },
    model: { type: String, default: "openai:gpt-4o" },
  },
  { timestamps: true, collection: "conversations" },
);

conversationSchema.index({ projectId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1 });

export type ConversationDocument = InferSchemaType<typeof conversationSchema>;

export const ConversationModel: Model<ConversationDocument> =
  (models.Conversation as Model<ConversationDocument>) ??
  model<ConversationDocument>("Conversation", conversationSchema);
