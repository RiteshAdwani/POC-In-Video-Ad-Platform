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

// Writes: a retired (soft-deleted) video 404s like one that never existed.
const requireVideoOwnership = requireOwnership((id) =>
  prisma.video.findFirst({ where: { id, deletedAt: null } }),
);
// Reads: a retired video stays viewable (read-only) so its history can still be looked up.
const requireVideoReadAccess = requireOwnership((id) => prisma.video.findUnique({ where: { id } }));

videosRouter.post('/', requireAuth, videoUpload.single('video'), uploadVideoHandler);
videosRouter.get('/', requireAuth, listVideos);
videosRouter.get('/:id', requireAuth, requireVideoReadAccess, getVideo);
videosRouter.get('/:id/status', requireAuth, requireVideoOwnership, getVideoStatus);
videosRouter.patch('/:id', requireAuth, requireVideoOwnership, updateVideo);
videosRouter.delete('/:id', requireAuth, requireVideoOwnership, deleteVideo);
videosRouter.use('/:videoId/placements', adPlacementsRouter);
