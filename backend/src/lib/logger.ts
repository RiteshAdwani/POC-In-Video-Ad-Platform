import pino from 'pino';
import { env } from '../config/env';
import { LOG_LEVEL_BY_ENV, LOG_REDACT_PATHS } from '../constants/logger.constants';

/**
 * @description Shared Pino logger instance - debug-level with pretty-printing in dev, info-level
 * with plain JSON in production, silent under the automated tests.
 */
export const logger = pino({
  level: LOG_LEVEL_BY_ENV[env.NODE_ENV],
  // pino-pretty is dev-only tooling (not installed in the production image) - plain JSON lines
  // in production are what log aggregators (and pino itself) actually expect.
  transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  // The access log records request headers - keep a usable admin token out of it.
  redact: { paths: LOG_REDACT_PATHS, censor: '[REDACTED]' },
});
