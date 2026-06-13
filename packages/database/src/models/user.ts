import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String },
    image: { type: String },
    emailVerified: { type: Date },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    settings: {
      defaultModel: { type: String, default: "openai:gpt-4o" },
      theme: { type: String, enum: ["light", "dark", "system"], default: "dark" },
    },
  },
  { timestamps: true, collection: "users" },
);

userSchema.index({ email: 1 }, { unique: true });

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel: Model<UserDocument> =
  (models.User as Model<UserDocument>) ?? model<UserDocument>("User", userSchema);
