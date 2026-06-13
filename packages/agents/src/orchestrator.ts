/**
 * Orchestration engine. Runs agents in sequence, threading a shared
 * AgentContext between stages:
 *
 *   (Research?) -> Architect -> Coder -> Reviewer -> Debugger -> (Documentation?)
 *
 * Research and Documentation are optional and enabled by default.
 */

import type { AgentType, ModelId } from "@developeros/shared";
import { AgentContext } from "./context";
import type { Agent, AgentResult, ChatRunner } from "./types";
import { ArchitectAgent } from "./agents/architect";
import { CoderAgent } from "./agents/coder";
import { ReviewerAgent } from "./agents/reviewer";
import { DebuggerAgent } from "./agents/debugger";
import { ResearchAgent } from "./agents/research";
import { DocumentationAgent } from "./agents/documentation";

export interface OrchestrationOptions {
  /** Override the model for every agent (otherwise each agent's default is used). */
  model?: ModelId;
  includeResearch?: boolean;
  includeDocumentation?: boolean;
  /** Called after each stage completes (for streaming progress to a UI). */
  onStage?: (result: AgentResult) => void;
}

export interface OrchestrationResult {
  request: string;
  results: AgentResult[];
  /** The final, user-facing output (Documentation if run, else Debugger). */
  finalOutput: string;
  totalCostUsd: number;
  totalTokens: number;
  pipeline: AgentType[];
}

export class Orchestrator {
  constructor(private readonly runner: ChatRunner) {}

  buildPipeline(opts: OrchestrationOptions = {}): Agent[] {
    const { model } = opts;
    const includeResearch = opts.includeResearch ?? true;
    const includeDocumentation = opts.includeDocumentation ?? true;

    const pipeline: Agent[] = [];
    if (includeResearch) {
      pipeline.push(new ResearchAgent(this.runner, model));
    }
    pipeline.push(new ArchitectAgent(this.runner, model));
    pipeline.push(new CoderAgent(this.runner, model));
    pipeline.push(new ReviewerAgent(this.runner, model));
    pipeline.push(new DebuggerAgent(this.runner, model));
    if (includeDocumentation) {
      pipeline.push(new DocumentationAgent(this.runner, model));
    }
    return pipeline;
  }

  async run(
    request: string,
    opts: OrchestrationOptions = {},
  ): Promise<OrchestrationResult> {
    const context = new AgentContext(request);
    context.addMessage({ role: "user", content: request });

    const pipeline = this.buildPipeline(opts);
    const results: AgentResult[] = [];

    for (const agent of pipeline) {
      const result = await agent.run({ request, context });
      results.push(result);
      opts.onStage?.(result);
    }

    const finalOutput = results.length > 0 ? results[results.length - 1]!.output : "";
    const totalCostUsd = Number(
      results.reduce((sum, r) => sum + r.costUsd, 0).toFixed(6),
    );
    const totalTokens = results.reduce((sum, r) => sum + r.usage.totalTokens, 0);

    return {
      request,
      results,
      finalOutput,
      totalCostUsd,
      totalTokens,
      pipeline: pipeline.map((a) => a.type),
    };
  }
}
