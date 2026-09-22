import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { PublicVideosResponseDto } from '../../../dtos/playback.dto';

/**
 * @description Fetches every READY video, for the public catalog landing page - no auth, no
 * ownership scoping, unlike the admin videos list.
 */
export const usePublicVideosQuery = () =>
  useQuery({
    queryKey: [QueryKeys.PUBLIC_VIDEOS],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponseBody<PublicVideosResponseDto>>(
        ApiRoutes.getPublicVideos(),
      );
      return response.data.data.videos;
    },
  });
