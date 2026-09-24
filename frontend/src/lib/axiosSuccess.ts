import type { AxiosResponse } from 'axios';
import type { ApiResponseBody } from '../types/apiResponse.types';
import { toastNotify } from './toastNotify';

/**
 * @description Reads the message off a successful axios response and shows it as a toast - the
 * one place every mutation's success path should call into, instead of each reimplementing this.
 */
export const handleAxiosSuccess = (response: AxiosResponse<ApiResponseBody<unknown>>) => {
  toastNotify('success', response.data.message);
};
