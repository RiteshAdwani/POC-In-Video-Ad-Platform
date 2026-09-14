import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../errors/AppError';
import { ErrorMessages } from '../constants/errorMessages.constants';
import { ACCESS_TOKEN_EXPIRY } from '../constants/auth.constants';
import type { AccessTokenPayload } from '../types/auth.types';

/**
 * @description Signs a new access token for an admin, valid for {@link TACCESS_TOKEN_EXPIRY}.
 */
export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

/**
 * @description Verifies an access token and returns its payload, or throws UnauthorizedError.
 */
export const verifyAuthToken = (token: string): AccessTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
  } catch {
    throw new UnauthorizedError(ErrorMessages.INVALID_ACCESS_TOKEN);
  }
};
