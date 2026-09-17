import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import {
  Prisma,
  type Advertisement,
  type AdPlacement,
  type Video,
} from '../../generated/prisma/client.js';
import { ConflictError, NotFoundError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { createAdPlacementSchema, updateAdPlacementSchema } from './adPlacements.schema';
import { validatePlacementConstraints } from './adPlacements.validators';

/**
 * @description Attaches an advertisement to a video at a position. requireOwnership already
 * verified the video (:videoId) belongs to the caller - it's on req.resource. The advertisement
 * itself is a separate ownership check here, since its id comes from the body, not the URL.
 */
export const createAdPlacement: RequestHandler = async (req, res) => {
  const video = req.resource as Video;
  const { advertisementId, ...placementData } = createAdPlacementSchema.parse(req.body);

  // Fetch Ad details from the DB
  const advertisement = await prisma.advertisement.findUnique({ where: { id: advertisementId } });
  if (advertisement?.authorId !== req.admin!.id) {
    throw new NotFoundError(ErrorMessages.ADVERTISEMENT_NOT_FOUND);
  }

  // Validation for Ad placement
  validatePlacementConstraints(advertisement.adType, placementData);

  // Create Ad placement
  const adPlacement = await prisma.adPlacement.create({
    data: { ...placementData, videoId: video.id, advertisementId },
  });

  res
    .status(StatusCodes.CREATED)
    .json({ data: { adPlacement }, message: ApiSuccessMessages.AD_PLACEMENT_CREATED });
};

/**
 * @description Lists every ad placement on a video. requireOwnership already verified the video.
 */
export const listAdPlacements: RequestHandler = async (req, res) => {
  const video = req.resource as Video;

  // Fetch all Ad placements
  const adPlacements = await prisma.adPlacement.findMany({
    where: { videoId: video.id },
    include: { advertisement: true },
    orderBy: { startOffsetSeconds: 'asc' },
  });

  res
    .status(StatusCodes.OK)
    .json({ data: { adPlacements }, message: ApiSuccessMessages.AD_PLACEMENTS_FETCHED });
};

/**
 * @description Updates an Ad placement's position/timing. requireOwnership already fetched and
 * verified it (ownership derives from the parent video's authorId), and it comes with its
 * advertisement attached so the pre-roll/banner constraints can be re-checked against the
 * resulting state - a partial patch could otherwise leave a pre-roll at a nonzero offset just by
 * not touching the field a naive per-field check would have looked at.
 */
export const updateAdPlacement: RequestHandler = async (req, res) => {
  // Extract resource and parse data
  const existing = req.resource as AdPlacement & { advertisement: Advertisement };
  const data = updateAdPlacementSchema.parse(req.body);

  // Validate placement constraints
  validatePlacementConstraints(existing.advertisement.adType, {
    startOffsetSeconds: data.startOffsetSeconds ?? existing.startOffsetSeconds,
    durationSeconds: data.durationSeconds ?? existing.durationSeconds,
  });

  // Update Ad placement
  const adPlacement = await prisma.adPlacement.update({ where: { id: existing.id }, data });

  res
    .status(StatusCodes.OK)
    .json({ data: { adPlacement }, message: ApiSuccessMessages.AD_PLACEMENT_UPDATED });
};

/**
 * @description Removes an Ad placement. requireOwnership already fetched and verified it.
 */
export const deleteAdPlacement: RequestHandler = async (req, res) => {
  const existing = req.resource as AdPlacement;

  try {
    await prisma.adPlacement.delete({ where: { id: existing.id } });
  } catch (error) {
    // P2003: foreign key constraint failed - PlaybackEvent rows still reference this placement.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new ConflictError(ErrorMessages.PLACEMENT_IN_USE);
    }
    throw error;
  }

  res.status(StatusCodes.OK).json({ data: null, message: ApiSuccessMessages.AD_PLACEMENT_DELETED });
};
