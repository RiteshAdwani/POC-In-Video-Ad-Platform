import { Router } from 'express';
import { playbackRouter } from './playback.routes';
import { eventsRouter } from './events.routes';

// Aggregates every public (unauthenticated) route
export const publicRouter = Router();

publicRouter.use(playbackRouter);
publicRouter.use(eventsRouter);
