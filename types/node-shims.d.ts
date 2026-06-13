/**
 * Minimal ambient declarations for the Node.js built-ins used by DeveloperOS.
 *
 * This project is intentionally dependency-free and is built in an offline
 * environment where `@types/node` is not installable. These shims declare only
 * the surface area the codebase actually relies on. If you have network access,
 * you can replace this file with `npm i -D @types/node`.
 */

interface NodeWriteStream {
  write(chunk: string): boolean;
  isTTY?: boolean;
}

interface NodeProcess {
  argv: string[];
  env: Record<string, string | undefined>;
  platform: string;
  arch: string;
  version: string;
  versions: Record<string, string>;
  pid: number;
  cwd(): string;
  exit(code?: number): never;
  uptime(): number;
  memoryUsage(): {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  stdout: NodeWriteStream;
  stderr: NodeWriteStream;
}

declare var process: NodeProcess;

declare var console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
};

declare var require: {
  (id: string): unknown;
  main?: unknown;
};

declare var module: { exports: unknown };
declare var __dirname: string;
declare var __filename: string;

declare module "node:os" {
  export function homedir(): string;
  export function hostname(): string;
  export function platform(): string;
  export function arch(): string;
  export function release(): string;
  export function type(): string;
  export function totalmem(): number;
  export function freemem(): number;
  export function uptime(): number;
  export function cpus(): Array<{ model: string; speed: number }>;
  export function userInfo(): { username: string; homedir: string };
}

declare module "node:path" {
  export function join(...parts: string[]): string;
  export function resolve(...parts: string[]): string;
  export function dirname(p: string): string;
  export function basename(p: string, ext?: string): string;
  const _default: {
    join(...parts: string[]): string;
    resolve(...parts: string[]): string;
    dirname(p: string): string;
    basename(p: string, ext?: string): string;
  };
  export default _default;
}

declare module "node:fs" {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function readFileSync(path: string, encoding: string): string;
  export function writeFileSync(path: string, data: string, encoding?: string): void;
}

declare module "node:fs/promises" {
  export function readFile(path: string, encoding: string): Promise<string>;
  export function writeFile(path: string, data: string, encoding?: string): Promise<void>;
  export function mkdir(
    path: string,
    options?: { recursive?: boolean },
  ): Promise<string | undefined>;
  export function access(path: string): Promise<void>;
}

declare module "node:test" {
  type TestFn = () => void | Promise<void>;
  export function test(name: string, fn: TestFn): void;
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: TestFn): void;
  export default function test(name: string, fn: TestFn): void;
}

declare module "node:assert" {
  interface Assert {
    (value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    strictEqual(actual: unknown, expected: unknown, message?: string): void;
    ok(value: unknown, message?: string): void;
    throws(fn: () => unknown, message?: string): void;
  }
  const assert: Assert;
  export default assert;
}
