import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { DEFAULT_ADMIN_LIST_FILTERS } from '../../../constants/listView.constants';
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdvertisementsResponseDto } from '../../../dtos/advertisement.dto';

/**
 * @description Fetches the URL's page of the signed-in admin's active or deleted advertisements,
 * optionally filtered by a title search term.
 */
export const useAdsQuery = () =>
  usePaginatedQuery({
    queryKey: [QueryKeys.ADS],
    defaultFilters: DEFAULT_ADMIN_LIST_FILTERS,
    queryFn: async (params) => {
      const response = await axiosInstance.get<ApiResponseBody<AdvertisementsResponseDto>>(
        ApiRoutes.getAds(),
        { params },
      );
      return response.data.data;
    },
  });
