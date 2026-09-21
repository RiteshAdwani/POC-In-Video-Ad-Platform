import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { VideosResponseDto } from '../../../dtos/video.dto';

/**
 * @description Fetches every video owned by the signed-in admin.
 */
export const useVideosQuery = () =>
  useQuery({
    queryKey: [QueryKeys.VIDEOS],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponseBody<VideosResponseDto>>(
        ApiRoutes.getVideos(),
      );
      return response.data.data.videos;
    },
  });
