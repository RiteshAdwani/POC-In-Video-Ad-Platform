import axios from 'axios';
import { ApiRoutes } from '../constants/apiRoutes.constants';
import { getAuthToken } from '../lib/authToken';
import { notifyUnauthorized } from '../lib/authEvents';

/**
 * @description The one shared HTTP client for the app - every request goes through this, so
 * base URL/interceptor changes happen in one place.
 */
export const axiosInstance = axios.create({
  baseURL: '/api/v1',
});

/**
 * @description Attaches the stored access token to every outgoing request, if there is one -
 * requests made while logged out (e.g. login itself) simply go without the header.
 */
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * @description A 401 on any request other than login itself means the stored token is
 * missing/expired/invalid - notifies AuthContext so it logs the admin out immediately, rather than
 * leaving them stuck re-hitting the same failing request. Login's own 401 (wrong credentials) is
 * excluded since there's no session to end.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url === ApiRoutes.login();
    if (error.response?.status === 401 && !isLoginRequest) {
      notifyUnauthorized();
    }
    return Promise.reject(error);
  },
);
