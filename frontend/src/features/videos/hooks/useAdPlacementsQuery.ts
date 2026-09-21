import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdPlacementsResponseDto } from '../../../dtos/adPlacement.dto';

/**
 * @description Fetches every ad placement on a video, for its details page.
 */
export const useAdPlacementsQuery = (videoId: string | undefined) =>
  useQuery({
    queryKey: [QueryKeys.AD_PLACEMENTS, videoId],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponseBody<AdPlacementsResponseDto>>(
        ApiRoutes.getAdPlacements(videoId!),
      );
      return response.data.data.adPlacements;
    },
    enabled: Boolean(videoId),
  });
