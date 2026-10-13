import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { useInvalidateQueries } from '../../../hooks/useInvalidateQueries';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { VideoResponseDto } from '../../../dtos/video.dto';

type UploadVideoVariables = {
  formData: FormData;
};

/**
 * @description Uploads a new video - multipart, since it carries the actual file alongside its
 * title/description. The caller builds the FormData (see VideosPage); this just posts it.
 * Refetches the video list on success so the new (PROCESSING) row shows up.
 */
export const useUploadVideoMutation = () => {
  const invalidateQueries = useInvalidateQueries();

  return useMutation({
    mutationKey: [QueryKeys.VIDEOS],
    mutationFn: ({ formData }: UploadVideoVariables) =>
      axiosInstance.post<ApiResponseBody<VideoResponseDto>>(ApiRoutes.createVideo(), formData),
    onSuccess: (response) => {
      invalidateQueries([QueryKeys.VIDEOS]);
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
