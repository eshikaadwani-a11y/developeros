/**
 * Agent contracts. Agents depend on the minimal `ChatRunner` interface rather
 * than on a concrete AI client, which keeps them decoupled and testable. The
 * `ProviderRegistry` from @developeros/ai satisfies `ChatRunner` structurally.
 */

import type { AgentType, ChatMessage, ModelId, TokenUsage } from "@developeros/shared";

export interface ChatRunnerRequest {
  messages: ChatMessage[];
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatRunnerResult {
  content: string;
  usage: TokenUsage;
  costUsd: number;
  modelId: string;
}

export interface ChatRunner {
  chat(modelId: ModelId | string, req: ChatRunnerRequest): Promise<ChatRunnerResult>;
}

/** A single artifact produced by an agent stage. */
export interface AgentArtifact {
  agent: AgentType;
  name: string;
  content: string;
}

export interface AgentResult {
  agent: AgentType;
  output: string;
  model: string;
  usage: TokenUsage;
  costUsd: number;
}

export interface AgentRunInput {
  request: string;
  context: AgentContextLike;
}

/** Read/write surface of the shared context that agents are allowed to use. */
export interface AgentContextLike {
  readonly request: string;
  artifactsAsText(): string;
  addArtifact(artifact: AgentArtifact): void;
  addMessage(message: ChatMessage): void;
  getArtifacts(): AgentArtifact[];
  getMessages(): ChatMessage[];
  get(key: string): unknown;
  set(key: string, value: unknown): void;
}

export interface Agent {
  readonly type: AgentType;
  readonly model: ModelId;
  run(input: AgentRunInput): Promise<AgentResult>;
}
