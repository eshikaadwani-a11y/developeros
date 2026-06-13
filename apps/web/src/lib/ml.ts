/**
 * Client for the Python ML microservice (services/ml). The base URL is read
 * from ML_SERVICE_URL.
 */

const BASE = process.env.ML_SERVICE_URL ?? "http://localhost:8000";

export async function mlFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail ?? data?.error ?? `ML service error (${res.status})`);
  }
  return data as T;
}
