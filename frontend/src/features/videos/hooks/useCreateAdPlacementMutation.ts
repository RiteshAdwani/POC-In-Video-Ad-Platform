import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { useInvalidateQueries } from '../../../hooks/useInvalidateQueries';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type {
  AdPlacementResponseDto,
  CreateAdPlacementRequestDto,
} from '../../../dtos/adPlacement.dto';

/**
 * @description Attaches an ad to this video at a position. Also invalidates the video's own
 * query (its adPlacementCount just changed) and the ads list/details (the placed ad's own
 * adPlacementCount just changed too), on top of this video's placements list.
 */
export const useCreateAdPlacementMutation = (videoId: string) => {
  const invalidateQueries = useInvalidateQueries();

  return useMutation({
    mutationKey: [QueryKeys.AD_PLACEMENTS, videoId],
    mutationFn: (data: CreateAdPlacementRequestDto) =>
      axiosInstance.post<ApiResponseBody<AdPlacementResponseDto>>(
        ApiRoutes.createAdPlacement(videoId),
        data,
      ),
    onSuccess: (response) => {
      invalidateQueries([QueryKeys.AD_PLACEMENTS, QueryKeys.VIDEOS, QueryKeys.ADS]);
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
