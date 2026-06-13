/**
 * Tiny argument parser. Splits argv into a command name, positional args,
 * and flags. No external dependencies.
 *
 * Supported flag forms:
 *   --json           -> { json: true }
 *   --name=value     -> { name: "value" }
 *   --name value     -> { name: "value" }   (when value is not another flag)
 *   -v               -> { v: true }
 */

export interface ParsedArgs {
  command: string | undefined;
  args: string[];
  flags: Record<string, string | boolean>;
}

function isFlag(token: string): boolean {
  return token.startsWith("-");
}

function stripDashes(token: string): string {
  return token.replace(/^-+/, "");
}

export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  let i = 0;
  while (i < argv.length) {
    const token = argv[i];

    if (isFlag(token)) {
      const body = stripDashes(token);
      const eq = body.indexOf("=");

      if (eq !== -1) {
        // --name=value
        const key = body.slice(0, eq);
        flags[key] = body.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !isFlag(next)) {
          // --name value
          flags[body] = next;
          i += 1;
        } else {
          // boolean flag
          flags[body] = true;
        }
      }
    } else {
      positionals.push(token);
    }

    i += 1;
  }

  const [command, ...rest] = positionals;
  return { command, args: rest, flags };
}
