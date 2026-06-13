/**
 * Shared agent implementation. Concrete agents supply a system prompt and a
 * task-specific instruction; the base handles prompt composition, the LLM call
 * via the injected ChatRunner, and recording results into the context.
 */

import type { AgentType, ModelId } from "@developeros/shared";
import type {
  Agent,
  AgentResult,
  AgentRunInput,
  ChatRunner,
} from "../types";

export abstract class BaseAgent implements Agent {
  abstract readonly type: AgentType;
  protected abstract readonly systemPrompt: string;
  protected abstract readonly instruction: string;

  constructor(
    protected readonly runner: ChatRunner,
    public readonly model: ModelId,
    protected readonly temperature = 0.2,
  ) {}

  /** Compose the user message from the request plus prior artifacts. */
  protected composePrompt(input: AgentRunInput): string {
    return [
      this.instruction,
      "",
      "## User request",
      input.request,
      "",
      "## Prior work",
      input.context.artifactsAsText(),
    ].join("\n");
  }

  async run(input: AgentRunInput): Promise<AgentResult> {
    const content = this.composePrompt(input);

    const result = await this.runner.chat(this.model, {
      system: this.systemPrompt,
      temperature: this.temperature,
      messages: [{ role: "user", content }],
    });

    input.context.addArtifact({
      agent: this.type,
      name: `${this.type}-output`,
      content: result.content,
    });
    input.context.addMessage({
      role: "assistant",
      name: this.type,
      content: result.content,
    });

    return {
      agent: this.type,
      output: result.content,
      model: result.modelId,
      usage: result.usage,
      costUsd: result.costUsd,
    };
  }
}
