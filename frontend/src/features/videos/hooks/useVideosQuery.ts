import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { POLL_WHILE_VIDEO_NOT_READY_MS, VideoStatus } from '../../../constants/video.constants';
import { DEFAULT_ADMIN_LIST_FILTERS } from '../../../constants/listView.constants';
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { VideosResponseDto } from '../../../dtos/video.dto';

/**
 * @description Fetches the URL's page of the signed-in admin's active or deleted videos, optionally
 * filtered by a title search term, polling every 5s while any of them isn't READY yet - picks up the backend's
 * own poller flipping a video's status without a manual page refresh.
 */
export const useVideosQuery = () =>
  usePaginatedQuery({
    queryKey: [QueryKeys.VIDEOS],
    defaultFilters: DEFAULT_ADMIN_LIST_FILTERS,
    queryFn: async (params) => {
      const response = await axiosInstance.get<ApiResponseBody<VideosResponseDto>>(
        ApiRoutes.getVideos(),
        { params },
      );
      return response.data.data;
    },
    refetchInterval: (query) => {
      const stillWaiting = query.state.data?.videos.some(
        (video) => video.status === VideoStatus.PROCESSING,
      );
      return stillWaiting ? POLL_WHILE_VIDEO_NOT_READY_MS : false;
    },
  });
