import { Schema, Types, model, models, type InferSchemaType, type Model } from "mongoose";

const taskSchema = new Schema(
  {
    projectId: { type: Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "in_progress", "blocked", "done", "failed"],
      default: "pending",
    },
    assignedAgent: {
      type: String,
      enum: ["architect", "coder", "reviewer", "debugger", "research", "documentation"],
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "tasks" },
);

taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedAgent: 1 });

export type TaskDocument = InferSchemaType<typeof taskSchema>;

export const TaskModel: Model<TaskDocument> =
  (models.Task as Model<TaskDocument>) ?? model<TaskDocument>("Task", taskSchema);
