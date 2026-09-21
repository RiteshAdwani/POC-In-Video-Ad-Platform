export const ApiRoutes = {
  login: () => '/auth/login',
  getVideos: () => '/videos',
  createVideo: () => '/videos',
  getVideoById: (id: string) => `/videos/${id}`,
  updateVideo: (id: string) => `/videos/${id}`,
  deleteVideo: (id: string) => `/videos/${id}`,
} as const;
