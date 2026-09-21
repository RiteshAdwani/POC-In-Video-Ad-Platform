export type LoginRequestDto = {
  email: string;
  password: string;
};

// The full response body is ApiResponseBody<LoginResponseDto> - this is just the `data` payload.
export type LoginResponseDto = {
  accessToken: string;
};
