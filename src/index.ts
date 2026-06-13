#!/usr/bin/env node
/**
 * DeveloperOS - entry point.
 *
 * Builds the command registry and dispatches the CLI invocation.
 */

import { App } from "./cli/app";
import { CommandRegistry } from "./cli/registry";
import { logger } from "./core/logger";

function buildRegistry(): CommandRegistry {
  const registry = new CommandRegistry();
  // Commands are registered here as they are implemented in later milestones.
  return registry;
}

export async function main(argv: string[]): Promise<number> {
  const app = new App(buildRegistry(), logger);
  return app.run(argv);
}

if (require.main === module) {
  // argv[0] = node, argv[1] = script path; the rest is user input.
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err: unknown) => {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    },
  );
}
