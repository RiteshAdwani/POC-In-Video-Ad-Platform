import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { UpdateVideoRequestDto, VideoResponseDto } from '../../../dtos/video.dto';

/**
 * @description Updates a video's title/description - the file itself isn't editable here.
 * Refetches both the list and this video's own details on success.
 */
export const useUpdateVideoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QueryKeys.VIDEOS],
    mutationFn: ({ id, data }: { id: string; data: UpdateVideoRequestDto }) =>
      axiosInstance.patch<ApiResponseBody<VideoResponseDto>>(ApiRoutes.updateVideo(id), data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VIDEOS] });
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
