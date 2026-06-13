import type { AgentType, ModelId } from "@developeros/shared";
import type { ChatRunner } from "../types";
import { BaseAgent } from "./base";

export class ArchitectAgent extends BaseAgent {
  readonly type: AgentType = "architect";
  protected readonly systemPrompt =
    "You are the Architect agent in DeveloperOS. You turn a request into a clear, " +
    "actionable technical plan. You think in terms of components, data flow, and risks.";
  protected readonly instruction =
    "Produce a concise implementation plan: list the files/modules to create or " +
    "change, the key decisions, and an ordered task breakdown the Coder agent can follow.";

  constructor(runner: ChatRunner, model: ModelId = "anthropic:claude-3-5-sonnet") {
    super(runner, model);
  }
}
