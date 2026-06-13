/**
 * Provider-agnostic LLM contracts. Concrete providers (OpenAI, Anthropic)
 * implement `LLMProvider`; callers depend only on this interface.
 */

import type { ChatMessage, ProviderName, TokenUsage } from "@developeros/shared";

export interface ChatRequest {
  /** Provider-local model name, e.g. "gpt-4o" (no provider prefix). */
  model: string;
  messages: ChatMessage[];
  /** Optional system prompt; merged with any system-role messages. */
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage: TokenUsage;
}

export interface EmbedRequest {
  model: string;
  input: string | string[];
}

export interface EmbedResponse {
  embeddings: number[][];
  usage: { totalTokens: number };
}

export interface LLMProvider {
  readonly name: ProviderName;
  /** Single-shot completion. */
  chat(req: ChatRequest): Promise<ChatResponse>;
  /** Streaming completion; yields content deltas. */
  stream(req: ChatRequest): AsyncIterable<string>;
  /** Embeddings. Providers that don't support embeddings throw. */
  embed(req: EmbedRequest): Promise<EmbedResponse>;
}

export class ProviderError extends Error {
  constructor(
    public readonly provider: ProviderName,
    message: string,
  ) {
    super(`[${provider}] ${message}`);
    this.name = "ProviderError";
  }
}
