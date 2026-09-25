// A real client reports occurredAt right as the moment happens - some clock skew/network delay is
// normal, but anything further out than this isn't a live playback timestamp anymore. Rejecting it
// stops a single request from planting a fact into a calendar day the aggregation job will never
// revisit (see AGGREGATION_GRACE_WINDOW_HOURS) or into a day that doesn't exist yet.
export const MAX_OCCURRED_AT_FUTURE_MS = 5 * 60 * 1000;
export const MAX_OCCURRED_AT_PAST_MS = 30 * 24 * 60 * 60 * 1000;

// The frontend only ever sends a 36-character crypto.randomUUID() - generous headroom, not a tight
// fit, just a sane cap on an otherwise-unbounded string column.
export const MAX_SESSION_ID_LENGTH = 200;
