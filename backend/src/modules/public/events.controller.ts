import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { Prisma, PlaybackEventType, VideoStatus } from '../../generated/prisma/client.js';
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
  // A deleted video counts as unknown - the player is never served config for one.
  const video = await prisma.video.findFirst({ where: { id: videoId, deletedAt: null } });
  if (!video) {
    req.log.warn({ ...logContext, outcome: 'rejected' }, 'Playback event rejected: unknown video');
    throw new ValidationError(ErrorMessages.VIDEO_NOT_FOUND);
  }

  // The real player can only ever obtain ad/playback info for a READY video - a request against
  // one that isn't (still processing, or failed) can't be a genuine viewer, only a stale/guessed id.
  if (video.status !== VideoStatus.READY) {
    req.log.warn(
      { ...logContext, outcome: 'rejected' },
      'Playback event rejected: video is not READY',
    );
    throw new ValidationError(ErrorMessages.VIDEO_NOT_READY);
  }

  // An adId from a different video, or a deleted placement, is invalid, same as a missing one.
  let outOfOrder = false;
  if (adId) {
    const adPlacement = await prisma.adPlacement.findFirst({
      where: { id: adId, deletedAt: null },
    });

    if (adPlacement?.videoId !== videoId) {
      req.log.warn(
        { ...logContext, outcome: 'rejected' },
        'Playback event rejected: adId not on this video',
      );
      throw new ValidationError(ErrorMessages.INVALID_AD_REFERENCE);
    }

    // An ad with no configured skip point can't be skipped - applies the same way regardless of
    // ad type, rather than hardcoding banners as the only non-skippable case.
    if (eventType === PlaybackEventType.AD_SKIPPED && adPlacement.skipAfterSeconds == null) {
      req.log.warn(
        { ...logContext, outcome: 'rejected' },
        'Playback event rejected: this ad placement cannot be skipped',
      );
      throw new ValidationError(ErrorMessages.AD_NOT_SKIPPABLE);
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
  let event;
  try {
    event = await prisma.playbackEvent.create({
      data: { videoId, sessionId, eventType, occurredAt, adPlacementId: adId },
    });
  } catch (error) {
    // P2002: this exact event was already recorded - a retry, not a new fact. Still a 2xx. Echoes
    // back the fields that collided (no extra query for the original row) - this is never read by
    // the frontend (delivered via sendBeacon, which has no readable response), purely for
    // curl/DevTools debugging.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      req.log.info({ ...logContext, outcome: 'deduped', outOfOrder }, 'Playback event deduped');
      res.status(StatusCodes.OK).json({
        data: { videoId, sessionId, eventType, adId },
        message: ApiSuccessMessages.PLAYBACK_EVENT_DEDUPED,
      });
      return;
    }
    throw error;
  }

  req.log.info({ ...logContext, outcome: 'accepted', outOfOrder }, 'Playback event recorded');
  res
    .status(StatusCodes.CREATED)
    .json({ data: { event }, message: ApiSuccessMessages.PLAYBACK_EVENT_RECORDED });
};
