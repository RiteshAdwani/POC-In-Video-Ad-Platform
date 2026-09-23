// Default date-range width the dashboard opens with, before the admin picks their own.
export const DEFAULT_RANGE_DAYS = 7;

// Shared by the ?startDate=/?endDate= URL params and the dashboard API request - both read/write
// the same plain calendar-day string.
export const DASHBOARD_DATE_FORMAT = 'YYYY-MM-DD';

// What happened to an ad impression, for DashboardOutcomeBreakdown's donut - a frontend-derived
// grouping of impressions/completions/skips, not a backend enum.
export const Outcome = {
  COMPLETED: 'Completed',
  SKIPPED: 'Skipped',
  NO_OUTCOME_YET: 'No outcome yet',
} as const;

export type Outcome = (typeof Outcome)[keyof typeof Outcome];

export const OUTCOME_COLORS: Record<Outcome, string> = {
  [Outcome.COMPLETED]: '#059669',
  [Outcome.SKIPPED]: '#F97316',
  [Outcome.NO_OUTCOME_YET]: '#C7D2FE',
};

export const OUTCOME_DOT_CLASS: Record<Outcome, string> = {
  [Outcome.COMPLETED]: 'dashboard-outcome-breakdown__dot--completed',
  [Outcome.SKIPPED]: 'dashboard-outcome-breakdown__dot--skipped',
  [Outcome.NO_OUTCOME_YET]: 'dashboard-outcome-breakdown__dot--pending',
};
