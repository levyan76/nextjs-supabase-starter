/**
 * Structured backend logger.
 * Emits JSON in production (parseable by Datadog, Vercel Log Drain, etc.)
 * and human-readable colored text in development.
 *
 * Usage :
 *   import { logger } from "@/lib/server/logger";
 *   logger.info("user.created", { userId, email });
 *   logger.error("user.delete_failed", { userId, error: err.message });
 *   logger.warn("rate_limit.triggered", { ip, endpoint });
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const isDev = process.env.NODE_ENV === "development";

function emit(level: LogLevel, event: string, context?: LogContext) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    app: process.env.NEXT_PUBLIC_APP_NAME ?? "app",
    env: process.env.NEXT_PUBLIC_APP_ENV ?? "unknown",
    ...context,
  };

  if (isDev) {
    const colors: Record<LogLevel, string> = {
      debug: "\x1b[90m", // grey
      info: "\x1b[36m", // cyan
      warn: "\x1b[33m", // yellow
      error: "\x1b[31m", // red
    };
    const reset = "\x1b[0m";
    const prefix = `${colors[level]}[${level.toUpperCase()}]${reset}`;
    const ctx = context ? " " + JSON.stringify(context) : "";
    console.log(`${prefix} ${entry.ts} ${event}${ctx}`);
  } else {
    // Production : JSON pur pour les log drains
    const out = level === "error" ? console.error : console.log;
    out(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (event: string, context?: LogContext) => emit("debug", event, context),
  info: (event: string, context?: LogContext) => emit("info", event, context),
  warn: (event: string, context?: LogContext) => emit("warn", event, context),
  error: (event: string, context?: LogContext) => emit("error", event, context),
};
