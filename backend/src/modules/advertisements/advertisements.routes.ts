import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireOwnership } from '../../middleware/requireOwnership';
import { prisma } from '../../lib/prisma';
import {
  createAdvertisement,
  listAdvertisements,
  getAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
} from './advertisements.controller';

export const advertisementsRouter = Router();

const requireAdvertisementOwnership = requireOwnership((id) =>
  prisma.advertisement.findUnique({ where: { id } }),
);

advertisementsRouter.post('/', requireAuth, createAdvertisement);
advertisementsRouter.get('/', requireAuth, listAdvertisements);
advertisementsRouter.get('/:id', requireAuth, requireAdvertisementOwnership, getAdvertisement);
advertisementsRouter.patch('/:id', requireAuth, requireAdvertisementOwnership, updateAdvertisement);
advertisementsRouter.delete(
  '/:id',
  requireAuth,
  requireAdvertisementOwnership,
  deleteAdvertisement,
);
