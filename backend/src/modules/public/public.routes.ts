import { Router } from 'express';
import { playbackRouter } from './playback.routes';
import { eventsRouter } from './events.routes';
import { publicVideosRouter } from './videos.routes';

// Aggregates every public (unauthenticated) route
export const publicRouter = Router();

publicRouter.use(publicVideosRouter);
publicRouter.use(playbackRouter);
publicRouter.use(eventsRouter);
