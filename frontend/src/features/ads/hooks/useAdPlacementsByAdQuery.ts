import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { PLACEMENTS_PAGE_SIZE } from '../../../constants/pagination.constants';
import { useInfinitePaginatedQuery } from '../../../hooks/useInfinitePaginatedQuery';
import { selectAdPlacementPages } from '../../../lib/selectAdPlacementPages';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdPlacementsForAdResponseDto } from '../../../dtos/adPlacement.dto';

/**
 * @description Fetches an ad's placements across the videos it's on, for its details page's
 * "Placed on" list - one batch at a time as the list scrolls, the mirror of useAdPlacementsQuery.
 * Placements are only edited from a video's page, and this list is fetched fresh each time the
 * ad's page opens, so no mutation needs to invalidate it.
 */
export const useAdPlacementsByAdQuery = (adId: string | undefined) =>
  useInfinitePaginatedQuery({
    queryKey: [QueryKeys.AD_PLACEMENTS_BY_AD, adId],
    pageSize: PLACEMENTS_PAGE_SIZE,
    queryFn: async (params) => {
      const response = await axiosInstance.get<ApiResponseBody<AdPlacementsForAdResponseDto>>(
        ApiRoutes.getAdPlacementsForAd(adId!),
        { params },
      );
      return response.data.data;
    },
    select: selectAdPlacementPages,
    enabled: Boolean(adId),
  });
