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

export type DashboardSeriesPoint = DashboardStats & { day: string };
