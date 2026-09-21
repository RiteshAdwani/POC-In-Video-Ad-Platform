export const ApiRoutes = {
  login: () => '/auth/login',
  getVideos: () => '/videos',
  createVideo: () => '/videos',
  getVideoById: (id: string) => `/videos/${id}`,
  updateVideo: (id: string) => `/videos/${id}`,
  deleteVideo: (id: string) => `/videos/${id}`,
  getAds: () => '/advertisements',
  createAd: () => '/advertisements',
  getAdById: (id: string) => `/advertisements/${id}`,
  updateAd: (id: string) => `/advertisements/${id}`,
  deleteAd: (id: string) => `/advertisements/${id}`,
} as const;
