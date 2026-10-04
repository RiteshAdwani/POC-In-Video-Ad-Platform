import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { VideoStatus } from '../../generated/prisma/client.js';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { paginationQuerySchema } from '../../schemas/pagination.schema';
import { buildPaginationMeta } from '../../lib/pagination';

/**
 * @description Lists every READY video, across all admins - the public catalog a viewer picks
 * from before landing on one video's player. No auth, no ownership scoping: unlike the admin
 * listing (GET /videos, which is scoped to the caller), this is meant to be browsed by anyone.
 * Paginated: page/pageSize come from the query string, defaulted and bounded by
 * paginationQuerySchema - the frontend loads further pages as the catalog is scrolled, rather
 * than jumping between numbered pages like the admin lists. Also supports an optional `search`
 * term, matched against the title only.
 */
export const listPublicVideos: RequestHandler = async (req, res) => {
  const { page, pageSize, search } = paginationQuerySchema.parse(req.query);
  const where = {
    status: VideoStatus.READY,
    deletedAt: null,
    ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [videos, totalItems] = await Promise.all([
    prisma.video.findMany({
      where,
      select: { id: true, title: true, description: true, createdAt: true, playbackUrl: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.video.count({ where }),
  ]);

  res.status(StatusCodes.OK).json({
    data: { videos, pagination: buildPaginationMeta(page, pageSize, totalItems) },
    message: ApiSuccessMessages.PUBLIC_VIDEOS_FETCHED,
  });
};
