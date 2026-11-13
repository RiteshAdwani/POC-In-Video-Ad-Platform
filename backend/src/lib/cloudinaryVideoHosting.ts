import { VideoStatus } from '../generated/prisma/enums';
import type { VideoHostingService } from '../types/videoHosting.types';
import { deleteVideoResource, getVideoResource, initiateVideoUpload } from './cloudinary';

/**
 * @description The real host. Reads a status from the Admin API resource: the eager (preview)
 * transformation's secure_url means READY, an error on it means FAILED, neither means still
 * PROCESSING.
 */
export const cloudinaryVideoHosting: VideoHostingService = {
  initiateUpload: async (fileBuffer) => {
    const { publicId } = await initiateVideoUpload(fileBuffer);
    return { externalId: publicId };
  },

  getStatus: async (externalId) => {
    const resource = await getVideoResource(externalId);
    const derived = (resource.derived as Array<Record<string, unknown>> | undefined)?.[0];

    if (derived?.secure_url) {
      return {
        status: VideoStatus.READY,
        playbackUrl: derived.secure_url as string,
        durationSeconds: resource.duration as number | undefined,
      };
    }
    if (derived?.error) {
      return { status: VideoStatus.FAILED };
    }
    return { status: VideoStatus.PROCESSING };
  },

  deleteVideo: async (externalId) => {
    await deleteVideoResource(externalId);
  },
};
