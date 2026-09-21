import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Routes } from '../../../../constants/routes.constants';
import { useAuth } from '../../hooks/useAuth';

/**
 * @description Guards a private route - sends a signed-out admin to the login page, remembering
 * where they were headed so SignInForm can send them back after a successful login.
 */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={Routes.LOGIN} replace state={{ from: location }} />;
  }

  return children;
};
