import { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestContext } from '../types/requestContext.types';

// The middleware runs each request inside this store, so code anywhere downstream - including after
// an await - can read the request's context without it being passed down.
export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * @description The current request's context, or undefined outside a request (startup, the poller).
 */
export const getRequestContext = (): RequestContext | undefined => requestContextStorage.getStore();

/**
 * @description The current request's id, or undefined outside a request.
 */
export const getRequestId = (): string | undefined => getRequestContext()?.requestId;
