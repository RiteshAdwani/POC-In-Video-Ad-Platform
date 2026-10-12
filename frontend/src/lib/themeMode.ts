import {
  DARK_COLOR_SCHEME_QUERY,
  DARK_MODE_ENABLED,
  THEME_MODE_STORAGE_KEY,
  ThemeMode,
} from '../constants/theme.constants';

/**
 * @description The admin's saved theme, or their OS preference if they've never picked one -
 * always light while dark mode is switched off.
 */
export const getInitialThemeMode = (): ThemeMode => {
  if (!DARK_MODE_ENABLED) return ThemeMode.LIGHT;

  const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY);
  if (stored === ThemeMode.LIGHT || stored === ThemeMode.DARK) return stored;
  return window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches ? ThemeMode.DARK : ThemeMode.LIGHT;
};

/**
 * @description Saves the picked theme so it survives reloads.
 */
export const setStoredThemeMode = (mode: ThemeMode): void => {
  localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
};
