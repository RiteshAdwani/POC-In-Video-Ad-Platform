export const ErrorMessages = {
  MISSING_AUTH_HEADER: 'Missing or malformed Authorization header',
  INVALID_ACCESS_TOKEN: 'Invalid or expired access token',
  INTERNAL_ERROR: 'Something went wrong',
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_REQUEST_BODY: 'Invalid request body',
  MISSING_VIDEO_FILE: 'No video file was provided',
  VIDEO_UPLOAD_FAILED: 'Failed to upload video to the hosting service',
} as const;
