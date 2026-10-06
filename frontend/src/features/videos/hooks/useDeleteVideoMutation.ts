import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';

/**
 * @description Deletes a video - a soft delete on the backend, so its analytics history stays
 * intact. Refetches every video query on success, including this video's own
 * single-item one if it's mounted elsewhere (e.g. its details page open in another tab) - that
 * page already renders a clean 404 Result for a missing video, so showing it the fact promptly
 * beats leaving stale, now-broken data on screen.
 */
export const useDeleteVideoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QueryKeys.VIDEOS],
    mutationFn: (id: string) =>
      axiosInstance.delete<ApiResponseBody<null>>(ApiRoutes.deleteVideo(id)),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VIDEOS] });
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
