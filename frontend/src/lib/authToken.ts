import { ACCESS_TOKEN_KEY } from '../constants/auth.constants';

/**
 * @description Reads the stored access token, or null if the admin isn't signed in.
 */
export const getAuthToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);

/**
 * @description Persists the access token after a successful login.
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * @description Clears the stored access token on logout, or once the server rejects it as
 * expired/invalid.
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};
