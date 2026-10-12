import { Segmented } from 'antd';
import { DARK_MODE_ENABLED, type ThemeMode } from '../../constants/theme.constants';
import { useThemeMode } from '../../features/theme/hooks/useThemeMode';
import { THEME_TOGGLE_OPTIONS } from './ThemeToggle.constants';
import './ThemeToggle.css';

/**
 * @description Light/dark switch - a sun and a moon side by side, with the active mode filled.
 * Used in the admin sidebar and the public pages' top bars; hidden while dark mode is switched off.
 */
export const ThemeToggle = () => {
  const { mode, setMode } = useThemeMode();

  if (!DARK_MODE_ENABLED) return null;

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
