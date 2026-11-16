// How much of a request id the error toast shows - enough to find the request's log lines.
export const REQUEST_REF_LENGTH = 8;
// The ref is shown only for server errors (5xx) - a 4xx message is one the user can act on alone.
export const SERVER_ERROR_MIN_STATUS = 500;

export const ToastMessages = {
  SOMETHING_WRONG: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error - check your connection and try again.',
  withRequestRef: (message: string, ref: string) => `${message} (ref: ${ref})`,
} as const;
