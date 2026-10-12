import type { Request } from 'express';
import { rateLimit, type Options } from 'express-rate-limit';
import { TooManyRequestsError } from '../errors/AppError';
import { ErrorMessages } from '../constants/errorMessages.constants';
import {
  ADMIN_API_RATE_LIMIT,
  AGGREGATION_RATE_LIMIT,
  LOGIN_RATE_LIMIT,
  PLAYBACK_EVENTS_RATE_LIMIT,
  PUBLIC_READ_RATE_LIMIT,
  UPLOAD_RATE_LIMIT,
} from '../constants/rateLimit.constants';

// A window and the most requests allowed in it - the shape of each entry in rateLimit.constants.ts.
type RateLimitConfig = Pick<Options, 'windowMs' | 'limit'>;

/**
 * @description Turns a Retry-After value in seconds into "N seconds" / "N minutes" for the error message.
 */
const formatRetryAfter = (seconds: number) => {
  const [value, unit] = seconds < 60 ? [seconds, 'second'] : [Math.ceil(seconds / 60), 'minute'];
  return `${value} ${unit}${value === 1 ? '' : 's'}`;
};

/**
 * @description Builds a limiter that counts per IP by default. Counters live in this process's
 * memory, so they reset on restart and aren't shared across instances. Over the limit, it hands a
 * TooManyRequestsError to errorHandler, so a 429 has the same body as every other error.
 */
const createRateLimiter = (
  { windowMs, limit }: RateLimitConfig,
  message: string,
  options: Partial<Options> = {},
) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res, next) => {
      const retryAfter = formatRetryAfter(Number(res.getHeader('Retry-After')));
      next(new TooManyRequestsError(`${message} - try again in ${retryAfter}`));
    },
    ...options,
  });

// Must run after requireAuth, which sets req.admin.
const adminKeyGenerator = (req: Request) => req.admin!.id;

export const loginRateLimiter = createRateLimiter(
  LOGIN_RATE_LIMIT,
  ErrorMessages.TOO_MANY_LOGIN_ATTEMPTS,
  { skipSuccessfulRequests: true },
);

export const playbackEventsRateLimiter = createRateLimiter(
  PLAYBACK_EVENTS_RATE_LIMIT,
  ErrorMessages.TOO_MANY_REQUESTS,
);

export const publicReadRateLimiter = createRateLimiter(
  PUBLIC_READ_RATE_LIMIT,
  ErrorMessages.TOO_MANY_REQUESTS,
);

export const adminApiRateLimiter = createRateLimiter(
  ADMIN_API_RATE_LIMIT,
  ErrorMessages.TOO_MANY_REQUESTS,
  { keyGenerator: adminKeyGenerator },
);

export const uploadRateLimiter = createRateLimiter(
  UPLOAD_RATE_LIMIT,
  ErrorMessages.TOO_MANY_UPLOADS,
  { keyGenerator: adminKeyGenerator },
);

export const aggregationRateLimiter = createRateLimiter(
  AGGREGATION_RATE_LIMIT,
  ErrorMessages.TOO_MANY_REQUESTS,
  { keyGenerator: adminKeyGenerator },
);
