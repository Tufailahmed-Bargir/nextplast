type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

function emit(payload: LogPayload): void {
  const line = JSON.stringify(payload);
  switch (payload.level) {
    case "debug":
      if (process.env.NODE_ENV === "development") console.debug(line);
      break;
    case "info":
      console.info(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
  }
}

/**
 * Structured logger for server-side use.
 * Swap implementation later for a hosted log sink without changing call sites.
 */
export const logger = {
  debug(message: string, meta?: Record<string, unknown>, context?: string) {
    emit({ level: "debug", message, meta, context, timestamp: new Date().toISOString() });
  },
  info(message: string, meta?: Record<string, unknown>, context?: string) {
    emit({ level: "info", message, meta, context, timestamp: new Date().toISOString() });
  },
  warn(message: string, meta?: Record<string, unknown>, context?: string) {
    emit({ level: "warn", message, meta, context, timestamp: new Date().toISOString() });
  },
  error(message: string, meta?: Record<string, unknown>, context?: string) {
    emit({ level: "error", message, meta, context, timestamp: new Date().toISOString() });
  },
};
