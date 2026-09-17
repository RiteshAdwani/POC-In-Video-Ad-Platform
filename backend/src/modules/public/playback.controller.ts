import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { VideoStatus } from '../../generated/prisma/client.js';
import { NotFoundError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';

/**
 * @description Returns a video's status, and once it's READY, the playback URL and its ad list.
 * Public and unauthenticated - there's no admin identity here to check ownership against.
 */
export const getPlaybackConfig: RequestHandler = async (req, res) => {
  // :id is a non-wildcard segment, so it's always a single string at runtime despite Express 5's
  // ParamsDictionary typing it as string | string[].
  const videoId = req.params.id as string;

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { adPlacements: { include: { advertisement: true } } },
  });

  if (!video) {
    throw new NotFoundError(ErrorMessages.VIDEO_NOT_FOUND);
  }

  const isReady = video.status === VideoStatus.READY;

  // Same shape regardless of status - playbackUrl/ads are null/empty rather than omitted, so the
  // player never needs a separate branch for "missing" vs "not ready yet".
  res.status(StatusCodes.OK).json({
    data: {
      status: video.status,
      playbackUrl: isReady ? video.playbackUrl : null,
      ads: isReady
        ? video.adPlacements.map((placement) => ({
            // The AdPlacement id, not the Advertisement id - the player echoes this back as
            // `adId` when it later posts playback events for this ad.
            id: placement.id,
            type: placement.advertisement.adType,
            assetUrl: placement.advertisement.assetUrl,
            clickThroughUrl: placement.advertisement.clickThroughUrl,
            startOffsetSeconds: placement.startOffsetSeconds,
            durationSeconds: placement.durationSeconds,
            skipAfterSeconds: placement.skipAfterSeconds,
          }))
        : [],
    },
    message: ApiSuccessMessages.PLAYBACK_CONFIG_FETCHED,
  });
};
