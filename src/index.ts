#!/usr/bin/env node
/**
 * DeveloperOS - entry point.
 *
 * Milestone 1 establishes the foundation (logger, types, metadata).
 * The command router is wired up in later milestones.
 */

import { logger } from "./core/logger";
import { APP_NAME, APP_TAGLINE, APP_VERSION } from "./core/meta";

function main(): number {
  logger.heading(`${APP_NAME} v${APP_VERSION}`);
  logger.dim(APP_TAGLINE);
  return 0;
}

if (require.main === module) {
  process.exit(main());
}

export { main };
