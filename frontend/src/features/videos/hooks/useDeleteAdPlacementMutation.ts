import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { handleAxiosError } from '../../../lib/axiosError';

/**
 * @description Removes an ad placement. Rejected by the backend (409) if playback events still
 * reference it. Also invalidates the video's own query (its adPlacementCount just changed) and
 * the ads list/details (the removed ad's own placementCount just changed too), on top of this
 * video's placements list.
 */
export const useDeleteAdPlacementMutation = (videoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QueryKeys.AD_PLACEMENTS, videoId],
    mutationFn: (id: string) => axiosInstance.delete(ApiRoutes.deleteAdPlacement(videoId, id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.AD_PLACEMENTS, videoId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VIDEOS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADS] });
    },
    onError: handleAxiosError,
  });
};
