import { Router } from 'express';
import { recordPlaybackEvent } from './events.controller';

// Deliberately no requireAuth - this is the public, unauthenticated event ingestion endpoint
// videoId/adId live in the body, not the URL, so there's nothing to nest
// this under.
export const eventsRouter = Router();

eventsRouter.post('/events', recordPlaybackEvent);
