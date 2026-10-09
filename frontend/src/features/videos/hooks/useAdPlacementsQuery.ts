import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { PLACEMENTS_PAGE_SIZE } from '../../../constants/pagination.constants';
import { useInfinitePaginatedQuery } from '../../../hooks/useInfinitePaginatedQuery';
import { selectAdPlacementPages } from '../../../lib/selectAdPlacementPages';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdPlacementsResponseDto } from '../../../dtos/adPlacement.dto';

/**
 * @description Fetches a video's ad placements for its details page, one batch at a time as the
 * list scrolls - flattened into a single list, with the total for the section's heading.
 */
export const useAdPlacementsQuery = (videoId: string | undefined) =>
  useInfinitePaginatedQuery({
    queryKey: [QueryKeys.AD_PLACEMENTS, videoId],
    pageSize: PLACEMENTS_PAGE_SIZE,
    queryFn: async (params) => {
      const response = await axiosInstance.get<ApiResponseBody<AdPlacementsResponseDto>>(
        ApiRoutes.getAdPlacements(videoId!),
        { params },
      );
      return response.data.data;
    },
    select: selectAdPlacementPages,
    enabled: Boolean(videoId),
  });
