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

const requireVideoOwnership = requireOwnership(
  (id) => prisma.video.findUnique({ where: { id } }),
  'videoId',
);

// Ownership of an Ad placement derives from its parent video, not a field on AdPlacement itself.
// advertisement is included too so updatePlacement can re-validate the placement constraints
// (which depend on the advertisement's assetType) without a second query.
const requireAdPlacementOwnership = requireOwnership(async (id) => {
  const adPlacement = await prisma.adPlacement.findUnique({
    where: { id },
    include: { video: true, advertisement: true },
  });
  return adPlacement && { ...adPlacement, authorId: adPlacement.video.authorId };
});

adPlacementsRouter.post('/', requireAuth, requireVideoOwnership, createAdPlacement);
adPlacementsRouter.get('/', requireAuth, requireVideoOwnership, listAdPlacements);
adPlacementsRouter.patch('/:id', requireAuth, requireAdPlacementOwnership, updateAdPlacement);
adPlacementsRouter.delete('/:id', requireAuth, requireAdPlacementOwnership, deleteAdPlacement);
