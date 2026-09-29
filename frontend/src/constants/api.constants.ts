const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN ?? '';

// Origin only, not the API path - the version segment is appended in axiosInstance.ts instead,
// so a version bump is a code change, not something that means updating a deployed env var too.
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;
