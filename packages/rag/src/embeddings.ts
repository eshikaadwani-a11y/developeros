/**
 * Embedding client backed by the @developeros/ai provider registry. The
 * registry is injected (type-only import) so this module stays decoupled from
 * the concrete AI SDKs.
 */

import type { EmbeddingClient } from "./types";

interface RegistryLike {
  embed(
    modelId: string,
    input: string | string[],
  ): Promise<{ embeddings: number[][]; usage: { totalTokens: number } }>;
}

export const DEFAULT_EMBEDDING_MODEL = "openai:text-embedding-3-small";

export function createRegistryEmbeddingClient(
  registry: RegistryLike,
  model: string = DEFAULT_EMBEDDING_MODEL,
): EmbeddingClient {
  return {
    model,
    async embed(texts: string[]): Promise<number[][]> {
      if (texts.length === 0) return [];
      const res = await registry.embed(model, texts);
      return res.embeddings;
    },
  };
}
