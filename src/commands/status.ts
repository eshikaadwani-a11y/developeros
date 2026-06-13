/**
 * `status` command - prints a snapshot of the current developer environment:
 * runtime, OS, CPU/memory, working directory, and git branch (if any).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as os from "node:os";
import type { Command, CommandContext, CommandResult } from "../core/types";

interface StatusInfo {
  app: { name: string; version: string };
  runtime: { node: string; v8: string };
  system: {
    platform: string;
    arch: string;
    release: string;
    hostname: string;
    user: string;
  };
  resources: {
    cpus: number;
    totalMemMb: number;
    freeMemMb: number;
    uptimeMin: number;
  };
  workspace: { cwd: string; gitBranch: string | null };
}

function bytesToMb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

/**
 * Best-effort read of the current git branch by parsing .git/HEAD.
 * Returns null when not inside a git repository.
 */
export function readGitBranch(cwd: string): string | null {
  let dir = cwd;
  // Walk up the directory tree looking for a .git/HEAD file.
  for (let depth = 0; depth < 50; depth += 1) {
    const headPath = join(dir, ".git", "HEAD");
    if (existsSync(headPath)) {
      try {
        const head = readFileSync(headPath, "utf8").trim();
        const match = head.match(/^ref:\s*refs\/heads\/(.+)$/);
        if (match) {
          return match[1];
        }
        // Detached HEAD: show the short commit hash.
        return head.slice(0, 12);
      } catch {
        return null;
      }
    }
    const parent = join(dir, "..");
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return null;
}

export function collectStatus(): StatusInfo {
  return {
    app: { name: "DeveloperOS", version: "0.1.0" },
    runtime: {
      node: process.version,
      v8: process.versions.v8 ?? "unknown",
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      user: os.userInfo().username,
    },
    resources: {
      cpus: os.cpus().length,
      totalMemMb: bytesToMb(os.totalmem()),
      freeMemMb: bytesToMb(os.freemem()),
      uptimeMin: Math.round(os.uptime() / 60),
    },
    workspace: {
      cwd: process.cwd(),
      gitBranch: readGitBranch(process.cwd()),
    },
  };
}

export const statusCommand: Command = {
  name: "status",
  description: "Show a snapshot of the current developer environment",
  usage: "status [--json]",
  run(ctx: CommandContext): CommandResult {
    const info = collectStatus();

    if (ctx.flags.json) {
      ctx.logger.info(JSON.stringify(info, null, 2));
      return { exitCode: 0 };
    }

    const { logger } = ctx;
    const row = (label: string, value: string): void => {
      logger.info(`  ${label.padEnd(12)} ${value}`);
    };

    logger.heading(`${info.app.name} v${info.app.version}`);
    logger.info("");
    logger.heading("Runtime");
    row("Node", info.runtime.node);
    row("V8", info.runtime.v8);
    logger.info("");
    logger.heading("System");
    row("Platform", `${info.system.platform} (${info.system.arch})`);
    row("Release", info.system.release);
    row("Host", info.system.hostname);
    row("User", info.system.user);
    logger.info("");
    logger.heading("Resources");
    row("CPUs", String(info.resources.cpus));
    row("Memory", `${info.resources.freeMemMb} MB free / ${info.resources.totalMemMb} MB`);
    row("Uptime", `${info.resources.uptimeMin} min`);
    logger.info("");
    logger.heading("Workspace");
    row("Directory", info.workspace.cwd);
    row("Git branch", info.workspace.gitBranch ?? "(not a git repo)");

    return { exitCode: 0 };
  },
};
