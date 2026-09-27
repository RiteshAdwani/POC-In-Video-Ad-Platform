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

  // findFirst, not findUnique - a retired (soft-deleted) video must 404 here exactly like one
  // that never existed, same as requireOwnership already does for the admin side.
  const video = await prisma.video.findFirst({
    where: { id: videoId, deletedAt: null },
    // Excludes retired (soft-deleted) placements - a viewer should never be served an ad the
    // admin has since taken down, even though its past playback history stays intact elsewhere.
    include: { adPlacements: { where: { deletedAt: null }, include: { advertisement: true } } },
  });

  if (!video) {
    throw new NotFoundError(ErrorMessages.VIDEO_NOT_FOUND);
  }

  const isReady = video.status === VideoStatus.READY;

  // Same shape regardless of status - playbackUrl/ads are null/empty rather than omitted, so the
  // player never needs a separate branch for "missing" vs "not ready yet".
  res.status(StatusCodes.OK).json({
    data: {
      title: video.title,
      description: video.description,
      status: video.status,
      playbackUrl: isReady ? video.playbackUrl : null,
      ads: isReady
        ? video.adPlacements.map((adPlacement) => ({
            // The AdPlacement id, not the Advertisement id - the player echoes this back as
            // `adId` when it later posts playback events for this ad.
            id: adPlacement.id,
            type: adPlacement.adType,
            title: adPlacement.advertisement.title,
            assetUrl: adPlacement.advertisement.assetUrl,
            clickThroughUrl: adPlacement.advertisement.clickThroughUrl,
            startOffsetSeconds: adPlacement.startOffsetSeconds,
            durationSeconds: adPlacement.durationSeconds,
            skipAfterSeconds: adPlacement.skipAfterSeconds,
          }))
        : [],
    },
    message: ApiSuccessMessages.PLAYBACK_CONFIG_FETCHED,
  });
};
