import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type {
  AdPlacementResponseDto,
  UpdateAdPlacementRequestDto,
} from '../../../dtos/adPlacement.dto';

/**
 * @description Updates a placement's type/position/timing - which ad is placed can't change
 * (only create/delete affect the video's or ad's placement counts, so this only invalidates the
 * placements list itself).
 */
export const useUpdateAdPlacementMutation = (videoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QueryKeys.AD_PLACEMENTS, videoId],
    mutationFn: ({ id, data }: { id: string; data: UpdateAdPlacementRequestDto }) =>
      axiosInstance.patch<ApiResponseBody<AdPlacementResponseDto>>(
        ApiRoutes.updateAdPlacement(videoId, id),
        data,
      ),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.AD_PLACEMENTS, videoId] });
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
