import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/authContext';

/**
 * @description Reads auth state and the login/logout actions from the nearest AuthProvider.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
