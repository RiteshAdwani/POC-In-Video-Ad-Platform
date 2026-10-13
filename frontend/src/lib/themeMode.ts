import {
  DARK_COLOR_SCHEME_QUERY,
  THEME_MODE_STORAGE_KEY,
  ThemeMode,
} from '../constants/theme.constants';

/**
 * @description The viewer's saved theme, or their OS preference if they've never picked one.
 */
export const getInitialThemeMode = (): ThemeMode => {
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
