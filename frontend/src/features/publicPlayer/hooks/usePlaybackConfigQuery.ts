import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { POLL_WHILE_VIDEO_NOT_READY_MS, VideoStatus } from '../../../constants/video.constants';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { PlaybackConfig } from '../../../types/playback.types';

/**
 * @description Fetches a video's playback config, polling every 5s while it isn't READY yet -
 * picks up the backend's own poller flipping the status without a manual page refresh.
 */
export const usePlaybackConfigQuery = (videoId: string | undefined) =>
  useQuery({
    queryKey: [QueryKeys.PLAYBACK_CONFIG, videoId],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponseBody<PlaybackConfig>>(
        ApiRoutes.getPlaybackConfig(videoId!),
      );
      return response.data.data;
    },
    enabled: Boolean(videoId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const stillWaiting = status === VideoStatus.PROCESSING;
      return stillWaiting ? POLL_WHILE_VIDEO_NOT_READY_MS : false;
    },
  });
