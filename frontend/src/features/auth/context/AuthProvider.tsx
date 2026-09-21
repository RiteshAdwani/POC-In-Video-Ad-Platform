import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clearAuthToken, getAuthToken, setAuthToken } from '../../../lib/authToken';
import { setUnauthorizedListener } from '../../../lib/authEvents';
import { AuthContext } from './authContext';

/**
 * @description Tracks whether an admin is signed in, backed by the token in localStorage - the
 * one place login/logout update both the stored token and the app's own re-render trigger, since
 * writing to localStorage alone doesn't notify React (or the route guards watching this) of
 * anything.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAuthToken()));

  const login = useCallback((token: string) => {
    setAuthToken(token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  );

  /**
   * @description Lets axiosInstance's response interceptor force a logout on a 401 (expired/
   * invalid token) - it lives outside the React tree, so this is how it reaches this state.
   */
  useEffect(() => {
    setUnauthorizedListener(logout);
    return () => setUnauthorizedListener(null);
  }, [logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
