import type { RequestHandler } from 'express';
import { verifyAuthToken } from '../lib/jwt';
import { UnauthorizedError } from '../errors/AppError';
import { ErrorMessages } from '../constants/errorMessages.constants';
import { BEARER_PREFIX } from '../constants/auth.constants';

/**
 * @description Verifies the request's Bearer token and attaches req.admin, or throws UnauthorizedError.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('Authorization');
  const token = header?.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length) : undefined;

  if (!token) {
    throw new UnauthorizedError(ErrorMessages.MISSING_AUTH_HEADER);
  }

  const { adminId } = verifyAuthToken(token);
  req.admin = { id: adminId };
  next();
};
