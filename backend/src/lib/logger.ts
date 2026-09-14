import pino from 'pino';
import { env } from '../config/env';

/**
 * @description Shared Pino logger instance - debug-level with pretty-printing in dev, info-level
 * with plain JSON in production.
 */
export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  // pino-pretty is dev-only tooling (not installed in the production image) - plain JSON lines
  // in production are what log aggregators (and pino itself) actually expect.
  transport: env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
});
