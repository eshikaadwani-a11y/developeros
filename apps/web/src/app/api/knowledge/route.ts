import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DocumentModel, connectToDatabase } from "@developeros/database";
import { ingestor } from "@/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 300;

/** GET /api/knowledge?projectId=... — list documents for a project. */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const projectId = new URL(req.url).searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }
  await connectToDatabase();
  const docs = await DocumentModel.find({ projectId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ documents: docs });
}

/**
 * POST /api/knowledge — multipart upload: fields `file` and `projectId`.
 * Creates a Document record, ingests it into the knowledge base, and returns
 * the ingestion result.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const projectId = form.get("projectId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "`file` is required" }, { status: 400 });
  }
  if (typeof projectId !== "string" || !projectId) {
    return NextResponse.json({ error: "`projectId` is required" }, { status: 400 });
  }

  await connectToDatabase();
  const doc = await DocumentModel.create({
    projectId,
    ownerId: session.user.id,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    status: "processing",
  });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ingestor.ingest({
      documentId: String(doc._id),
      projectId,
      filename: file.name,
      data: buffer,
    });

    await DocumentModel.findByIdAndUpdate(doc._id, {
      chunkCount: result.chunkCount,
      status: "indexed",
    });

    return NextResponse.json(result);
  } catch (err) {
    await DocumentModel.findByIdAndUpdate(doc._id, { status: "failed" });
    const message = err instanceof Error ? err.message : "Ingestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
