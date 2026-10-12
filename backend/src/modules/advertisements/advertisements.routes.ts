import { Router } from 'express';
import { requireOwnership } from '../../middleware/requireOwnership';
import { adAssetUpload } from '../../middleware/upload';
import { uploadRateLimiter } from '../../middleware/rateLimit';
import { prisma } from '../../lib/prisma';
import {
  createAdvertisement,
  listAdvertisements,
  getAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
} from './advertisements.controller';
import { listAdPlacementsForAdvertisement } from '../adPlacements/adPlacements.controller';

export const advertisementsRouter = Router();

// Writes: a retired (soft-deleted) ad 404s like one that never existed.
const requireAdvertisementOwnership = requireOwnership((id) =>
  prisma.advertisement.findFirst({ where: { id, deletedAt: null } }),
);
// Reads: a retired ad stays viewable (read-only) so its history can still be looked up.
const requireAdvertisementReadAccess = requireOwnership((id) =>
  prisma.advertisement.findUnique({ where: { id } }),
);

advertisementsRouter.post(
  '/',
  uploadRateLimiter,
  adAssetUpload.single('assetFile'),
  createAdvertisement,
);
advertisementsRouter.get('/', listAdvertisements);
advertisementsRouter.get('/:id', requireAdvertisementReadAccess, getAdvertisement);
advertisementsRouter.get(
  '/:id/placements',
  requireAdvertisementReadAccess,
  listAdPlacementsForAdvertisement,
);
advertisementsRouter.patch('/:id', requireAdvertisementOwnership, updateAdvertisement);
advertisementsRouter.delete('/:id', requireAdvertisementOwnership, deleteAdvertisement);
