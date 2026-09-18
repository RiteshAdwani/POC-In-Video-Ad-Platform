import axios from 'axios';

/**
 * @description The one shared HTTP client for the app - every request goes through this, so
 * base URL/interceptor changes happen in one place.
 */
export const axiosInstance = axios.create({
  baseURL: '/api/v1',
});
