/**
 * Vector similarity helpers used by the in-memory vector store and for
 * reranking. Pure functions — no dependencies.
 */

export function dot(a: number[], b: number[]): number {
  let sum = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    sum += a[i]! * b[i]!;
  }
  return sum;
}

export function magnitude(a: number[]): number {
  return Math.sqrt(dot(a, a));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const denom = magnitude(a) * magnitude(b);
  if (denom === 0) {
    return 0;
  }
  return dot(a, b) / denom;
}
