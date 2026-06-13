/**
 * Token pricing and cost estimation. Prices are USD per 1M tokens and should be
 * reviewed against current provider pricing. Used to feed the analytics layer.
 */

import type { ModelId, TokenUsage } from "@developeros/shared";

interface Price {
  /** USD per 1M input tokens. */
  input: number;
  /** USD per 1M output tokens. */
  output: number;
}

const PRICING: Record<string, Price> = {
  "openai:gpt-4o": { input: 2.5, output: 10 },
  "openai:gpt-4o-mini": { input: 0.15, output: 0.6 },
  "openai:text-embedding-3-small": { input: 0.02, output: 0 },
  "openai:text-embedding-3-large": { input: 0.13, output: 0 },
  "anthropic:claude-3-5-sonnet": { input: 3, output: 15 },
  "anthropic:claude-3-5-haiku": { input: 0.8, output: 4 },
};

/** Estimate USD cost for a given model id and token usage. Returns 0 if unknown. */
export function estimateCost(modelId: ModelId | string, usage: TokenUsage): number {
  const price = PRICING[modelId];
  if (!price) {
    return 0;
  }
  const input = (usage.promptTokens / 1_000_000) * price.input;
  const output = (usage.completionTokens / 1_000_000) * price.output;
  return Number((input + output).toFixed(6));
}

export function knownModels(): string[] {
  return Object.keys(PRICING);
}
