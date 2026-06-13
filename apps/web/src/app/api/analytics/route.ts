import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyticsRepository } from "@developeros/database";

export const runtime = "nodejs";

/**
 * GET /api/analytics?days=30 — aggregated usage/cost summary by event type.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = Number(new URL(req.url).searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const summary = await analyticsRepository.summaryByType(since);
    return NextResponse.json({ since: since.toISOString(), summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analytics query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
