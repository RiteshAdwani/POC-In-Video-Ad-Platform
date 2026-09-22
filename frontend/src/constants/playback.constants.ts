// video_started/video_finished describe the video itself; the other four describe one specific
// ad impression - mirrors the backend's own PlaybackEventType enum.
export const PlaybackEventType = {
  VIDEO_STARTED: 'VIDEO_STARTED',
  VIDEO_FINISHED: 'VIDEO_FINISHED',
  AD_SHOWN: 'AD_SHOWN',
  AD_SKIPPED: 'AD_SKIPPED',
  AD_COMPLETED: 'AD_COMPLETED',
  AD_CLICKED: 'AD_CLICKED',
} as const;

export type PlaybackEventType = (typeof PlaybackEventType)[keyof typeof PlaybackEventType];

// Prefix for the sessionStorage key getOrCreateSessionId reads/writes.
export const SESSION_KEY_PREFIX = 'playback-session:';

// UI-only states PlaybackStatusScreen can render that have no backend VideoStatus equivalent.
export const PlaybackScreenStatus = {
  MISSING_ID: 'missing-id',
  LOADING: 'loading',
  ERROR: 'error',
} as const;

export type PlaybackScreenStatus = (typeof PlaybackScreenStatus)[keyof typeof PlaybackScreenStatus];
