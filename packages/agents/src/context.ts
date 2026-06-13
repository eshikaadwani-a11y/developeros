/**
 * Shared orchestration context. Every agent stage reads prior artifacts and
 * messages from here and writes its own — this is the single channel through
 * which agents communicate (no hidden global state).
 */

import type { ChatMessage } from "@developeros/shared";
import type { AgentArtifact, AgentContextLike } from "./types";

export class AgentContext implements AgentContextLike {
  private readonly artifacts: AgentArtifact[] = [];
  private readonly messages: ChatMessage[] = [];
  private readonly scratch = new Map<string, unknown>();

  constructor(public readonly request: string) {}

  addArtifact(artifact: AgentArtifact): void {
    this.artifacts.push(artifact);
  }

  getArtifacts(): AgentArtifact[] {
    return [...this.artifacts];
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  get(key: string): unknown {
    return this.scratch.get(key);
  }

  set(key: string, value: unknown): void {
    this.scratch.set(key, value);
  }

  /** Render accumulated artifacts as a prompt-friendly block. */
  artifactsAsText(): string {
    if (this.artifacts.length === 0) {
      return "(no prior artifacts)";
    }
    return this.artifacts
      .map((a) => `### ${a.agent} — ${a.name}\n${a.content}`)
      .join("\n\n");
  }
}
