import winston from "winston";

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${stack || message}${metaStr}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});

/**
 * Single choke point for unexpected errors. Every uncaught exception,
 * unhandled rejection, and Express error-middleware invocation flows
 * through here, so this is where an external error-monitoring service
 * (Sentry, Datadog, etc.) would be wired in once credentials exist:
 *   if (process.env.SENTRY_DSN) Sentry.captureException(error, { extra: context });
 */
export function reportError(error, context = {}) {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(err.message, { stack: err.stack, ...context });
}

export default logger;
