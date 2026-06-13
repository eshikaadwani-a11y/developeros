/**
 * Provider registry enabling dynamic model switching by `provider:model` id.
 * Providers are lazily instantiated on first use, so an unused provider with a
 * missing API key never blocks startup.
 */

import type { ModelId, ProviderName, TokenUsage } from "@developeros/shared";
import type {
  ChatRequest,
  ChatResponse,
  EmbedResponse,
  LLMProvider,
} from "./types";
import { parseModelId } from "./modelId";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { estimateCost } from "./cost";

type ProviderFactory = () => LLMProvider;

const defaultFactories: Record<ProviderName, ProviderFactory> = {
  openai: () => new OpenAIProvider(),
  anthropic: () => new AnthropicProvider(),
};

export interface ChatResult extends ChatResponse {
  modelId: ModelId;
  costUsd: number;
}

export class ProviderRegistry {
  private readonly instances = new Map<ProviderName, LLMProvider>();

  constructor(
    private readonly factories: Record<ProviderName, ProviderFactory> = defaultFactories,
  ) {}

  /** Override/register a provider instance (useful for tests/mocks). */
  register(provider: LLMProvider): void {
    this.instances.set(provider.name, provider);
  }

  getProvider(name: ProviderName): LLMProvider {
    let instance = this.instances.get(name);
    if (!instance) {
      instance = this.factories[name]();
      this.instances.set(name, instance);
    }
    return instance;
  }

  /** Run a completion against any `provider:model` id. */
  async chat(
    modelId: ModelId | string,
    req: Omit<ChatRequest, "model">,
  ): Promise<ChatResult> {
    const { provider, model } = parseModelId(modelId);
    const response = await this.getProvider(provider).chat({ ...req, model });
    return {
      ...response,
      modelId: modelId as ModelId,
      costUsd: estimateCost(modelId, response.usage),
    };
  }

  /** Stream a completion against any `provider:model` id. */
  stream(
    modelId: ModelId | string,
    req: Omit<ChatRequest, "model">,
  ): AsyncIterable<string> {
    const { provider, model } = parseModelId(modelId);
    return this.getProvider(provider).stream({ ...req, model });
  }

  /** Embed text against any `provider:model` id. */
  async embed(
    modelId: ModelId | string,
    input: string | string[],
  ): Promise<{ embeddings: number[][]; usage: { totalTokens: number } }> {
    const { provider, model } = parseModelId(modelId);
    return this.getProvider(provider).embed({ model, input });
  }
}

/** A shared default registry. */
export const registry = new ProviderRegistry();

export type { TokenUsage, EmbedResponse };
