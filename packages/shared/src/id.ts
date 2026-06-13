/**
 * ID and time helpers. Uses the Web Crypto API which is available in Node 20+
 * and all modern browsers/edge runtimes.
 */

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
