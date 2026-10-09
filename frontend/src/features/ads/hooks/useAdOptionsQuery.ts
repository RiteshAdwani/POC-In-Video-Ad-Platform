import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { useInfinitePaginatedQuery } from '../../../hooks/useInfinitePaginatedQuery';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdvertisementsResponseDto } from '../../../dtos/advertisement.dto';

/**
 * @description Fetches every advertisement owned by the signed-in admin, one page at a time, for
 * a scrollable selection dropdown (e.g. CreateEditAdPlacementModal) rather than the admin list
 * page's numbered pagination - fetchNextPage pulls in the next page as the dropdown scrolls near
 * its bottom, instead of loading the whole ad library upfront.
 */
export const useAdOptionsQuery = (enabled: boolean) =>
  useInfinitePaginatedQuery({
    queryKey: [QueryKeys.ADS],
    queryFn: async (params) => {
      const response = await axiosInstance.get<ApiResponseBody<AdvertisementsResponseDto>>(
        ApiRoutes.getAds(),
        { params },
      );
      return response.data.data;
    },
    enabled,
  });
