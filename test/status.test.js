"use strict";
const test = require("node:test");
const assert = require("node:assert");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");
const { readGitBranch, collectStatus } = require("../dist/commands/status.js");

function tmpDir(label) {
  const dir = path.join(os.tmpdir(), `devos-${label}-${process.pid}-${Date.now()}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

test("reads branch name from .git/HEAD", () => {
  const dir = tmpDir("git");
  fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".git", "HEAD"),
    "ref: refs/heads/feature/awesome\n",
  );
  assert.strictEqual(readGitBranch(dir), "feature/awesome");
});

test("returns short hash for detached HEAD", () => {
  const dir = tmpDir("detached");
  fs.mkdirSync(path.join(dir, ".git"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".git", "HEAD"),
    "0123456789abcdef0123456789abcdef01234567\n",
  );
  assert.strictEqual(readGitBranch(dir), "0123456789ab");
});

test("collectStatus returns a well-formed snapshot", () => {
  const info = collectStatus();
  assert.strictEqual(info.app.name, "DeveloperOS");
  assert.ok(typeof info.runtime.node === "string");
  assert.ok(info.resources.cpus >= 1);
  assert.ok(typeof info.workspace.cwd === "string");
});
