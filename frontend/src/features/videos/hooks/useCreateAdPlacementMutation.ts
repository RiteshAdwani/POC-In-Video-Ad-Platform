import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QueryKeys.AD_PLACEMENTS, videoId],
    mutationFn: (data: CreateAdPlacementRequestDto) =>
      axiosInstance.post<ApiResponseBody<AdPlacementResponseDto>>(
        ApiRoutes.createAdPlacement(videoId),
        data,
      ),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.AD_PLACEMENTS, videoId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VIDEOS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADS] });
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
