export type DashboardStats = {
  impressions: number;
  completions: number;
  skips: number;
  clicks: number;
  completionRate: number;
  skipRate: number;
  ctr: number;
  videoViews: number;
  videoCompletions: number;
  videoCompletionRate: number;
};

// How much of each total count came from since-deleted videos/placements.
export type DeletedContribution = Pick<
  DashboardStats,
  'impressions' | 'completions' | 'skips' | 'clicks' | 'videoViews' | 'videoCompletions'
>;

export type DashboardSeriesPoint = DashboardStats & { day: string };
