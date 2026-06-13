"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { Orchestrator } = require("../dist/orchestrator.js");
const { AgentContext } = require("../dist/context.js");

/** A deterministic mock ChatRunner. */
function mockRunner() {
  const calls = [];
  return {
    calls,
    async chat(modelId, req) {
      calls.push({ modelId, system: req.system, user: req.messages[0].content });
      return {
        content: `output-from(${modelId})`,
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        costUsd: 0.001,
        modelId,
      };
    },
  };
}

test("default pipeline runs all six agents in order", async () => {
  const orch = new Orchestrator(mockRunner());
  const result = await orch.run("Build a login form");
  assert.deepStrictEqual(result.pipeline, [
    "research",
    "architect",
    "coder",
    "reviewer",
    "debugger",
    "documentation",
  ]);
  assert.strictEqual(result.results.length, 6);
});

test("totals are aggregated across stages", async () => {
  const orch = new Orchestrator(mockRunner());
  const result = await orch.run("Add caching");
  assert.strictEqual(result.totalTokens, 6 * 15);
  assert.strictEqual(result.totalCostUsd, Number((6 * 0.001).toFixed(6)));
});

test("finalOutput comes from the last stage", async () => {
  const orch = new Orchestrator(mockRunner());
  const result = await orch.run("x");
  assert.strictEqual(
    result.finalOutput,
    result.results[result.results.length - 1].output,
  );
});

test("optional stages can be disabled", async () => {
  const orch = new Orchestrator(mockRunner());
  const result = await orch.run("x", {
    includeResearch: false,
    includeDocumentation: false,
  });
  assert.deepStrictEqual(result.pipeline, [
    "architect",
    "coder",
    "reviewer",
    "debugger",
  ]);
});

test("later agents see earlier artifacts via shared context", async () => {
  const runner = mockRunner();
  const orch = new Orchestrator(runner);
  await orch.run("Build X", { includeResearch: false, includeDocumentation: false });
  // The reviewer (3rd call) prompt should reference prior architect/coder output.
  const reviewerCall = runner.calls[2];
  assert.match(reviewerCall.user, /output-from/);
});

test("AgentContext renders artifacts as text", () => {
  const ctx = new AgentContext("req");
  assert.match(ctx.artifactsAsText(), /no prior artifacts/);
  ctx.addArtifact({ agent: "coder", name: "coder-output", content: "console.log(1)" });
  assert.match(ctx.artifactsAsText(), /coder — coder-output/);
  assert.match(ctx.artifactsAsText(), /console\.log\(1\)/);
});
