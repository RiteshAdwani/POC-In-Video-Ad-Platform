import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { initiateVideoUpload, deleteVideoResource } from '../../lib/cloudinary';
import { Prisma, type Video } from '../../generated/prisma/client.js';
import { VideoStatus } from '../../generated/prisma/client.js';
import { ConflictError, UpstreamServiceError, ValidationError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { createVideoSchema, updateVideoSchema } from './videos.schema';
import { checkAndUpdateVideoStatus, toVideoDto } from './videos.service';

const WITH_PLACEMENT_COUNT = { include: { _count: { select: { adPlacements: true } } } } as const;

/**
 * @description Uploads a video: streams it to Cloudinary and persists the resulting row.
 */
export const uploadVideo: RequestHandler = async (req, res) => {
  // Extract video title and description from req body
  const { title, description } = createVideoSchema.parse(req.body);

  // Check if file exists in the req received
  if (!req.file) {
    throw new ValidationError(ErrorMessages.MISSING_VIDEO_FILE);
  }

  // requireAuth ran before this handler and throws if req.admin isn't set, so it's always present here.
  const authorId = req.admin!.id;

  let publicId: string;
  try {
    // Extract publicId returned by cloudinary on upload
    ({ publicId } = await initiateVideoUpload(req.file.buffer));
  } catch (error) {
    // AppError subclasses aren't logged by errorHandler (only truly unexpected errors are) - log
    // the real Cloudinary failure here or it's lost entirely, leaving just a generic 502.
    req.log.error(error, 'Cloudinary upload failed');
    // Keep an audit trail instead of silently dropping the request - the admin can see it failed
    // and retry, rather than the upload just vanishing.

    await prisma.video.create({
      data: { title, description, authorId, status: VideoStatus.FAILED },
    });
    throw new UpstreamServiceError(ErrorMessages.VIDEO_UPLOAD_FAILED);
  }

  const video = await prisma.video.create({
    data: { title, description, authorId, status: VideoStatus.PROCESSING, externalId: publicId },
  });

  res
    .status(StatusCodes.CREATED)
    .json({ data: { video }, message: ApiSuccessMessages.VIDEO_UPLOADED });
};

/**
 * @description Checks a video's Cloudinary processing status and updates the DB row if it changed.
 * requireVideoOwnership already fetched the row and verified ownership - it's on req.resource.
 */
export const getVideoStatus: RequestHandler = async (req, res) => {
  // externalId is always set by the time a row is reachable here - uploadVideo only creates a
  // row without one on the FAILED path, which has no Cloudinary asset to check.
  const video = await checkAndUpdateVideoStatus(req.resource as Video);

  res
    .status(StatusCodes.OK)
    .json({ data: { video }, message: ApiSuccessMessages.VIDEO_STATUS_FETCHED });
};

/**
 * @description Lists every video owned by the calling admin - never other admins' videos.
 */
export const listVideos: RequestHandler = async (req, res) => {
  const videos = await prisma.video.findMany({
    where: { authorId: req.admin!.id },
    orderBy: { createdAt: 'desc' },
    ...WITH_PLACEMENT_COUNT,
  });

  res
    .status(StatusCodes.OK)
    .json({ data: { videos: videos.map(toVideoDto) }, message: ApiSuccessMessages.VIDEOS_FETCHED });
};

/**
 * @description Fetches one video. requireOwnership already verified it belongs to the caller -
 * it's re-fetched here (rather than reused from req.resource) just to bring in the placement
 * count, which the ownership check itself doesn't need.
 */
export const getVideo: RequestHandler = async (req, res) => {
  const existing = req.resource as Video;
  const video = await prisma.video.findUniqueOrThrow({
    where: { id: existing.id },
    ...WITH_PLACEMENT_COUNT,
  });

  res
    .status(StatusCodes.OK)
    .json({ data: { video: toVideoDto(video) }, message: ApiSuccessMessages.VIDEO_FETCHED });
};

/**
 * @description Updates a video's title/description. requireOwnership already fetched and verified
 * it. The file itself isn't editable here - a new upload is a new video.
 */
export const updateVideo: RequestHandler = async (req, res) => {
  const existing = req.resource as Video;
  const data = updateVideoSchema.parse(req.body);

  const video = await prisma.video.update({
    where: { id: existing.id },
    data,
    ...WITH_PLACEMENT_COUNT,
  });

  res
    .status(StatusCodes.OK)
    .json({ data: { video: toVideoDto(video) }, message: ApiSuccessMessages.VIDEO_UPDATED });
};

/**
 * @description Deletes a video. requireOwnership already fetched and verified it. The DB row is
 * removed first (the source of truth); the Cloudinary asset cleanup is best-effort afterward, same
 * as the poller's own FAILED-video cleanup - a dangling asset is a storage cost, not a correctness
 * bug.
 */
export const deleteVideo: RequestHandler = async (req, res) => {
  const existing = req.resource as Video;

  try {
    await prisma.video.delete({ where: { id: existing.id } });
  } catch (error) {
    // P2003: foreign key constraint failed - still-referenced by an AdPlacement or PlaybackEvent.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new ConflictError(ErrorMessages.VIDEO_IN_USE);
    }
    throw error;
  }

  if (existing.externalId) {
    try {
      await deleteVideoResource(existing.externalId);
    } catch (error) {
      req.log.error(error, `Failed to delete Cloudinary asset for video ${existing.id}`);
    }
  }

  res.status(StatusCodes.OK).json({ data: null, message: ApiSuccessMessages.VIDEO_DELETED });
};
