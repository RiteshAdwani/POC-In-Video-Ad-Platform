import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig(
  {
    ignores: ['dist', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Without this, the VS Code ESLint extension can't tell frontend's tsconfig.json apart
    // from backend's in this monorepo and refuses to parse anything.
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Warns if a file exports anything besides a component - breaks Vite's fast refresh.
      'react-refresh/only-export-components': 'warn',
    },
  },
  // Must be last - disables any ESLint stylistic rule that conflicts with Prettier.
  prettier,
);
