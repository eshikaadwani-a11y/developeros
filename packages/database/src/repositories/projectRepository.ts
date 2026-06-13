import { connectToDatabase } from "../connection";
import { ProjectModel } from "../models/project";

export interface CreateProjectInput {
  ownerId: string;
  name: string;
  description?: string;
  repoUrl?: string;
}

export const projectRepository = {
  async create(input: CreateProjectInput) {
    await connectToDatabase();
    return ProjectModel.create(input);
  },

  async listByOwner(ownerId: string) {
    await connectToDatabase();
    return ProjectModel.find({ ownerId }).sort({ updatedAt: -1 }).lean();
  },

  async findById(id: string) {
    await connectToDatabase();
    return ProjectModel.findById(id).lean();
  },

  async archive(id: string) {
    await connectToDatabase();
    return ProjectModel.findByIdAndUpdate(id, { status: "archived" }, { new: true }).lean();
  },
};
