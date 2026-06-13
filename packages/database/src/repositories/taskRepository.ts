import { connectToDatabase } from "../connection";
import { TaskModel } from "../models/task";
import type { AgentType, TaskStatus } from "@developeros/shared";

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  assignedAgent?: AgentType;
}

export const taskRepository = {
  async create(input: CreateTaskInput) {
    await connectToDatabase();
    return TaskModel.create(input);
  },

  async listByProject(projectId: string, status?: TaskStatus) {
    await connectToDatabase();
    const filter: Record<string, unknown> = { projectId };
    if (status) {
      filter.status = status;
    }
    return TaskModel.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  },

  async setStatus(id: string, status: TaskStatus) {
    await connectToDatabase();
    return TaskModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  },
};
