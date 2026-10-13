import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { useInvalidateQueries } from '../../../hooks/useInvalidateQueries';
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
  const invalidateQueries = useInvalidateQueries();

  return useMutation({
    mutationKey: [QueryKeys.ADS],
    mutationFn: (formData: FormData) =>
      axiosInstance.post<ApiResponseBody<AdvertisementResponseDto>>(ApiRoutes.createAd(), formData),
    onSuccess: (response) => {
      invalidateQueries([QueryKeys.ADS]);
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
