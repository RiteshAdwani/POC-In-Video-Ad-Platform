import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { DEFAULT_PAGE_SIZE } from '../../../constants/pagination.constants';
import { ListView } from '../../../constants/listView.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdvertisementsResponseDto } from '../../../dtos/advertisement.dto';

/**
 * @description Fetches one page of the signed-in admin's active or deleted advertisements,
 * optionally filtered by a title search term.
 */
export const useAdsQuery = (page: number, search: string, view: ListView) =>
  useQuery({
    queryKey: [QueryKeys.ADS, page, search, view],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponseBody<AdvertisementsResponseDto>>(
        ApiRoutes.getAds(),
        {
          params: {
            page,
            pageSize: DEFAULT_PAGE_SIZE,
            search,
            deleted: view === ListView.DELETED,
          },
        },
      );
      return response.data.data;
    },
  });
