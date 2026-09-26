import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { POLL_WHILE_VIDEO_NOT_READY_MS, VideoStatus } from '../../../constants/video.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { VideosResponseDto } from '../../../dtos/video.dto';

/**
 * @description Fetches every video owned by the signed-in admin, polling every 5s while any of
 * them isn't READY yet - picks up the backend's own poller flipping a video's status without a
 * manual page refresh.
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
    refetchInterval: (query) => {
      const stillWaiting = query.state.data?.some(
        (video) => video.status === VideoStatus.PROCESSING,
      );
      return stillWaiting ? POLL_WHILE_VIDEO_NOT_READY_MS : false;
    },
  });
