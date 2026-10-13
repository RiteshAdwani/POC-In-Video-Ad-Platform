import { Segmented } from 'antd';
import type { ThemeMode } from '../../constants/theme.constants';
import { useThemeMode } from '../../features/theme/hooks/useThemeMode';
import { THEME_TOGGLE_OPTIONS } from './ThemeToggle.constants';
import './ThemeToggle.css';

/**
 * @description Light/dark switch - a sun and a moon side by side, with the active mode filled.
 * Used in the admin sidebar, the public pages' top bars and the login page.
 */
export const ThemeToggle = () => {
  const { mode, setMode } = useThemeMode();

  return (
    <Segmented<ThemeMode>
      value={mode}
      options={THEME_TOGGLE_OPTIONS}
      onChange={setMode}
      aria-label="Colour theme"
      className="theme-toggle"
    />
  );
};
