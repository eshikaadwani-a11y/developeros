/**
 * A tiny JSON-file-backed store. Data lives under a per-user data directory
 * (~/.developeros by default) so state persists across CLI invocations.
 * Zero dependencies - uses node:fs/promises only.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

/** Root directory for all DeveloperOS state. Overridable via env for tests. */
export function dataDir(): string {
  return process.env.DEVELOPEROS_HOME ?? join(homedir(), ".developeros");
}

export class JsonStore<T> {
  private readonly filePath: string;

  constructor(
    fileName: string,
    private readonly defaultValue: T,
  ) {
    this.filePath = join(dataDir(), fileName);
  }

  get path(): string {
    return this.filePath;
  }

  async read(): Promise<T> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return JSON.parse(raw) as T;
    } catch {
      // Missing file or invalid JSON -> fall back to the default.
      return structuredCloneSafe(this.defaultValue);
    }
  }

  async write(value: T): Promise<void> {
    await mkdir(dataDir(), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(value, null, 2), "utf8");
  }

  /** Read, transform, and persist in one step. Returns the new value. */
  async update(mutator: (current: T) => T): Promise<T> {
    const current = await this.read();
    const next = mutator(current);
    await this.write(next);
    return next;
  }
}

/** structuredClone is not guaranteed in all runtimes; fall back to JSON. */
function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
