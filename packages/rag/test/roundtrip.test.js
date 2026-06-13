"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { Ingestor } = require("../dist/ingest.js");
const { Retriever, buildContext } = require("../dist/retrieve.js");
const { InMemoryVectorStore } = require("../dist/vectorStore/inMemory.js");

/** Deterministic embedding: 26-dim lowercase letter frequency vector. */
function embedText(t) {
  const v = new Array(26).fill(0);
  for (const ch of t.toLowerCase()) {
    const c = ch.charCodeAt(0) - 97;
    if (c >= 0 && c < 26) v[c] += 1;
  }
  return v;
}
const embeddings = {
  model: "mock",
  async embed(texts) {
    return texts.map(embedText);
  },
};

const doc = [
  "zebra zoo zone buzz",
  "apple acid cabbage",
  "mango melon meal",
].join("\n\n");

test("ingest chunks, embeds, and stores", async () => {
  const store = new InMemoryVectorStore();
  const ingestor = new Ingestor(embeddings, store);
  const result = await ingestor.ingest({
    documentId: "doc1",
    projectId: "proj1",
    filename: "notes.md",
    data: doc,
    chunkOptions: { maxTokens: 5, overlapTokens: 0 },
  });
  assert.ok(result.chunkCount >= 2);
  assert.strictEqual(store.size(), result.chunkCount);
});

test("retrieval ranks the most relevant chunk first with a citation", async () => {
  const store = new InMemoryVectorStore();
  const ingestor = new Ingestor(embeddings, store);
  await ingestor.ingest({
    documentId: "doc1",
    projectId: "proj1",
    filename: "notes.md",
    data: doc,
    chunkOptions: { maxTokens: 5, overlapTokens: 0 },
  });

  const retriever = new Retriever(embeddings, store);
  const res = await retriever.retrieve("proj1", "zebra buzz zone", { topK: 3 });

  assert.ok(res.chunks.length >= 1);
  assert.match(res.chunks[0].content, /zebra/);
  assert.match(res.context, /\[1\] \(notes\.md\)/);
  assert.strictEqual(res.citations[0].filename, "notes.md");
});

test("project isolation: queries only see their project's chunks", async () => {
  const store = new InMemoryVectorStore();
  const ingestor = new Ingestor(embeddings, store);
  await ingestor.ingest({
    documentId: "d",
    projectId: "other",
    filename: "x.md",
    data: doc,
    chunkOptions: { maxTokens: 5 },
  });
  const retriever = new Retriever(embeddings, store);
  const res = await retriever.retrieve("proj1", "zebra", { topK: 3 });
  assert.strictEqual(res.chunks.length, 0);
});

test("buildContext numbers citations sequentially", () => {
  const { context, citations } = buildContext([
    { id: "1", documentId: "d", content: "alpha", score: 0.9, metadata: { filename: "a.md" } },
    { id: "2", documentId: "d", content: "beta", score: 0.8, metadata: { filename: "b.md" } },
  ]);
  assert.match(context, /\[1\] \(a\.md\)/);
  assert.match(context, /\[2\] \(b\.md\)/);
  assert.deepStrictEqual(
    citations.map((c) => c.ref),
    [1, 2],
  );
});
