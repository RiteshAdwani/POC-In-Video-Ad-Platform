// Default date-range width the dashboard opens with, before the admin picks their own.
export const DEFAULT_RANGE_DAYS = 7;

// Fixed lookback window for a placement row's own inline stats (AdPlacementsList and
// AdPlacementVideosList) - kept fixed rather than pickable, to not duplicate the detail page's own
// VideoStatsWidget/AdStatsWidget range control.
export const PLACEMENT_STATS_WINDOW_DAYS = 30;

// Shared by the ?startDate=/?endDate= URL params and the dashboard API request - both read/write
// the same plain calendar-day string.
export const DASHBOARD_DATE_FORMAT = 'YYYY-MM-DD';

// The pickable lookback windows on VideoStatsWidget's and AdStatsWidget's own Segmented range
// control - shared so the two widgets' controls can never quietly drift apart.
export const STATS_WIDGET_RANGE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export const CHART_CATEGORICAL_COLORS = ['#2563EB', '#EC4899', '#7C3AED', '#EF4444'] as const;

// What happened to an ad impression, for DashboardOutcomeBreakdown's donut - a frontend-derived
// grouping of impressions/completions/skips, not a backend enum.
export const Outcome = {
  COMPLETED: 'Completed',
  SKIPPED: 'Skipped',
  NO_OUTCOME_YET: 'No outcome yet',
} as const;

export type Outcome = (typeof Outcome)[keyof typeof Outcome];

export const OUTCOME_COLORS: Record<Outcome, string> = {
  [Outcome.COMPLETED]: CHART_CATEGORICAL_COLORS[0],
  [Outcome.SKIPPED]: CHART_CATEGORICAL_COLORS[1],
  [Outcome.NO_OUTCOME_YET]: CHART_CATEGORICAL_COLORS[2],
};

export const OUTCOME_DOT_CLASS: Record<Outcome, string> = {
  [Outcome.COMPLETED]: 'dashboard-outcome-breakdown__dot--completed',
  [Outcome.SKIPPED]: 'dashboard-outcome-breakdown__dot--skipped',
  [Outcome.NO_OUTCOME_YET]: 'dashboard-outcome-breakdown__dot--pending',
};

// What happened to a video play, for VideoOutcomeBreakdown's donut - binary (a play either
// finishes or it doesn't), unlike the ad outcome's three states.
export const VideoOutcome = {
  FINISHED: 'Finished',
  LEFT_EARLY: 'Left early',
} as const;

export type VideoOutcome = (typeof VideoOutcome)[keyof typeof VideoOutcome];

export const VIDEO_OUTCOME_COLORS: Record<VideoOutcome, string> = {
  [VideoOutcome.FINISHED]: CHART_CATEGORICAL_COLORS[0],
  [VideoOutcome.LEFT_EARLY]: CHART_CATEGORICAL_COLORS[1],
};

export const VIDEO_OUTCOME_DOT_CLASS: Record<VideoOutcome, string> = {
  [VideoOutcome.FINISHED]: 'video-outcome-breakdown__dot--finished',
  [VideoOutcome.LEFT_EARLY]: 'video-outcome-breakdown__dot--early',
};

// The four series DashboardTrendChart plots - also each metric's own display label/legend text.
export const AdTrendMetric = {
  IMPRESSIONS: 'Impressions',
  COMPLETIONS: 'Completions',
  SKIPS: 'Skips',
  CLICKS: 'Clicks',
} as const;

export type AdTrendMetric = (typeof AdTrendMetric)[keyof typeof AdTrendMetric];

// One color per metric, in the same fixed slot order as DashboardStatsGrid's four ad-performance
// tiles - see CHART_CATEGORICAL_COLORS for why the order matters.
export const AD_TREND_METRIC_COLORS: Record<AdTrendMetric, string> = {
  [AdTrendMetric.IMPRESSIONS]: CHART_CATEGORICAL_COLORS[0],
  [AdTrendMetric.COMPLETIONS]: CHART_CATEGORICAL_COLORS[1],
  [AdTrendMetric.SKIPS]: CHART_CATEGORICAL_COLORS[2],
  [AdTrendMetric.CLICKS]: CHART_CATEGORICAL_COLORS[3],
};

// The two series VideoTrendChart plots - the video-side mirror of AdTrendMetric.
export const VideoTrendMetric = {
  PLAYS: 'Plays',
  VIDEO_COMPLETIONS: 'Video completions',
} as const;

export type VideoTrendMetric = (typeof VideoTrendMetric)[keyof typeof VideoTrendMetric];

export const VIDEO_TREND_METRIC_COLORS: Record<VideoTrendMetric, string> = {
  [VideoTrendMetric.PLAYS]: CHART_CATEGORICAL_COLORS[0],
  [VideoTrendMetric.VIDEO_COMPLETIONS]: CHART_CATEGORICAL_COLORS[1],
};

// KPI tile active/deleted split bar - active takes the tile's own section accent, deleted is muted.
export const STATS_SPLIT_COLORS = {
  primary: '#2563eb',
  success: '#059669',
  deleted: '#cbd5e1',
} as const;
