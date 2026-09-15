import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { videoUpload } from '../../middleware/upload';
import { uploadVideo as uploadVideoHandler } from './videos.controller';

export const videosRouter = Router();

videosRouter.post('/', requireAuth, videoUpload.single('video'), uploadVideoHandler);
