"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { reciprocalRankFusion, HybridRetriever } = require("../dist/hybrid.js");
const { InMemoryVectorStore } = require("../dist/vectorStore/inMemory.js");
const { InMemoryKeywordStore } = require("../dist/keyword/inMemory.js");

test("RRF rewards items ranked highly across lists", () => {
  const a = [{ id: "x" }, { id: "y" }, { id: "z" }];
  const b = [{ id: "y" }, { id: "x" }, { id: "w" }];
  const fused = reciprocalRankFusion([a, b]);
  // x and y appear in both lists near the top, so they outrank z and w.
  assert.deepStrictEqual(fused.slice(0, 2).map((f) => f.item.id).sort(), ["x", "y"]);
});

test("RRF dedupes by id and keeps the first item instance", () => {
  const fused = reciprocalRankFusion([[{ id: "a", v: 1 }], [{ id: "a", v: 2 }]]);
  assert.strictEqual(fused.length, 1);
  assert.strictEqual(fused[0].item.v, 1);
});

function embedText(t) {
  const v = new Array(26).fill(0);
  for (const ch of t.toLowerCase()) {
    const c = ch.charCodeAt(0) - 97;
    if (c >= 0 && c < 26) v[c] += 1;
  }
  return v;
}
const embeddings = { model: "mock", async embed(texts) { return texts.map(embedText); } };

function seed() {
  const vector = new InMemoryVectorStore();
  const keyword = new InMemoryKeywordStore();
  const chunks = [
    { id: "1", documentId: "d", projectId: "p", content: "zebra zoo zone", embedding: embedText("zebra zoo zone"), index: 0, metadata: { filename: "a.md" } },
    { id: "2", documentId: "d", projectId: "p", content: "apple acid area", embedding: embedText("apple acid area"), index: 1, metadata: { filename: "a.md" } },
  ];
  vector.upsert(chunks);
  keyword.upsert(chunks);
  return new HybridRetriever(embeddings, vector, keyword);
}

test("keyword mode matches on terms", async () => {
  const r = await seed().search("p", "apple", { mode: "keyword", topK: 5 });
  assert.strictEqual(r.mode, "keyword");
  assert.strictEqual(r.chunks[0].content, "apple acid area");
});

test("semantic mode ranks by embedding similarity", async () => {
  const r = await seed().search("p", "zebra zone", { mode: "semantic", topK: 5 });
  assert.strictEqual(r.mode, "semantic");
  assert.match(r.chunks[0].content, /zebra/);
});

test("hybrid mode fuses both and produces citations", async () => {
  const r = await seed().search("p", "apple", { mode: "hybrid", topK: 5 });
  assert.strictEqual(r.mode, "hybrid");
  assert.ok(r.chunks.length >= 1);
  assert.match(r.context, /\[1\]/);
});
