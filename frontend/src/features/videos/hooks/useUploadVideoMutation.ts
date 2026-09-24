import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { VideoResponseDto } from '../../../dtos/video.dto';

/**
 * @description Uploads a new video - multipart, since it carries the actual file alongside its
 * title/description. The caller builds the FormData (see VideosPage); this just posts it.
 * Refetches the video list on success so the new (PROCESSING) row shows up.
 */
export const useUploadVideoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QueryKeys.VIDEOS],
    mutationFn: (formData: FormData) =>
      axiosInstance.post<ApiResponseBody<VideoResponseDto>>(ApiRoutes.createVideo(), formData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VIDEOS] });
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
