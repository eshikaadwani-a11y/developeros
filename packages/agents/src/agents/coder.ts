import type { AgentType, ModelId } from "@developeros/shared";
import type { ChatRunner } from "../types";
import { BaseAgent } from "./base";

export class CoderAgent extends BaseAgent {
  readonly type: AgentType = "coder";
  protected readonly systemPrompt =
    "You are the Coder agent in DeveloperOS. You implement the Architect's plan as " +
    "clean, correct, idiomatic code with clear file boundaries.";
  protected readonly instruction =
    "Implement the plan from the prior work. Output the code changes grouped by file " +
    "path, using fenced code blocks. Keep changes minimal and consistent with the plan.";

  constructor(runner: ChatRunner, model: ModelId = "openai:gpt-4o") {
    super(runner, model);
  }
}
