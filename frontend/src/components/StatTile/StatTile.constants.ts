// Each value is the suffix of its --fc-metric-* colour in index.css.
export const StatMetric = {
  IMPRESSIONS: 'impressions',
  COMPLETIONS: 'completions',
  SKIPS: 'skips',
  CLICKS: 'clicks',
  PLAYS: 'plays',
  VIDEO_COMPLETIONS: 'video-completions',
} as const;

export type StatMetric = (typeof StatMetric)[keyof typeof StatMetric];

// Ad metrics are marked with the cue diamond, video metrics with a dot - as on the dashboard.
export const StatMarker = {
  DIAMOND: 'diamond',
  DOT: 'dot',
} as const;

export type StatMarker = (typeof StatMarker)[keyof typeof StatMarker];

// Height of a tile's trend sparkline - it sits beside the value, so it matches that line.
export const STAT_TILE_SPARKLINE_HEIGHT = 34;

export const STAT_TILE_SPARKLINE_LINE_WIDTH = 2;
