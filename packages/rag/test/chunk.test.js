"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { chunkText, estimateTokens } = require("../dist/chunk.js");

test("empty input yields no chunks", () => {
  assert.deepStrictEqual(chunkText(""), []);
  assert.deepStrictEqual(chunkText("   \n  "), []);
});

test("short text yields a single chunk", () => {
  const chunks = chunkText("hello world");
  assert.strictEqual(chunks.length, 1);
  assert.strictEqual(chunks[0].content, "hello world");
  assert.strictEqual(chunks[0].index, 0);
});

test("long text is split into multiple ordered chunks", () => {
  const text = Array.from({ length: 50 }, (_, i) => `sentence number ${i}.`).join(" ");
  const chunks = chunkText(text, { maxTokens: 20, overlapTokens: 5 });
  assert.ok(chunks.length > 1);
  chunks.forEach((c, i) => {
    assert.strictEqual(c.index, i);
    assert.ok(c.content.length > 0);
    assert.ok(c.endChar > c.startChar);
  });
});

test("estimateTokens approximates ~4 chars/token", () => {
  assert.strictEqual(estimateTokens("a".repeat(40)), 10);
});
