/**
 * Minimal structured logger interface so packages don't depend on a concrete
 * logging library. The web app can swap in a richer sink (e.g. pino).
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const line = JSON.stringify({
    level,
    message,
    ...(meta ?? {}),
    time: new Date().toISOString(),
  });
  if (level === "error" || level === "warn") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const consoleLogger: Logger = {
  debug: (m, meta) => emit("debug", m, meta),
  info: (m, meta) => emit("info", m, meta),
  warn: (m, meta) => emit("warn", m, meta),
  error: (m, meta) => emit("error", m, meta),
};
