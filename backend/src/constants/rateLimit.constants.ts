const MINUTE_MS = 60 * 1000;

// Per IP. Only failed attempts count, so an admin who logs in fine never uses this up.
export const LOGIN_RATE_LIMIT = { windowMs: 15 * MINUTE_MS, limit: 10 };
// Per IP. Generous - many real viewers can share one public IP (an office, a mobile carrier).
export const PLAYBACK_EVENTS_RATE_LIMIT = { windowMs: MINUTE_MS, limit: 300 };
// Per IP - the catalog and playback config reads.
export const PUBLIC_READ_RATE_LIMIT = { windowMs: MINUTE_MS, limit: 120 };
// Per admin - every route behind login.
export const ADMIN_API_RATE_LIMIT = { windowMs: MINUTE_MS, limit: 300 };
// Per admin - each upload costs Cloudinary bandwidth and storage.
export const UPLOAD_RATE_LIMIT = { windowMs: 60 * MINUTE_MS, limit: 20 };
// Per admin - each run re-aggregates a whole day.
export const AGGREGATION_RATE_LIMIT = { windowMs: MINUTE_MS, limit: 5 };
