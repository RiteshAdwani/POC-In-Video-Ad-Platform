export type ErrorResponseBody = {
  message: string;
  // The id the backend tagged this request's log lines with.
  requestId?: string;
  errors: Array<{
    code: string;
    details: string;
    field?: string;
  }>;
};
