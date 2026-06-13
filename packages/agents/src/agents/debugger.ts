import type { AgentType, ModelId } from "@developeros/shared";
import type { ChatRunner } from "../types";
import { BaseAgent } from "./base";

export class DebuggerAgent extends BaseAgent {
  readonly type: AgentType = "debugger";
  protected readonly systemPrompt =
    "You are the Debugger agent in DeveloperOS. You resolve the issues raised in review " +
    "and any failing checks, producing a corrected final implementation.";
  protected readonly instruction =
    "Apply fixes for every blocker/major issue the Reviewer raised. Output the final, " +
    "corrected code changes grouped by file path, and a short changelog of what you fixed.";

  constructor(runner: ChatRunner, model: ModelId = "openai:gpt-4o") {
    super(runner, model);
  }
}
