export type ErrorResponseBody = {
  message: string;
  errors: Array<{
    code: string;
    details: string;
    field?: string;
  }>;
};
