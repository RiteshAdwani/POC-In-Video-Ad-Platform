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
