"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { parseModelId, formatModelId, isValidModelId } = require("../dist/modelId.js");

test("parses a valid provider:model id", () => {
  assert.deepStrictEqual(parseModelId("openai:gpt-4o"), {
    provider: "openai",
    model: "gpt-4o",
  });
});

test("keeps colons that appear inside the model name", () => {
  assert.deepStrictEqual(parseModelId("anthropic:claude-3-5-sonnet:beta"), {
    provider: "anthropic",
    model: "claude-3-5-sonnet:beta",
  });
});

test("rejects unknown providers", () => {
  assert.throws(() => parseModelId("cohere:command"));
});

test("rejects ids without a model", () => {
  assert.throws(() => parseModelId("openai:"));
});

test("rejects ids without a provider", () => {
  assert.throws(() => parseModelId(":gpt-4o"));
});

test("formatModelId round-trips", () => {
  assert.strictEqual(formatModelId("openai", "gpt-4o"), "openai:gpt-4o");
});

test("isValidModelId reflects validity", () => {
  assert.strictEqual(isValidModelId("openai:gpt-4o"), true);
  assert.strictEqual(isValidModelId("nope"), false);
});
