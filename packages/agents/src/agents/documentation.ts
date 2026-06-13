import type { AgentType, ModelId } from "@developeros/shared";
import type { ChatRunner } from "../types";
import { BaseAgent } from "./base";

export class DocumentationAgent extends BaseAgent {
  readonly type: AgentType = "documentation";
  protected readonly systemPrompt =
    "You are the Documentation agent in DeveloperOS. You write clear docs and summaries " +
    "for shipped work so humans can understand and maintain it.";
  protected readonly instruction =
    "Write concise documentation for the final implementation: what changed, how to use " +
    "it, and any follow-ups. Prefer a short README-style section with examples.";

  constructor(runner: ChatRunner, model: ModelId = "openai:gpt-4o-mini") {
    super(runner, model);
  }
}
