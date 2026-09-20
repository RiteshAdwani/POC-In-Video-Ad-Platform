import multer from 'multer';
import { MAX_VIDEO_SIZE_BYTES } from '../constants/upload.constants';

/**
 * @description Multer instance for video uploads - memory storage (no disk write, since the file
 * is streamed straight through to Cloudinary), restricted to video MIME types.
 */
export const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith('video/'));
  },
});

/**
 * @description Multer instance for ad creative uploads - an ad asset is either an image (banner
 * overlay) or a video (pre-roll/mid-roll), so both mime prefixes are accepted here; the controller
 * cross-checks the actual file type against the ad's adType. Reuses the video size cap since
 * creatives are never larger than a full video.
 */
export const adAssetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/'));
  },
});
