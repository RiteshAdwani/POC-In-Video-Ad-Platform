// How often the scheduler ticks and (re)runs aggregation - hourly is the agreed default for a
// "daily counts" system; sub-minute freshness isn't meaningful at day granularity, and "today"
// is expected to look stale-until-the-next-run in the dashboard, not live.
export const AGGREGATION_INTERVAL_MS = 60 * 60 * 1000;

// A day is only ever re-aggregated automatically within this many hours of "now" - a late event
// for a day older than this is still accepted into PlaybackEvent (the raw log never rejects a
// late arrival), but won't retroactively change an already-reported dashboard number on its own.
// Correcting a day past this cutoff requires the explicit manual re-aggregation entry point.
export const AGGREGATION_GRACE_WINDOW_HOURS = 48;

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
