/**
 * File parsing into plain text. Text/Markdown/code are handled inline; PDF and
 * DOCX are delegated to optional dependencies (pdf-parse, mammoth) that are
 * dynamically imported so the package works without them when not needed.
 */

import type { ParsedFile } from "./types";

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "json",
  "yaml",
  "yml",
  "csv",
  "ts",
  "tsx",
  "js",
  "jsx",
  "py",
  "go",
  "rs",
  "java",
  "rb",
  "php",
  "c",
  "cpp",
  "h",
  "sql",
  "sh",
]);

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

export function isTextFile(filename: string): boolean {
  return TEXT_EXTENSIONS.has(extensionOf(filename));
}

export async function parseFile(
  filename: string,
  data: Buffer | string,
): Promise<ParsedFile> {
  const ext = extensionOf(filename);

  if (typeof data === "string" || isTextFile(filename)) {
    return { text: data.toString() };
  }

  if (ext === "pdf") {
    const mod = await importOptional<(b: Buffer) => Promise<{ text: string; numpages?: number }>>(
      "pdf-parse",
    );
    const result = await mod(data as Buffer);
    return { text: result.text, pages: result.numpages };
  }

  if (ext === "docx") {
    const mammoth = await importOptional<{
      extractRawText(input: { buffer: Buffer }): Promise<{ value: string }>;
    }>("mammoth");
    const result = await mammoth.extractRawText({ buffer: data as Buffer });
    return { text: result.value };
  }

  // Fallback: best-effort decode as UTF-8.
  return { text: data.toString() };
}

async function importOptional<T>(name: string): Promise<T> {
  try {
    const mod = (await import(name)) as { default?: T } & T;
    return (mod.default ?? mod) as T;
  } catch {
    throw new Error(
      `Optional dependency "${name}" is not installed. Run \`pnpm add ${name}\` to enable this file type.`,
    );
  }
}
