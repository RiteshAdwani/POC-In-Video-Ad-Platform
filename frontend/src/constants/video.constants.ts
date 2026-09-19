export const VideoStatus = {
  UPLOADING: 'UPLOADING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;

export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];

export const VIDEO_STATUS_LABEL: Record<VideoStatus, string> = {
  [VideoStatus.UPLOADING]: 'Uploading',
  [VideoStatus.PROCESSING]: 'Processing',
  [VideoStatus.READY]: 'Ready',
  [VideoStatus.FAILED]: 'Failed',
};
