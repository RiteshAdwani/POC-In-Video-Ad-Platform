export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];

export const THEME_MODE_STORAGE_KEY = 'themeMode';

// Off until every page has been restyled for dark mode - until then the app always renders light
// and the theme toggle is hidden.
export const DARK_MODE_ENABLED = false;

// Used only until the admin picks a theme themselves - after that, their choice is stored.
export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

// The brand palette, mixed from the Periwinkle, Pink LA and Scales palettes.
export const BrandColor = {
  VIOLET: '#7827E6',
  INDIGO: '#635AD9',
  ORCHID: '#D85CF2',
  PERIWINKLE: '#8EA6EC',
  MINT: '#4FD1B8',
  BLUE: '#219BE4',
} as const;

// Lighter shades of the brand colours that are too dark to read on the dark theme's background.
export const BrandColorOnDark = {
  INDIGO: '#7A73DF',
  VIOLET: '#9A5DEC',
} as const;

export const FONT_FAMILY_SANS = "'Geist', sans-serif";
