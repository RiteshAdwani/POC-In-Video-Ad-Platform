import axios, { type AxiosError } from 'axios';
import {
  REQUEST_REF_LENGTH,
  SERVER_ERROR_MIN_STATUS,
  ToastMessages,
} from '../constants/toastMessages.constants';
import type { ErrorResponseBody } from '../types/errorResponse.types';
import { toastNotify } from './toastNotify';

/**
 * @description Extracts a human-readable message from any axios failure. The backend always
 * sends a `message` string (validation, auth, conflict, or a raw 500 all carry one) - the
 * fallbacks only cover a true network failure (no response at all) or a route that never reaches
 * our error handler (no `message` field). For a server error (5xx), a short "ref" from the
 * request id is appended, so the user can quote it and the request's log lines can be found.
 */
export const getAxiosError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponseBody>;
    if (!axiosError.response) {
      return ToastMessages.NETWORK_ERROR;
    }
    const message = axiosError.response.data?.message ?? ToastMessages.SOMETHING_WRONG;
    const requestId = axiosError.response.data?.requestId;
    const isServerError = axiosError.response.status >= SERVER_ERROR_MIN_STATUS;
    return isServerError && requestId
      ? ToastMessages.withRequestRef(message, requestId.slice(0, REQUEST_REF_LENGTH))
      : message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return ToastMessages.SOMETHING_WRONG;
};

/**
 * @description Reads the message off an axios failure and shows it as a toast - the one place
 * every mutation's error path should call into, instead of each reimplementing this.
 */
export const handleAxiosError = (error: unknown) => {
  toastNotify('error', getAxiosError(error));
};
