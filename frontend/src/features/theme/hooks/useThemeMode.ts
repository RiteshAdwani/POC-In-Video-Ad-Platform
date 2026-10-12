import { useContext } from 'react';
import { ThemeModeContext, type ThemeModeContextValue } from '../context/themeModeContext';

/**
 * @description Reads the current light/dark mode and its setter from the nearest ThemeModeProvider.
 */
export const useThemeMode = (): ThemeModeContextValue => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};
