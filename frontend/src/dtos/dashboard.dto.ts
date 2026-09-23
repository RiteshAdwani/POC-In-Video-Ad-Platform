import type { DashboardStats, DashboardSeriesPoint } from '../types/dashboard.types';

export type GetDashboardRequestDto = {
  startDate: string;
  endDate: string;
  videoId?: string;
  adPlacementId?: string;
};

export type DashboardResponseDto = DashboardStats & { series: DashboardSeriesPoint[] };
