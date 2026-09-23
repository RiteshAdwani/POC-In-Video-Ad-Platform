import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { DashboardResponseDto, GetDashboardRequestDto } from '../../../dtos/dashboard.dto';

/**
 * @description Fetches impressions/completion-rate/CTR totals and a day-by-day trend series for
 * the given date range, scoped to the signed-in admin's own videos.
 */
export const useDashboardStatsQuery = (filters: GetDashboardRequestDto) =>
  useQuery({
    queryKey: [QueryKeys.DASHBOARD, filters],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponseBody<DashboardResponseDto>>(
        ApiRoutes.getDashboard(),
        { params: filters },
      );
      return response.data.data;
    },
  });
