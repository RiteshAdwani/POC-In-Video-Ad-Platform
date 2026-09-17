import type { RequestHandler } from 'express';
import { NotFoundError } from '../errors/AppError';
import { ErrorMessages } from '../constants/errorMessages.constants';

/**
 * @description Builds a middleware that fetches a resource by req.params[paramName] and verifies
 * req.admin owns it - 404s (not 403) on both "doesn't exist" and "not owned", so callers can't
 * tell the two apart. Attaches the fetched resource to req.resource so the handler doesn't
 * need to query it again; must run after requireAuth. paramName defaults to "id", but nested
 * routes (e.g. /videos/:videoId/placements) need a different param name.
 */
export const requireOwnership = <T extends { authorId: string }>(
  fetchResource: (id: string) => Promise<T | null>,
  paramName = 'id',
): RequestHandler => {
  return async (req, _res, next) => {
    // Route params are plain (non-wildcard), so always a single string at runtime.
    const resource = await fetchResource(req.params[paramName] as string);

    if (!resource || resource.authorId !== req.admin!.id) {
      throw new NotFoundError(ErrorMessages.RESOURCE_NOT_FOUND);
    }

    req.resource = resource;
    next();
  };
};
