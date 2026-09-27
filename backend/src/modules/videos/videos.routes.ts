import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireOwnership } from '../../middleware/requireOwnership';
import { videoUpload } from '../../middleware/upload';
import { prisma } from '../../lib/prisma';
import { adPlacementsRouter } from '../adPlacements/adPlacements.routes';
import {
  uploadVideo as uploadVideoHandler,
  getVideoStatus,
  listVideos,
  getVideo,
  updateVideo,
  deleteVideo,
} from './videos.controller';

export const videosRouter = Router();

// findFirst, not findUnique - a retired (soft-deleted) video must be treated as not found by
// every route this guards, the same as one that doesn't exist or isn't owned by the caller.
const requireVideoOwnership = requireOwnership((id) =>
  prisma.video.findFirst({ where: { id, deletedAt: null } }),
);

videosRouter.post('/', requireAuth, videoUpload.single('video'), uploadVideoHandler);
videosRouter.get('/', requireAuth, listVideos);
videosRouter.get('/:id', requireAuth, requireVideoOwnership, getVideo);
videosRouter.get('/:id/status', requireAuth, requireVideoOwnership, getVideoStatus);
videosRouter.patch('/:id', requireAuth, requireVideoOwnership, updateVideo);
videosRouter.delete('/:id', requireAuth, requireVideoOwnership, deleteVideo);
videosRouter.use('/:videoId/placements', adPlacementsRouter);
