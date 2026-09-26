import { VIDEO_THUMBNAIL_TRANSFORM } from '../constants/video.constants';

/**
 * @description Derives a still-frame JPG thumbnail URL from a Cloudinary-hosted video URL, via
 * Cloudinary's own URL-based transforms - no extra upload, storage, or backend call needed.
 * Returns null for a non-Cloudinary URL, so callers can fall back to their existing placeholder.
 */
export const getVideoThumbnailUrl = (videoUrl: string): string | null => {
  const uploadMarker = '/upload/';
  const uploadIndex = videoUrl.indexOf(uploadMarker);
  if (uploadIndex === -1) return null;

  const prefix = videoUrl.slice(0, uploadIndex + uploadMarker.length);
  const segments = videoUrl.slice(uploadIndex + uploadMarker.length).split('/');
  const [version, filename] = segments.slice(-2);
  if (!version || !filename) return null;

  const publicId = filename.replace(/\.[^./]+$/, '');
  return `${prefix}${VIDEO_THUMBNAIL_TRANSFORM}/${version}/${publicId}.jpg`;
};
