import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { useInvalidateQueries } from '../../../hooks/useInvalidateQueries';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type {
  AdvertisementResponseDto,
  UpdateAdvertisementRequestDto,
} from '../../../dtos/advertisement.dto';

/**
 * @description Updates an advertisement's title/description/click-through URL - the creative
 * file itself isn't editable here. Refetches both the list and this ad's own details on success.
 */
export const useUpdateAdMutation = () => {
  const invalidateQueries = useInvalidateQueries();

  return useMutation({
    mutationKey: [QueryKeys.ADS],
    mutationFn: ({ id, data }: { id: string; data: UpdateAdvertisementRequestDto }) =>
      axiosInstance.patch<ApiResponseBody<AdvertisementResponseDto>>(ApiRoutes.updateAd(id), data),
    onSuccess: (response) => {
      invalidateQueries([QueryKeys.ADS]);
      handleAxiosSuccess(response);
    },
    onError: handleAxiosError,
  });
};
