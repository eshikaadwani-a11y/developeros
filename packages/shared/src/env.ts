/**
 * Centralized environment validation. Import `getEnv()` anywhere that needs
 * configuration; misconfiguration fails fast with a readable error.
 */

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  ML_SERVICE_URL: z.string().url().default("http://localhost:8000"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Parse and cache environment variables. Pass an explicit source for tests.
 */
export function getEnv(source: Record<string, string | undefined> = process.env): Env {
  if (cached) {
    return cached;
  }
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** Test helper to reset the memoized env. */
export function resetEnvCache(): void {
  cached = undefined;
}
