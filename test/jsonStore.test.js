"use strict";
const test = require("node:test");
const assert = require("node:assert");
const os = require("node:os");
const path = require("node:path");

// Isolate state in a throwaway directory before loading the module.
process.env.DEVELOPEROS_HOME = path.join(
  os.tmpdir(),
  `devos-jsonstore-${process.pid}-${Date.now()}`,
);
const { JsonStore } = require("../dist/store/jsonStore.js");

test("read returns the default when the file is missing", async () => {
  const store = new JsonStore("missing.json", { count: 0 });
  assert.deepStrictEqual(await store.read(), { count: 0 });
});

test("write then read round-trips the value", async () => {
  const store = new JsonStore("rt.json", { count: 0 });
  await store.write({ count: 42 });
  assert.deepStrictEqual(await store.read(), { count: 42 });
});

test("update mutates and persists", async () => {
  const store = new JsonStore("upd.json", { n: 1 });
  const next = await store.update((cur) => ({ n: cur.n + 1 }));
  assert.strictEqual(next.n, 2);
  assert.deepStrictEqual(await store.read(), { n: 2 });
});

test("default value is not shared between reads", async () => {
  const store = new JsonStore("iso.json", { items: [] });
  const a = await store.read();
  a.items.push("x");
  const b = await store.read();
  assert.deepStrictEqual(b.items, []);
});
