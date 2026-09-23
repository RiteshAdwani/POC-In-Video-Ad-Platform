export type DashboardStats = {
  impressions: number;
  completions: number;
  skips: number;
  clicks: number;
  completionRate: number;
  ctr: number;
  videoViews: number;
  videoCompletions: number;
};

export type DashboardSeriesPoint = DashboardStats & { day: string };
