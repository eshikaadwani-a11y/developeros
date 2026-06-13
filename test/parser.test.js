"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { parseArgs } = require("../dist/cli/parser.js");

test("parses command and positional args", () => {
  const r = parseArgs(["task", "add", "hello"]);
  assert.strictEqual(r.command, "task");
  assert.deepStrictEqual(r.args, ["add", "hello"]);
});

test("parses boolean flag", () => {
  const r = parseArgs(["status", "--json"]);
  assert.strictEqual(r.command, "status");
  assert.strictEqual(r.flags.json, true);
});

test("parses --name=value", () => {
  const r = parseArgs(["x", "--name=foo"]);
  assert.strictEqual(r.flags.name, "foo");
});

test("parses --name value", () => {
  const r = parseArgs(["x", "--name", "foo"]);
  assert.strictEqual(r.flags.name, "foo");
});

test("treats trailing flag without value as boolean", () => {
  const r = parseArgs(["x", "--verbose", "--json"]);
  assert.strictEqual(r.flags.verbose, true);
  assert.strictEqual(r.flags.json, true);
});

test("parses short flag with no command", () => {
  const r = parseArgs(["-v"]);
  assert.strictEqual(r.command, undefined);
  assert.strictEqual(r.flags.v, true);
});
