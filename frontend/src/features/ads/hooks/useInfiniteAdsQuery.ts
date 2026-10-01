import { useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { DEFAULT_PAGE_SIZE } from '../../../constants/pagination.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdvertisementsResponseDto } from '../../../dtos/advertisement.dto';

/**
 * @description Fetches every advertisement owned by the signed-in admin, one page at a time, for
 * a scrollable selection dropdown (e.g. CreateEditAdPlacementModal) rather than the admin list
 * page's numbered pagination - fetchNextPage pulls in the next page as the dropdown scrolls near
 * its bottom, instead of loading the whole ad library upfront.
 */
export const useInfiniteAdsQuery = (enabled: boolean) =>
  useInfiniteQuery({
    queryKey: [QueryKeys.ADS],
    queryFn: async ({ pageParam }) => {
      const response = await axiosInstance.get<ApiResponseBody<AdvertisementsResponseDto>>(
        ApiRoutes.getAds(),
        { params: { page: pageParam, pageSize: DEFAULT_PAGE_SIZE } },
      );
      return response.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled,
  });
