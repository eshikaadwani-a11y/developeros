import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hybridRetriever } from "@/lib/rag";
import type { SearchMode } from "@developeros/rag";

export const runtime = "nodejs";

const MODES: SearchMode[] = ["semantic", "keyword", "hybrid"];

/**
 * POST /api/knowledge/search
 * Body: { projectId: string, query: string, mode?: "semantic"|"keyword"|"hybrid", topK?: number }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const query = typeof body.query === "string" ? body.query.trim() : "";
  const mode: SearchMode = MODES.includes(body.mode as SearchMode)
    ? (body.mode as SearchMode)
    : "hybrid";
  const topK = typeof body.topK === "number" ? body.topK : 5;

  if (!projectId || !query) {
    return NextResponse.json(
      { error: "`projectId` and `query` are required" },
      { status: 400 },
    );
  }

  try {
    const result = await hybridRetriever.search(projectId, query, { mode, topK });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
