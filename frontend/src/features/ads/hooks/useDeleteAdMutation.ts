import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';

/**
 * @description Deletes an advertisement. Rejected by the backend (409) if it's still placed on
 * any video. Refetches every ad query on success, including this ad's own single-item one if it's
 * mounted elsewhere (e.g. its details page open in another tab) - that page already renders a
 * clean 404 Result for a missing ad, so showing it the fact promptly beats leaving stale,
 * now-broken data on screen.
 */
export const useDeleteAdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QueryKeys.ADS],
    mutationFn: (id: string) => axiosInstance.delete<ApiResponseBody<null>>(ApiRoutes.deleteAd(id)),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADS] });
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
