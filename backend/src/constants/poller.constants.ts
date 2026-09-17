// How often the poller's loop runs to check which videos are due - this is not how often any
// given video is actually re-checked against Cloudinary (see the backoff constants below); it's
// just the granularity at which "is it due yet" gets evaluated.
export const POLLER_INTERVAL_MS = 5_000;

// A freshly-PROCESSING video is checked this soon after we start tracking it.
export const INITIAL_BACKOFF_MS = 5_000;

// Each check that comes back still-PROCESSING doubles the wait before the next one, capped here -
// keeps a long-running transcode from being hammered every few seconds and burning through
// Cloudinary's Admin API rate limit (500 requests/hour on a standard plan).
export const BACKOFF_MULTIPLIER = 2;
export const MAX_BACKOFF_MS = 5 * 60 * 1000;

// A video still PROCESSING this long after upload, with no ready/failed signal from Cloudinary
// either way, is treated as failed rather than polled forever. Cloudinary publishes no fixed SLA
// for eager transformation time, so this is a heuristic cutoff, not a guarantee.
export const MAX_PROCESSING_AGE_MS = 30 * 60 * 1000;
