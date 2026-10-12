import { createContext } from 'react';
import type { ThemeMode } from '../../../constants/theme.constants';

export type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);
