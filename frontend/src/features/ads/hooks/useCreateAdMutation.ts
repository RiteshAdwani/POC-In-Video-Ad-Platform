import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { AdvertisementResponseDto } from '../../../dtos/advertisement.dto';

/**
 * @description Creates a new advertisement - multipart, since it carries the actual creative
 * file alongside its title/description/click-through URL. The caller builds the FormData (see
 * AdsPage); this just posts it. Refetches the ad list on success.
 */
export const useCreateAdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [QueryKeys.ADS],
    mutationFn: (formData: FormData) =>
      axiosInstance.post<ApiResponseBody<AdvertisementResponseDto>>(ApiRoutes.createAd(), formData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADS] });
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
