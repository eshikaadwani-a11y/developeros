import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { registry } from "@developeros/ai";
import { Orchestrator } from "@developeros/agents";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST /api/agents/run
 * Body: { request: string, model?: string, includeResearch?: boolean, includeDocumentation?: boolean }
 * Runs the full agent pipeline and returns the orchestration result.
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

  const request = typeof body.request === "string" ? body.request.trim() : "";
  if (!request) {
    return NextResponse.json({ error: "`request` is required" }, { status: 400 });
  }

  const orchestrator = new Orchestrator(registry);

  try {
    const result = await orchestrator.run(request, {
      model: typeof body.model === "string" ? (body.model as `${string}:${string}`) : undefined,
      includeResearch: body.includeResearch !== false,
      includeDocumentation: body.includeDocumentation !== false,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Orchestration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
