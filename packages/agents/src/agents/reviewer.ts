import type { AgentType, ModelId } from "@developeros/shared";
import type { ChatRunner } from "../types";
import { BaseAgent } from "./base";

export class ReviewerAgent extends BaseAgent {
  readonly type: AgentType = "reviewer";
  protected readonly systemPrompt =
    "You are the Reviewer agent in DeveloperOS. You critique code changes for " +
    "correctness, security, performance, and maintainability.";
  protected readonly instruction =
    "Review the Coder's changes against the Architect's plan. List concrete issues by " +
    "severity (blocker/major/minor) with suggested fixes. If it is clean, say so.";

  constructor(runner: ChatRunner, model: ModelId = "anthropic:claude-3-5-sonnet") {
    super(runner, model);
  }
}
