import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { mlFetch } from "@/lib/ml";

export const runtime = "nodejs";

/** POST /api/ml/predict — proxy to the ML service /predict endpoint. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  try {
    const result = await mlFetch("/predict", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "ML predict failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
