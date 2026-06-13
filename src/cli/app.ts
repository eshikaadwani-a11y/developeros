/**
 * Application runner: parses argv, resolves the command, and dispatches.
 * Handles the built-in --help and --version flags and unknown commands.
 */

import { APP_BIN, APP_NAME, APP_TAGLINE, APP_VERSION } from "../core/meta";
import type { Logger } from "../core/logger";
import { parseArgs } from "./parser";
import { CommandRegistry } from "./registry";

export class App {
  constructor(
    private readonly registry: CommandRegistry,
    private readonly logger: Logger,
  ) {}

  async run(argv: string[]): Promise<number> {
    const { command, args, flags } = parseArgs(argv);

    // Global flags take precedence when no command is given.
    if (!command) {
      if (flags.version || flags.v) {
        this.printVersion();
        return 0;
      }
      this.printHelp();
      return 0;
    }

    if (command === "help") {
      const topic = args[0];
      this.printHelp(topic);
      return 0;
    }

    if (command === "version") {
      this.printVersion();
      return 0;
    }

    const cmd = this.registry.get(command);
    if (!cmd) {
      this.logger.error(`unknown command: ${command}`);
      this.logger.info(`Run \`${APP_BIN} help\` to see available commands.`);
      return 1;
    }

    // Per-command help: `dev <command> --help`
    if (flags.help || flags.h) {
      this.printCommandHelp(command);
      return 0;
    }

    try {
      const result = await cmd.run({ args, flags, logger: this.logger });
      return result.exitCode;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(message);
      return 1;
    }
  }

  private printVersion(): void {
    this.logger.info(`${APP_NAME} v${APP_VERSION}`);
  }

  private printHelp(topic?: string): void {
    if (topic) {
      this.printCommandHelp(topic);
      return;
    }

    this.logger.heading(`${APP_NAME} v${APP_VERSION}`);
    this.logger.dim(APP_TAGLINE);
    this.logger.info("");
    this.logger.info(`Usage: ${APP_BIN} <command> [options]`);
    this.logger.info("");
    this.logger.heading("Commands:");

    const commands = this.registry.list();
    if (commands.length === 0) {
      this.logger.dim("  (no commands registered yet)");
    } else {
      const width = Math.max(...commands.map((c) => c.name.length));
      for (const c of commands) {
        this.logger.info(`  ${c.name.padEnd(width)}  ${c.description}`);
      }
    }

    this.logger.info("");
    this.logger.heading("Global options:");
    this.logger.info("  --help, -h     Show help");
    this.logger.info("  --version, -v  Show version");
  }

  private printCommandHelp(name: string): void {
    const cmd = this.registry.get(name);
    if (!cmd) {
      this.logger.error(`unknown command: ${name}`);
      return;
    }
    this.logger.heading(cmd.name);
    this.logger.info(cmd.description);
    if (cmd.usage) {
      this.logger.info("");
      this.logger.info(`Usage: ${APP_BIN} ${cmd.usage}`);
    }
  }
}
