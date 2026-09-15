// Matches Cloudinary's own free-plan video upload cap - failing here gives a clear error instead
// of a confusing rejection from Cloudinary later.
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
