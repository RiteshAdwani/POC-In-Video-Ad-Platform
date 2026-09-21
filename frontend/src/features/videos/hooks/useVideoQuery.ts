import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { VideoResponseDto } from '../../../dtos/video.dto';

/**
 * @description Fetches one video by id, for the video details page.
 */
export const useVideoQuery = (videoId: string | undefined) =>
  useQuery({
    queryKey: [QueryKeys.VIDEOS, videoId],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponseBody<VideoResponseDto>>(
        ApiRoutes.getVideoById(videoId!),
      );
      return response.data.data.video;
    },
    enabled: Boolean(videoId),
  });
