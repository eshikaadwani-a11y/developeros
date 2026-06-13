import type { AgentType, ModelId } from "@developeros/shared";
import type { ChatRunner } from "../types";
import { BaseAgent } from "./base";

export class ResearchAgent extends BaseAgent {
  readonly type: AgentType = "research";
  protected readonly systemPrompt =
    "You are the Research agent in DeveloperOS. You gather and summarize the context " +
    "needed to solve a request, citing knowledge-base sources where provided.";
  protected readonly instruction =
    "Summarize the key facts, constraints, and prior-art relevant to the request. " +
    "Surface anything the Architect must know before planning. Cite sources if present.";

  constructor(runner: ChatRunner, model: ModelId = "openai:gpt-4o-mini") {
    super(runner, model);
  }
}
