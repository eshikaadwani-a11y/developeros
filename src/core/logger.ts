/**
 * Minimal zero-dependency logger with ANSI colors.
 * Colors are automatically disabled when output is not a TTY or when
 * NO_COLOR is set (https://no-color.org/).
 */

const COLOR_ENABLED =
  process.env.NO_COLOR === undefined && Boolean(process.stdout.isTTY);

const codes = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
} as const;

type ColorName = keyof typeof codes;

function paint(text: string, color: ColorName): string {
  if (!COLOR_ENABLED) {
    return text;
  }
  return `${codes[color]}${text}${codes.reset}`;
}

export class Logger {
  info(message: string): void {
    process.stdout.write(`${message}\n`);
  }

  success(message: string): void {
    process.stdout.write(`${paint("✓", "green")} ${message}\n`);
  }

  warn(message: string): void {
    process.stderr.write(`${paint("warning:", "yellow")} ${message}\n`);
  }

  error(message: string): void {
    process.stderr.write(`${paint("error:", "red")} ${message}\n`);
  }

  heading(message: string): void {
    process.stdout.write(`${paint(message, "bold")}\n`);
  }

  dim(message: string): void {
    process.stdout.write(`${paint(message, "gray")}\n`);
  }

  /** Apply a color to a string without writing it (for inline composition). */
  color(text: string, color: ColorName): string {
    return paint(text, color);
  }
}

/** Shared default logger instance. */
export const logger = new Logger();
