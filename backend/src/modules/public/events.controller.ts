import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { Prisma, PlaybackEventType, AdType } from '../../generated/prisma/client.js';
import { ValidationError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { recordPlaybackEventSchema } from './events.schema';

// Each of these presupposes an AD_SHOWN already happened for the same ad - e.g. an AD_COMPLETED
// (or a skip/click) landing before its own AD_SHOWN means the network delivered them out of
// order. We flag that for visibility, never reject it.
const REQUIRES_PRIOR_AD_SHOWN = new Set<PlaybackEventType>([
  PlaybackEventType.AD_COMPLETED,
  PlaybackEventType.AD_SKIPPED,
  PlaybackEventType.AD_CLICKED,
]);

/**
 * @description Validates and records one playback event, deduping on the DB's unique constraint.
 * Public and unauthenticated - every accepted/deduped/rejected outcome is logged here, since
 * AppErrors aren't logged by the global error handler.
 */
export const recordPlaybackEvent: RequestHandler = async (req, res) => {
  // Validate the shape first; log before rethrowing since the error handler won't.
  let body: ReturnType<typeof recordPlaybackEventSchema.parse>;
  try {
    body = recordPlaybackEventSchema.parse(req.body);
  } catch (error) {
    req.log.warn(
      { sessionId: req.body?.sessionId, eventType: req.body?.eventType, outcome: 'rejected' },
      'Playback event rejected: invalid payload',
    );
    throw error;
  }
  const { videoId, sessionId, eventType, occurredAt, adId } = body;
  const logContext = { sessionId, eventType, adId };

  // No ownership concept on the public side, so an unknown video is invalid input (400), not 404.
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) {
    req.log.warn({ ...logContext, outcome: 'rejected' }, 'Playback event rejected: unknown video');
    throw new ValidationError(ErrorMessages.VIDEO_NOT_FOUND);
  }

  // An adId from a different video is invalid, same as a missing one - one check, one error.
  let outOfOrder = false;
  if (adId) {
    const adPlacement = await prisma.adPlacement.findUnique({
      where: { id: adId },
      include: { advertisement: true },
    });

    if (adPlacement?.videoId !== videoId) {
      req.log.warn(
        { ...logContext, outcome: 'rejected' },
        'Playback event rejected: adId not on this video',
      );
      throw new ValidationError(ErrorMessages.INVALID_AD_REFERENCE);
    }

    // Banners have no skip button - there's nothing to skip out of.
    if (
      eventType === PlaybackEventType.AD_SKIPPED &&
      adPlacement.advertisement.adType === AdType.BANNER_OVERLAY
    ) {
      req.log.warn(
        { ...logContext, outcome: 'rejected' },
        'Playback event rejected: banner placements cannot be skipped',
      );
      throw new ValidationError(ErrorMessages.BANNER_NOT_SKIPPABLE);
    }

    // Check whether this ad's AD_SHOWN already landed - flag it if not, but still proceed.
    if (REQUIRES_PRIOR_AD_SHOWN.has(eventType)) {
      const priorAdShown = await prisma.playbackEvent.findFirst({
        where: { sessionId, adPlacementId: adId, eventType: PlaybackEventType.AD_SHOWN },
        select: { id: true },
      });
      outOfOrder = !priorAdShown;
    }
  }

  // Insert the fact - the DB's unique constraint is what actually enforces dedup.
  try {
    await prisma.playbackEvent.create({
      data: { videoId, sessionId, eventType, occurredAt, adPlacementId: adId },
    });
  } catch (error) {
    // P2002: this exact event was already recorded - a retry, not a new fact. Still a 2xx.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      req.log.info({ ...logContext, outcome: 'deduped', outOfOrder }, 'Playback event deduped');
      res
        .status(StatusCodes.OK)
        .json({ data: null, message: ApiSuccessMessages.PLAYBACK_EVENT_DEDUPED });
      return;
    }
    throw error;
  }

  req.log.info({ ...logContext, outcome: 'accepted', outOfOrder }, 'Playback event recorded');
  res
    .status(StatusCodes.CREATED)
    .json({ data: null, message: ApiSuccessMessages.PLAYBACK_EVENT_RECORDED });
};
