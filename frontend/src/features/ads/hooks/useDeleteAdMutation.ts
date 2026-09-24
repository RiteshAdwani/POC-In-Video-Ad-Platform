import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';

/**
 * @description Deletes an advertisement. Rejected by the backend (409) if it's still placed on
 * any video. Refetches the ad list on success - `exact: true` so this doesn't also refetch the
 * just-deleted ad's own single-item query (a `useAdQuery(id)` consumer, e.g. the details page
 * mid-navigation-away, would otherwise get a spurious 404).
 */
export const useDeleteAdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QueryKeys.ADS],
    mutationFn: (id: string) => axiosInstance.delete<ApiResponseBody<null>>(ApiRoutes.deleteAd(id)),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADS], exact: true });
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
