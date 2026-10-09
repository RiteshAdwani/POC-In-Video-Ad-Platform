import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import type { Advertisement, AdPlacement, Video } from '../../generated/prisma/client.js';
import { NotFoundError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { createAdPlacementSchema, updateAdPlacementSchema } from './adPlacements.schema';
import { validatePlacementConstraints } from './adPlacements.validators';
import { paginationQuerySchema } from '../../schemas/pagination.schema';
import { buildPaginationMeta } from '../../lib/pagination';

/**
 * @description Attaches an advertisement to a video at a position. requireOwnership already
 * verified the video (:videoId) belongs to the caller - it's on req.resource. The advertisement
 * itself is a separate ownership check here, since its id comes from the body, not the URL.
 */
export const createAdPlacement: RequestHandler = async (req, res) => {
  const video = req.resource as Video;
  const { advertisementId, ...placementData } = createAdPlacementSchema.parse(req.body);

  // A retired ad can't be placed again - treated as not found, same as one that never existed.
  const advertisement = await prisma.advertisement.findFirst({
    where: { id: advertisementId, deletedAt: null },
  });
  if (advertisement?.authorId !== req.admin!.id) {
    throw new NotFoundError(ErrorMessages.ADVERTISEMENT_NOT_FOUND);
  }

  // Validation for Ad placement
  validatePlacementConstraints(advertisement.assetType, video.durationSeconds, placementData);

  // Create Ad placement
  const adPlacement = await prisma.adPlacement.create({
    data: { ...placementData, videoId: video.id, advertisementId },
  });

  res
    .status(StatusCodes.CREATED)
    .json({ data: { adPlacement }, message: ApiSuccessMessages.AD_PLACEMENT_CREATED });
};

/**
 * @description Lists a video's live ad placements, paginated - or, for a retired video, every
 * placement it ever had (retired ones included), as a read-only record of what ran on it.
 */
export const listAdPlacements: RequestHandler = async (req, res) => {
  const video = req.resource as Video;
  const { page, pageSize } = paginationQuerySchema.parse(req.query);
  const where = { videoId: video.id, ...(video.deletedAt ? {} : { deletedAt: null }) };

  const [adPlacements, totalItems] = await Promise.all([
    prisma.adPlacement.findMany({
      where,
      include: { advertisement: true },
      orderBy: { startOffsetSeconds: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.adPlacement.count({ where }),
  ]);

  res.status(StatusCodes.OK).json({
    data: { adPlacements, pagination: buildPaginationMeta(page, pageSize, totalItems) },
    message: ApiSuccessMessages.AD_PLACEMENTS_FETCHED,
  });
};

/**
 * @description Lists an ad's live placements across videos, paginated - or, for a retired ad,
 * every placement it ever had, as a read-only record of where it ran. Mirrors listAdPlacements.
 */
export const listAdPlacementsForAdvertisement: RequestHandler = async (req, res) => {
  const advertisement = req.resource as Advertisement;
  const { page, pageSize } = paginationQuerySchema.parse(req.query);
  const where = {
    advertisementId: advertisement.id,
    ...(advertisement.deletedAt ? {} : { deletedAt: null }),
  };

  const [adPlacements, totalItems] = await Promise.all([
    prisma.adPlacement.findMany({
      where,
      include: { video: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.adPlacement.count({ where }),
  ]);

  res.status(StatusCodes.OK).json({
    data: { adPlacements, pagination: buildPaginationMeta(page, pageSize, totalItems) },
    message: ApiSuccessMessages.AD_PLACEMENTS_FETCHED,
  });
};

/**
 * @description Updates an Ad placement's type/position/timing. requireOwnership already fetched
 * and verified it (ownership derives from the parent video's authorId), and it comes with its
 * advertisement attached so the placement constraints can be re-checked against the resulting
 * state - a partial patch could otherwise leave a pre-roll at a nonzero offset just by not
 * touching the field a naive per-field check would have looked at.
 */
export const updateAdPlacement: RequestHandler = async (req, res) => {
  // Extract resource and parse data
  const existing = req.resource as AdPlacement & { advertisement: Advertisement; video: Video };
  const data = updateAdPlacementSchema.parse(req.body);

  // Validate placement constraints
  validatePlacementConstraints(existing.advertisement.assetType, existing.video.durationSeconds, {
    adType: data.adType ?? existing.adType,
    startOffsetSeconds: data.startOffsetSeconds ?? existing.startOffsetSeconds,
    durationSeconds: data.durationSeconds ?? existing.durationSeconds,
    skipAfterSeconds: data.skipAfterSeconds ?? existing.skipAfterSeconds,
  });

  // Update Ad placement
  const adPlacement = await prisma.adPlacement.update({ where: { id: existing.id }, data });

  res
    .status(StatusCodes.OK)
    .json({ data: { adPlacement }, message: ApiSuccessMessages.AD_PLACEMENT_UPDATED });
};

/**
 * @description Retires an ad placement - a soft delete (sets deletedAt), never a real row
 * deletion. A hard delete would be permanently blocked by onDelete: Restrict the moment any
 * PlaybackEvent/DailyCount row references this placement, and even before that point, physically
 * removing the row is never actually necessary: every admin-facing query already filters
 * deletedAt: null, so a retired placement simply stops appearing anywhere active, while its past
 * analytics stay exactly as valid as they were before. requireOwnership already fetched and
 * verified it.
 */
export const deleteAdPlacement: RequestHandler = async (req, res) => {
  const existing = req.resource as AdPlacement;

  await prisma.adPlacement.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });

  res.status(StatusCodes.OK).json({ data: null, message: ApiSuccessMessages.AD_PLACEMENT_DELETED });
};
