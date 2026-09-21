import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdPlacementsForAdResponseDto } from '../../../dtos/adPlacement.dto';

/**
 * @description Fetches every placement of one ad across all the videos it's on, for its details
 * page's "Placed on" list - the mirror of useAdPlacementsQuery. Keyed under AD_PLACEMENTS so it's
 * swept by the same cross-entity invalidation the video-scoped placements mutations already
 * trigger on create/delete.
 */
export const useAdPlacementsByAdQuery = (adId: string | undefined) =>
  useQuery({
    queryKey: [QueryKeys.AD_PLACEMENTS, 'ad', adId],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponseBody<AdPlacementsForAdResponseDto>>(
        ApiRoutes.getAdPlacementsForAd(adId!),
      );
      return response.data.data.adPlacements;
    },
    enabled: Boolean(adId),
  });
