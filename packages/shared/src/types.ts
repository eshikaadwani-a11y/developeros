/**
 * Cross-cutting domain types shared between the web app, database layer,
 * AI/agent packages, and the RAG system.
 */

export type ID = string;

export type ISODateString = string;

/** OAuth providers supported by NextAuth. */
export type AuthProvider = "github" | "google";

/** Supported LLM provider identifiers. */
export type ProviderName = "openai" | "anthropic";

/** Fully-qualified model id, e.g. "openai:gpt-4o". */
export type ModelId = `${ProviderName}:${string}`;

/** The agents that make up the orchestration pipeline. */
export type AgentType =
  | "architect"
  | "coder"
  | "reviewer"
  | "debugger"
  | "research"
  | "documentation";

export type TaskStatus = "pending" | "in_progress" | "blocked" | "done" | "failed";

export type ProjectStatus = "active" | "archived";

export interface User {
  id: ID;
  email: string;
  name?: string;
  image?: string;
  provider?: AuthProvider;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Project {
  id: ID;
  ownerId: ID;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Task {
  id: ID;
  projectId: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedAgent?: AgentType;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface DocumentMeta {
  id: ID;
  projectId: ID;
  ownerId: ID;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  /** Number of chunks produced after ingestion. */
  chunkCount: number;
  createdAt: ISODateString;
}

/** A single retrievable chunk with its embedding and citation metadata. */
export interface KnowledgeChunk {
  id: ID;
  documentId: ID;
  projectId: ID;
  content: string;
  embedding: number[];
  /** Ordinal position of the chunk within its source document. */
  index: number;
  metadata: {
    filename: string;
    page?: number;
    startChar?: number;
    endChar?: number;
  };
  createdAt: ISODateString;
}

export type MessageRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
  role: MessageRole;
  content: string;
  /** Optional name of the agent or tool that produced the message. */
  name?: string;
}

export interface Conversation {
  id: ID;
  projectId: ID;
  userId: ID;
  title: string;
  messages: ChatMessage[];
  model: ModelId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** A single usage/cost event recorded for analytics. */
export interface AnalyticsEvent {
  id: ID;
  type:
    | "agent_run"
    | "token_usage"
    | "query"
    | "model_performance"
    | "cost";
  projectId?: ID;
  userId?: ID;
  model?: ModelId;
  agent?: AgentType;
  /** Arbitrary numeric payload (tokens, ms, usd, count, …). */
  value: number;
  metadata?: Record<string, unknown>;
  createdAt: ISODateString;
}

/** Token accounting returned by an LLM call. */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
