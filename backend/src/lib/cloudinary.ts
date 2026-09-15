import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * @description Streams a video buffer to Cloudinary. `eager_async: true` makes Cloudinary return
 * immediately with a `public_id` while transcoding continues in the background.
 */
export const initiateVideoUpload = (fileBuffer: Buffer): Promise<{ publicId: string }> =>
  new Promise((resolve, reject) => {
    const options: UploadApiOptions = { resource_type: 'video', eager_async: true };
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(
          new Error(error?.message ?? 'Cloudinary upload returned no result', { cause: error }),
        );
        return;
      }
      resolve({ publicId: result.public_id });
    });

    uploadStream.end(fileBuffer);
  });

/**
 * @description Fetches a video resource's raw Admin API details, for the poller to interpret.
 * `resource()` is typed `Promise<any>` by the SDK - the exact shape of its `derived`/`eager` data
 * mid-transformation isn't clearly documented, so parsing it into a ready/processing/failed
 * verdict is left to the caller rather than guessed here.
 */
export const getVideoResource = (publicId: string): Promise<Record<string, unknown>> =>
  cloudinary.api.resource(publicId, { resource_type: 'video' });
