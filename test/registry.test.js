"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { CommandRegistry } = require("../dist/cli/registry.js");

const makeCmd = (name) => ({
  name,
  description: `desc ${name}`,
  run: () => ({ exitCode: 0 }),
});

test("registers and retrieves a command", () => {
  const r = new CommandRegistry();
  r.register(makeCmd("alpha"));
  assert.ok(r.has("alpha"));
  assert.strictEqual(r.get("alpha").name, "alpha");
});

test("returns undefined for unknown command", () => {
  const r = new CommandRegistry();
  assert.strictEqual(r.get("nope"), undefined);
});

test("throws on duplicate registration", () => {
  const r = new CommandRegistry();
  r.register(makeCmd("dup"));
  assert.throws(() => r.register(makeCmd("dup")));
});

test("lists commands sorted by name", () => {
  const r = new CommandRegistry();
  r.register(makeCmd("beta"));
  r.register(makeCmd("alpha"));
  assert.deepStrictEqual(
    r.list().map((c) => c.name),
    ["alpha", "beta"],
  );
});
