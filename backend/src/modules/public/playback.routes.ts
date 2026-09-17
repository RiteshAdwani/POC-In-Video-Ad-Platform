import { Router } from 'express';
import { getPlaybackConfig } from './playback.controller';

// Deliberately no requireAuth, no requireOwnership - this whole module only ever imports read
// logic, never the admin controllers/services that can write.
export const playbackRouter = Router();

playbackRouter.get('/videos/:id/playback', getPlaybackConfig);
