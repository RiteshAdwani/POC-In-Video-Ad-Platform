import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default defineConfig(
  {
    // Generated Prisma client and compiled output aren't ours to lint.
    ignores: ['dist', 'src/generated', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Without this, the VS Code ESLint extension can't tell backend's tsconfig.json apart
    // from frontend's in this monorepo and refuses to parse anything.
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Express identifies error-handling middleware purely by arity (4 params) - so a
      // required-but-unused param (e.g. `_next`) can't just be dropped from the signature.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Blocks `function foo() {}` declarations in favor of `const foo = () => {}`.
      'func-style': ['error', 'expression'],
    },
  },
  // Must be last - disables any ESLint stylistic rule that conflicts with Prettier.
  prettier,
);
