import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "@developeros/shared";
import {
  ProviderError,
  type ChatRequest,
  type ChatResponse,
  type EmbedRequest,
  type EmbedResponse,
  type LLMProvider,
} from "../types";

/**
 * Anthropic separates the system prompt from the message list and only accepts
 * user/assistant roles. We extract system-role messages into the system param.
 */
function splitMessages(messages: ChatMessage[], system?: string) {
  const systemParts: string[] = [];
  if (system) {
    systemParts.push(system);
  }
  const turns: { role: "user" | "assistant"; content: string }[] = [];

  for (const m of messages) {
    if (m.role === "system") {
      systemParts.push(m.content);
    } else if (m.role === "assistant") {
      turns.push({ role: "assistant", content: m.content });
    } else {
      // user + tool
      turns.push({ role: "user", content: m.content });
    }
  }

  return { system: systemParts.join("\n\n") || undefined, turns };
}

const DEFAULT_MAX_TOKENS = 4096;

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic" as const;
  private readonly client: Anthropic;

  constructor(apiKey: string | undefined = process.env.ANTHROPIC_API_KEY) {
    if (!apiKey) {
      throw new ProviderError("anthropic", "ANTHROPIC_API_KEY is not set");
    }
    this.client = new Anthropic({ apiKey });
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const { system, turns } = splitMessages(req.messages, req.system);
    const res = await this.client.messages.create({
      model: req.model,
      system,
      messages: turns,
      max_tokens: req.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: req.temperature,
    });

    const content = res.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return {
      content,
      model: res.model,
      usage: {
        promptTokens: res.usage.input_tokens,
        completionTokens: res.usage.output_tokens,
        totalTokens: res.usage.input_tokens + res.usage.output_tokens,
      },
    };
  }

  async *stream(req: ChatRequest): AsyncIterable<string> {
    const { system, turns } = splitMessages(req.messages, req.system);
    const stream = this.client.messages.stream({
      model: req.model,
      system,
      messages: turns,
      max_tokens: req.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: req.temperature,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  }

  async embed(_req: EmbedRequest): Promise<EmbedResponse> {
    throw new ProviderError(
      "anthropic",
      "embeddings are not supported; use an OpenAI embedding model",
    );
  }
}
