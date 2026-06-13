/**
 * Command registry. Holds the set of available commands and provides
 * lookup by name.
 */

import type { Command } from "../core/types";

export class CommandRegistry {
  private readonly commands = new Map<string, Command>();

  register(command: Command): this {
    if (this.commands.has(command.name)) {
      throw new Error(`Command already registered: ${command.name}`);
    }
    this.commands.set(command.name, command);
    return this;
  }

  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  has(name: string): boolean {
    return this.commands.has(name);
  }

  list(): Command[] {
    return [...this.commands.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }
}
