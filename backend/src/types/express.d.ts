import 'express';

declare global {
  namespace Express {
    interface Request {
      // Set by requireAuth once a token is verified - undefined on any route it doesn't guard.
      admin?: { id: string };
      // Set by requireOwnership once ownership is verified - the caller casts to the concrete
      // type it asked requireOwnership to fetch, since this field is shared across all resources.
      resource?: unknown;
    }
  }
}
