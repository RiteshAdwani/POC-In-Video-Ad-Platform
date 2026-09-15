import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../lib/prisma';
import { initiateVideoUpload } from '../../lib/cloudinary';
import { VideoStatus } from '../../generated/prisma/client.js';
import { UpstreamServiceError, ValidationError } from '../../errors/AppError';
import { ErrorMessages } from '../../constants/errorMessages.constants';
import { ApiSuccessMessages } from '../../constants/apiSuccessMessages.constants';
import { createVideoSchema } from './videos.schema';

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
