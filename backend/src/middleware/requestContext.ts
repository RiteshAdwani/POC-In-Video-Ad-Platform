import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { REQUEST_ID_HEADER } from '../constants/requestContext.constants';
import { requestContextStorage } from '../lib/requestContext';
import { requestIdSchema } from '../schemas/requestContext.schema';

/**
 * @description Gives every request a fresh id of our own, echoes it on the response, and runs the
 * rest of the request inside the request context. A valid UUID the caller sent as X-Request-Id is
 * kept alongside as clientRequestId, but never used as the id itself.
 */
export const requestContext: RequestHandler = (req, res, next) => {
  const requestId = randomUUID();
  const inbound = requestIdSchema.safeParse(req.get(REQUEST_ID_HEADER));
  const clientRequestId = inbound.success ? inbound.data : undefined;

  res.setHeader(REQUEST_ID_HEADER, requestId);
  requestContextStorage.run({ requestId, clientRequestId }, next);
};
