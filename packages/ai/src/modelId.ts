/**
 * Helpers for the `provider:model` identifier scheme, kept free of provider
 * imports so the parsing logic is independently testable.
 */

import type { ModelId, ProviderName } from "@developeros/shared";

const PROVIDERS: ProviderName[] = ["openai", "anthropic"];

export interface ParsedModelId {
  provider: ProviderName;
  model: string;
}

export function parseModelId(modelId: string): ParsedModelId {
  const idx = modelId.indexOf(":");
  if (idx <= 0 || idx === modelId.length - 1) {
    throw new Error(
      `Invalid model id "${modelId}". Expected "<provider>:<model>", e.g. "openai:gpt-4o".`,
    );
  }
  const provider = modelId.slice(0, idx) as ProviderName;
  const model = modelId.slice(idx + 1);
  if (!PROVIDERS.includes(provider)) {
    throw new Error(
      `Unknown provider "${provider}". Supported: ${PROVIDERS.join(", ")}.`,
    );
  }
  return { provider, model };
}

export function formatModelId(provider: ProviderName, model: string): ModelId {
  return `${provider}:${model}`;
}

export function isValidModelId(modelId: string): boolean {
  try {
    parseModelId(modelId);
    return true;
  } catch {
    return false;
  }
}
