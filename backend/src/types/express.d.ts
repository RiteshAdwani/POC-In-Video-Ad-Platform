import 'express';

// Set by requireAuth once a token is verified - undefined on any route it doesn't guard.
declare global {
  namespace Express {
    interface Request {
      admin?: { id: string };
    }
  }
}
