import { theme, type ThemeConfig } from 'antd';
import { BrandColor, FONT_FAMILY_SANS, ThemeMode } from '../constants/theme.constants';

const sharedTokens: ThemeConfig['token'] = {
  colorPrimary: BrandColor.VIOLET,
  colorLink: BrandColor.VIOLET,
  colorInfo: BrandColor.VIOLET,
  colorSuccess: '#1F9D55',
  colorError: '#D64545',
  fontFamily: FONT_FAMILY_SANS,
  borderRadius: 8,
  borderRadiusLG: 12,
  // Page titles stay a step below the sidebar's 26px product name.
  fontSizeHeading2: 24,
};

const lightTokens: ThemeConfig['token'] = {
  colorBgLayout: '#FBFBFD',
  colorBgContainer: '#FFFFFF',
  colorBorder: '#E3E5EA',
  colorBorderSecondary: '#EEF0F3',
  colorText: '#191A2E',
};

const darkTokens: ThemeConfig['token'] = {
  colorBgLayout: '#0E1016',
  colorBgContainer: '#161922',
  colorBgElevated: '#1D212B',
  colorBorder: '#272B37',
  colorBorderSecondary: '#1F2330',
  colorText: '#E8EAF0',
};

/**
 * @description antd theme for the given mode - the same brand tokens in both, with antd's dark
 * algorithm and dark neutrals swapped in for dark mode. Mirrors the CSS variables in index.css.
 */
export const getAntdTheme = (mode: ThemeMode): ThemeConfig => ({
  algorithm: mode === ThemeMode.DARK ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: { ...sharedTokens, ...(mode === ThemeMode.DARK ? darkTokens : lightTokens) },
});
