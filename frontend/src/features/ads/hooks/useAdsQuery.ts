import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { DEFAULT_PAGE_SIZE } from '../../../constants/pagination.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdvertisementsResponseDto } from '../../../dtos/advertisement.dto';

/**
 * @description Fetches one page of advertisements owned by the signed-in admin.
 */
export const useAdsQuery = (page: number) =>
  useQuery({
    queryKey: [QueryKeys.ADS, page],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponseBody<AdvertisementsResponseDto>>(
        ApiRoutes.getAds(),
        { params: { page, pageSize: DEFAULT_PAGE_SIZE } },
      );
      return response.data.data;
    },
  });
