import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { VideoStatus } from '../../generated/prisma/client.js';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';

/**
 * @description Lists every READY video, across all admins - the public catalog a viewer picks
 * from before landing on one video's player. No auth, no ownership scoping: unlike the admin
 * listing (GET /videos, which is scoped to the caller), this is meant to be browsed by anyone.
 */
export const listPublicVideos: RequestHandler = async (_req, res) => {
  const videos = await prisma.video.findMany({
    where: { status: VideoStatus.READY },
    select: { id: true, title: true, description: true, createdAt: true, playbackUrl: true },
    orderBy: { createdAt: 'desc' },
  });

  res
    .status(StatusCodes.OK)
    .json({ data: { videos }, message: ApiSuccessMessages.PUBLIC_VIDEOS_FETCHED });
};
