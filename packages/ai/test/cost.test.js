"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { estimateCost, knownModels } = require("../dist/cost.js");

test("computes cost from input/output tokens", () => {
  // gpt-4o: $2.5/1M input, $10/1M output
  const cost = estimateCost("openai:gpt-4o", {
    promptTokens: 1_000_000,
    completionTokens: 1_000_000,
    totalTokens: 2_000_000,
  });
  assert.strictEqual(cost, 12.5);
});

test("returns 0 for unknown models", () => {
  assert.strictEqual(
    estimateCost("unknown:model", {
      promptTokens: 1000,
      completionTokens: 1000,
      totalTokens: 2000,
    }),
    0,
  );
});

test("embedding models have zero output cost", () => {
  const cost = estimateCost("openai:text-embedding-3-small", {
    promptTokens: 1_000_000,
    completionTokens: 0,
    totalTokens: 1_000_000,
  });
  assert.strictEqual(cost, 0.02);
});

test("knownModels includes the core models", () => {
  const models = knownModels();
  assert.ok(models.includes("openai:gpt-4o"));
  assert.ok(models.includes("anthropic:claude-3-5-sonnet"));
});
