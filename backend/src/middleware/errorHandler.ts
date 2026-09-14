import type { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z, ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../constants/errorCodes.constants';
import { ErrorMessages } from '../constants/errorMessages.constants';

/**
 * @description Turns any thrown/rejected error into the API's standard JSON error shape. 4 parameters is
 * what tells Express this is an error handler, not a regular middleware - it's the only signal
 * Express uses to tell them apart. Must be registered last, after every route, so it actually
 * sits downstream of everything that can throw.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    // Exactly one entry for a plain AppError. The top-level message mirrors it so a simple client can read `message`
    // alone, while a thorough one can still iterate `errors` for full detail.
    res.status(err.statusCode).json({
      errors: [{ code: err.code, details: err.message }],
      message: err.message,
    });
    return;
  }

  // A schema.parse(req.body) failure - not one of our AppError subclasses, but still an
  // expected/well-formed failure, not a bug. One array entry per failing field, since multiple
  // fields can fail validation at once for different reasons.
  if (err instanceof ZodError) {
    // flattenError's generic can't be inferred here (this handler doesn't know the originating
    // schema's shape) - the real runtime shape is always Record<field, string[] | undefined>.
    const fieldErrors = z.flattenError(err).fieldErrors as Record<string, string[] | undefined>;
    const errors = Object.entries(fieldErrors).flatMap(([field, details]) =>
      (details ?? []).map((detail) => ({
        code: ErrorCode.VALIDATION_ERROR,
        details: detail,
        field,
      })),
    );

    res.status(StatusCodes.BAD_REQUEST).json({
      errors,
      message: ErrorMessages.INVALID_REQUEST_BODY,
    });
    return;
  }

  // Anything else is a bug, not an expected failure - log the real error server-side, but
  // never let its details (stack trace, raw message) reach the client. req.log (from
  // pino-http) carries request context (id, method, path) automatically.
  req.log.error(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    errors: [{ code: ErrorCode.INTERNAL_ERROR, details: ErrorMessages.INTERNAL_ERROR }],
    message: ErrorMessages.INTERNAL_ERROR,
  });
};
