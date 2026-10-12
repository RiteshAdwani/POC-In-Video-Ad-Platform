import dayjs from 'dayjs';
import { BrandColor, BrandColorOnDark, ThemeMode } from './theme.constants';

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

// What happened to an ad impression, for DashboardOutcomeBreakdown - a frontend-derived grouping
// of impressions/completions/skips, not a backend enum.
export const Outcome = {
  COMPLETED: 'Watched to the end',
  SKIPPED: 'Skipped',
  NO_OUTCOME_YET: 'No outcome yet',
} as const;

export type Outcome = (typeof Outcome)[keyof typeof Outcome];

// The four series DashboardTrendChart plots - also each metric's own display label/legend text.
export const AdTrendMetric = {
  IMPRESSIONS: 'Impressions',
  COMPLETIONS: 'Completions',
  SKIPS: 'Skips',
  CLICKS: 'Clicks',
} as const;

export type AdTrendMetric = (typeof AdTrendMetric)[keyof typeof AdTrendMetric];

// The two series VideoTrendChart plots - the video-side mirror of AdTrendMetric.
export const VideoTrendMetric = {
  PLAYS: 'Plays',
  VIDEO_COMPLETIONS: 'Video completions',
} as const;

export type VideoTrendMetric = (typeof VideoTrendMetric)[keyof typeof VideoTrendMetric];

// Every metric keeps one colour across its tile, split bar and chart line. These mirror the
// --fc-metric-* CSS variables in index.css, which the non-chart elements use.
export const AD_TREND_METRIC_COLORS: Record<ThemeMode, Record<AdTrendMetric, string>> = {
  [ThemeMode.LIGHT]: {
    [AdTrendMetric.IMPRESSIONS]: BrandColor.ORCHID,
    [AdTrendMetric.COMPLETIONS]: BrandColor.INDIGO,
    [AdTrendMetric.SKIPS]: BrandColor.PERIWINKLE,
    [AdTrendMetric.CLICKS]: BrandColor.MINT,
  },
  [ThemeMode.DARK]: {
    [AdTrendMetric.IMPRESSIONS]: BrandColor.ORCHID,
    [AdTrendMetric.COMPLETIONS]: BrandColorOnDark.INDIGO,
    [AdTrendMetric.SKIPS]: BrandColor.PERIWINKLE,
    [AdTrendMetric.CLICKS]: BrandColor.MINT,
  },
};

export const VIDEO_TREND_METRIC_COLORS: Record<ThemeMode, Record<VideoTrendMetric, string>> = {
  [ThemeMode.LIGHT]: {
    [VideoTrendMetric.PLAYS]: BrandColor.VIOLET,
    [VideoTrendMetric.VIDEO_COMPLETIONS]: BrandColor.BLUE,
  },
  [ThemeMode.DARK]: {
    [VideoTrendMetric.PLAYS]: BrandColorOnDark.VIOLET,
    [VideoTrendMetric.VIDEO_COMPLETIONS]: BrandColor.BLUE,
  },
};

// G2's built-in chart themes, matched to the app's light/dark mode.
export const CHART_THEME: Record<ThemeMode, string> = {
  [ThemeMode.LIGHT]: 'classic',
  [ThemeMode.DARK]: 'classicDark',
};

export const TREND_CHART_HEIGHT = 300;

// Axis setup shared by both trend charts - short day labels kept level, thinned out when they
// would overlap, rather than every full date rotated sideways.
export const TREND_CHART_AXIS = {
  x: {
    labelFormatter: (day: string) => dayjs(day).format('MMM D'),
    labelAutoRotate: false,
    labelAutoHide: true,
  },
  y: { labelFormatter: (value: number) => value.toLocaleString() },
};

// The dashboard's two halves - each gets its own KPI tiles and charts.
export const DashboardSection = {
  ADS: 'ads',
  VIDEOS: 'videos',
} as const;

export type DashboardSection = (typeof DashboardSection)[keyof typeof DashboardSection];
