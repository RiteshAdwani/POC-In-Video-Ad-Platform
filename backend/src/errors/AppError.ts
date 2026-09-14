import { StatusCodes } from 'http-status-codes';
import { ErrorCode } from '../constants/errorCodes.constants';

/**
 * @description Base for every thrown API error. One shape for every error response the API sends:
 * { error: { code, message } }. Each subclass just fixes the status code + machine-readable
 * code; the message is caller-supplied context.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: StatusCodes;
  abstract readonly code: ErrorCode;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** Request body/params failed validation. */
export class ValidationError extends AppError {
  readonly statusCode = StatusCodes.BAD_REQUEST;
  readonly code = ErrorCode.VALIDATION_ERROR;
}

/** Missing/invalid credentials or auth token. */
export class UnauthorizedError extends AppError {
  readonly statusCode = StatusCodes.UNAUTHORIZED;
  readonly code = ErrorCode.UNAUTHORIZED;
}

/** Requested resource doesn't exist (or isn't owned by the caller). */
export class NotFoundError extends AppError {
  readonly statusCode = StatusCodes.NOT_FOUND;
  readonly code = ErrorCode.NOT_FOUND;
}

/** Request conflicts with the resource's current state. */
export class ConflictError extends AppError {
  readonly statusCode = StatusCodes.CONFLICT;
  readonly code = ErrorCode.CONFLICT;
}

/** A third-party dependency (Cloudinary, later) failed or timed out. */
export class UpstreamServiceError extends AppError {
  readonly statusCode = StatusCodes.BAD_GATEWAY;
  readonly code = ErrorCode.UPSTREAM_SERVICE_ERROR;
}
