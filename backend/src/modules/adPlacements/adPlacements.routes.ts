import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireOwnership } from '../../middleware/requireOwnership';
import { prisma } from '../../lib/prisma';
import {
  createAdPlacement,
  listAdPlacements,
  updateAdPlacement,
  deleteAdPlacement,
} from './adPlacements.controller';

// mergeParams: this router is mounted under /videos/:videoId/placements - without it, req.params
// would only see this router's own params (:id), not the parent's :videoId.
export const adPlacementsRouter = Router({ mergeParams: true });

// Writes: a retired (soft-deleted) video 404s like one that never existed.
const requireVideoOwnership = requireOwnership(
  (id) => prisma.video.findFirst({ where: { id, deletedAt: null } }),
  'videoId',
);
// Reads: a retired video's placements stay viewable (read-only).
const requireVideoReadAccess = requireOwnership(
  (id) => prisma.video.findUnique({ where: { id } }),
  'videoId',
);

// Ownership derives from the parent video, which must be the :videoId in the URL. Only a live
// placement on a live video can be edited or removed; advertisement is included so
// updatePlacement can re-validate without a second query.
const requireAdPlacementOwnership = requireOwnership(async (id, params) => {
  const adPlacement = await prisma.adPlacement.findFirst({
    where: { id, videoId: params.videoId, deletedAt: null, video: { deletedAt: null } },
    include: { video: true, advertisement: true },
  });
  return adPlacement && { ...adPlacement, authorId: adPlacement.video.authorId };
});

adPlacementsRouter.post('/', requireAuth, requireVideoOwnership, createAdPlacement);
adPlacementsRouter.get('/', requireAuth, requireVideoReadAccess, listAdPlacements);
adPlacementsRouter.patch('/:id', requireAuth, requireAdPlacementOwnership, updateAdPlacement);
adPlacementsRouter.delete('/:id', requireAuth, requireAdPlacementOwnership, deleteAdPlacement);
