import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axiosInstance';
import { ApiRoutes } from '../../../constants/apiRoutes.constants';
import { QueryKeys } from '../../../constants/queryKeys.constants';
import { handleAxiosError } from '../../../lib/axiosError';
import { handleAxiosSuccess } from '../../../lib/axiosSuccess';
import type { ApiResponseBody } from '../../../types/apiResponse.types';
import type { LoginRequestDto, LoginResponseDto } from '../../../dtos/login.dto';

/**
 * @description Verifies an admin's credentials against the backend and returns an access token.
 * Storing the token and redirecting are the caller's job (via AuthContext, in SignInForm's own
 * onSuccess) - this hook only owns the request itself and the pass/fail toast.
 */
export const useLoginMutation = () =>
  useMutation({
    mutationKey: [QueryKeys.LOGIN],
    mutationFn: (data: LoginRequestDto) =>
      axiosInstance.post<ApiResponseBody<LoginResponseDto>>(ApiRoutes.login(), data),
    onSuccess: handleAxiosSuccess,
    onError: handleAxiosError,
  });
