import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Routes } from '../../../../constants/routes.constants';
import { useAuth } from '../../hooks/useAuth';

/**
 * @description Guards the login page - an already-signed-in admin skips straight past it instead
 * of being shown the form again.
 */
export const RequireGuest = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={Routes.VIDEOS} replace />;
  }

  return children;
};
