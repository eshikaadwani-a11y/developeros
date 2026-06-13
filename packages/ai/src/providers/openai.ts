import OpenAI from "openai";
import type { ChatMessage } from "@developeros/shared";
import {
  ProviderError,
  type ChatRequest,
  type ChatResponse,
  type EmbedRequest,
  type EmbedResponse,
  type LLMProvider,
} from "../types";

type OpenAIRole = "system" | "user" | "assistant";

function toOpenAIMessages(
  messages: ChatMessage[],
  system?: string,
): { role: OpenAIRole; content: string }[] {
  const out: { role: OpenAIRole; content: string }[] = [];
  if (system) {
    out.push({ role: "system", content: system });
  }
  for (const m of messages) {
    // "tool" messages are flattened to user context for portability.
    const role: OpenAIRole = m.role === "tool" ? "user" : m.role;
    out.push({ role, content: m.content });
  }
  return out;
}

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai" as const;
  private readonly client: OpenAI;

  constructor(apiKey: string | undefined = process.env.OPENAI_API_KEY) {
    if (!apiKey) {
      throw new ProviderError("openai", "OPENAI_API_KEY is not set");
    }
    this.client = new OpenAI({ apiKey });
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const res = await this.client.chat.completions.create({
      model: req.model,
      messages: toOpenAIMessages(req.messages, req.system),
      temperature: req.temperature,
      max_tokens: req.maxTokens,
    });

    const choice = res.choices[0];
    return {
      content: choice?.message?.content ?? "",
      model: res.model,
      usage: {
        promptTokens: res.usage?.prompt_tokens ?? 0,
        completionTokens: res.usage?.completion_tokens ?? 0,
        totalTokens: res.usage?.total_tokens ?? 0,
      },
    };
  }

  async *stream(req: ChatRequest): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: req.model,
      messages: toOpenAIMessages(req.messages, req.system),
      temperature: req.temperature,
      max_tokens: req.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }

  async embed(req: EmbedRequest): Promise<EmbedResponse> {
    const res = await this.client.embeddings.create({
      model: req.model,
      input: req.input,
    });
    return {
      embeddings: res.data.map((d) => d.embedding),
      usage: { totalTokens: res.usage?.total_tokens ?? 0 },
    };
  }
}
