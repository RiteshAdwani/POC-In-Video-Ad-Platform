import type {
  DashboardStats,
  DashboardSeriesPoint,
  DeletedContribution,
} from '../types/dashboard.types';

export type GetDashboardRequestDto = {
  startDate: string;
  endDate: string;
  videoId?: string;
  adPlacementId?: string;
  advertisementId?: string;
};

export type DashboardResponseDto = DashboardStats & {
  series: DashboardSeriesPoint[];
  deletedContribution: DeletedContribution;
};
