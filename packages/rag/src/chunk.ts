/**
 * Token-aware text chunking with overlap. Token counts are approximated as
 * ~4 characters/token (good enough for budgeting without a tokenizer dep).
 * Chunk boundaries are nudged to the nearest natural break (newline/sentence/
 * space) so chunks don't split mid-word.
 */

import type { Chunk, ChunkOptions } from "./types";

const CHARS_PER_TOKEN = 4;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function chunkText(input: string, opts: ChunkOptions = {}): Chunk[] {
  const maxChars = (opts.maxTokens ?? 400) * CHARS_PER_TOKEN;
  const overlapChars = Math.min(
    (opts.overlapTokens ?? 50) * CHARS_PER_TOKEN,
    Math.floor(maxChars / 2),
  );

  const text = input.replace(/\r\n/g, "\n").trim();
  if (!text) {
    return [];
  }

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);

    if (end < text.length) {
      const window = text.slice(start, end);
      const candidates = [
        window.lastIndexOf("\n\n"),
        window.lastIndexOf("\n"),
        window.lastIndexOf(". "),
        window.lastIndexOf(" "),
      ];
      const breakAt = Math.max(...candidates);
      // Only honor the break if it isn't too early (avoid tiny chunks).
      if (breakAt > maxChars * 0.5) {
        end = start + breakAt + 1;
      }
    }

    const content = text.slice(start, end).trim();
    if (content) {
      chunks.push({ content, index, startChar: start, endChar: end });
      index += 1;
    }

    if (end >= text.length) {
      break;
    }
    start = Math.max(end - overlapChars, start + 1);
  }

  return chunks;
}
