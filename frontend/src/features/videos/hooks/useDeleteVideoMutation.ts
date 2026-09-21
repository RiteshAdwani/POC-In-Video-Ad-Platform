import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { handleAxiosError } from '../../../lib/axiosError';

/**
 * @description Deletes a video. Rejected by the backend (409) if it still has ad placements or
 * recorded playback events. Refetches the video list on success - `exact: true` so this doesn't
 * also refetch the just-deleted video's own single-item query (a `useVideoQuery(id)` consumer,
 * e.g. the details page mid-navigation-away, would otherwise get a spurious 404).
 */
export const useDeleteVideoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QueryKeys.VIDEOS],
    mutationFn: (id: string) => axiosInstance.delete(ApiRoutes.deleteVideo(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VIDEOS], exact: true });
    },
    onError: handleAxiosError,
  });
};
