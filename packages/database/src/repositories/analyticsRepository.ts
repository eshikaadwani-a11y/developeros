import { connectToDatabase } from "../connection";
import { AnalyticsModel } from "../models/analytics";
import type { AnalyticsEvent } from "@developeros/shared";

type RecordInput = Omit<AnalyticsEvent, "id" | "createdAt">;

export const analyticsRepository = {
  async record(event: RecordInput) {
    await connectToDatabase();
    return AnalyticsModel.create(event);
  },

  /** Aggregate the summed `value` per `type` since a given date. */
  async summaryByType(since: Date) {
    await connectToDatabase();
    return AnalyticsModel.aggregate<{ _id: string; total: number; count: number }>([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$type", total: { $sum: "$value" }, count: { $sum: 1 } } },
    ]);
  },
};
