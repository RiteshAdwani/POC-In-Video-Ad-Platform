import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdvertisementResponseDto } from '../../../dtos/advertisement.dto';

/**
 * @description Fetches one advertisement by id, for the ad details page.
 */
export const useAdQuery = (adId: string | undefined) =>
  useQuery({
    queryKey: [QueryKeys.ADS, adId],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponseBody<AdvertisementResponseDto>>(
        ApiRoutes.getAdById(adId!),
      );
      return response.data.data.advertisement;
    },
    enabled: Boolean(adId),
  });
