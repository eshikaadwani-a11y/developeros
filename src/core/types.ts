/**
 * Core type definitions shared across DeveloperOS.
 */

import type { Logger } from "./logger";

/** Parsed command-line input passed to a command handler. */
export interface CommandContext {
  /** Positional arguments after the command name. */
  args: string[];
  /** Parsed flags (e.g. --json -> { json: true }, --name=x -> { name: "x" }). */
  flags: Record<string, string | boolean>;
  /** Shared logger instance. */
  logger: Logger;
}

/** Result returned by a command handler. */
export interface CommandResult {
  /** Process exit code. 0 = success. */
  exitCode: number;
}

/** A registrable DeveloperOS command. */
export interface Command {
  /** Command name as typed on the CLI (e.g. "status"). */
  name: string;
  /** One-line summary shown in help output. */
  description: string;
  /** Optional usage string (e.g. "task add <title>"). */
  usage?: string;
  /** Handler invoked when the command is run. */
  run(ctx: CommandContext): Promise<CommandResult> | CommandResult;
}
