"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { cosineSimilarity, dot, magnitude } = require("../dist/similarity.js");

test("identical vectors have similarity 1", () => {
  assert.strictEqual(cosineSimilarity([1, 2, 3], [1, 2, 3]), 1);
});

test("orthogonal vectors have similarity 0", () => {
  assert.strictEqual(cosineSimilarity([1, 0], [0, 1]), 0);
});

test("zero vector yields 0 (no NaN)", () => {
  assert.strictEqual(cosineSimilarity([0, 0], [1, 1]), 0);
});

test("dot and magnitude basics", () => {
  assert.strictEqual(dot([1, 2, 3], [4, 5, 6]), 32);
  assert.strictEqual(magnitude([3, 4]), 5);
});
