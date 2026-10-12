import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { ThemeMode } from '../../constants/theme.constants';

// Both sides of the theme switch stay visible, so it reads as a light/dark control at a glance.
export const THEME_TOGGLE_OPTIONS = [
  { value: ThemeMode.LIGHT, icon: <SunOutlined />, tooltip: 'Light mode' },
  { value: ThemeMode.DARK, icon: <MoonOutlined />, tooltip: 'Dark mode' },
];
