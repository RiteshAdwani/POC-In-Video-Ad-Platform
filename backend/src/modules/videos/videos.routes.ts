import { Router } from 'express';
import { requireOwnership } from '../../middleware/requireOwnership';
import { videoUpload } from '../../middleware/upload';
import { uploadRateLimiter } from '../../middleware/rateLimit';
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

// Writes: a retired (soft-deleted) video 404s like one that never existed.
const requireVideoOwnership = requireOwnership((id) =>
  prisma.video.findFirst({ where: { id, deletedAt: null } }),
);
// Reads: a retired video stays viewable (read-only) so its history can still be looked up.
const requireVideoReadAccess = requireOwnership((id) => prisma.video.findUnique({ where: { id } }));

videosRouter.post('/', uploadRateLimiter, videoUpload.single('video'), uploadVideoHandler);
videosRouter.get('/', listVideos);
videosRouter.get('/:id', requireVideoReadAccess, getVideo);
videosRouter.get('/:id/status', requireVideoOwnership, getVideoStatus);
videosRouter.patch('/:id', requireVideoOwnership, updateVideo);
videosRouter.delete('/:id', requireVideoOwnership, deleteVideo);
videosRouter.use('/:videoId/placements', adPlacementsRouter);
