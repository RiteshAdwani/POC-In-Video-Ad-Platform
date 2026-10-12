import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import type { ThemeMode } from '../../../constants/theme.constants';
import { getInitialThemeMode, setStoredThemeMode } from '../../../lib/themeMode';
import { getAntdTheme } from '../../../theme/antdTheme';
import { ThemeModeContext } from './themeModeContext';

/**
 * @description Owns the light/dark choice and applies it in both places it lives: antd's theme
 * (ConfigProvider) and the `data-theme` attribute our own CSS variables switch on.
 */
export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState(getInitialThemeMode);

  // Saved only when the admin picks a mode, so an unpicked mode keeps following the OS.
  const changeMode = useCallback((next: ThemeMode) => {
    setStoredThemeMode(next);
    setMode(next);
  }, []);

  /**
   * @description Mirrors the mode onto <html> before paint, so the CSS variables never flash the
   * other theme for a frame.
   */
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode: changeMode }), [mode, changeMode]);
  const antdTheme = useMemo(() => getAntdTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeModeContext.Provider>
  );
};
