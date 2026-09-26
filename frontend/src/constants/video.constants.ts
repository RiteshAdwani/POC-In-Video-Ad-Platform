export const VideoStatus = {
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;

export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];

export const VIDEO_STATUS_LABEL: Record<VideoStatus, string> = {
  [VideoStatus.PROCESSING]: 'Processing',
  [VideoStatus.READY]: 'Ready',
  [VideoStatus.FAILED]: 'Failed',
};

// Shared by usePlaybackConfigQuery and useVideosQuery - both poll at this interval while a video
// isn't READY yet, picking up the backend's own poller without a manual page refresh.
export const POLL_WHILE_VIDEO_NOT_READY_MS = 5000;

// Cloudinary transform used by videoThumbnail.ts to derive a card-sized still-frame JPG from a
// video URL: so_1 grabs the 1s frame (0s is often black/mid-fade), c_fill crops to exactly
// w_400/h_225 without distorting.
export const VIDEO_THUMBNAIL_TRANSFORM = 'so_1,w_400,h_225,c_fill';
