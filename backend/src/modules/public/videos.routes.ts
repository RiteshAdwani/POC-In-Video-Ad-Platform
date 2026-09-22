import { Router } from 'express';
import { listPublicVideos } from './videos.controller';

// Deliberately no requireAuth - the public catalog anyone can browse before picking a video.
export const publicVideosRouter = Router();

publicVideosRouter.get('/videos', listPublicVideos);
