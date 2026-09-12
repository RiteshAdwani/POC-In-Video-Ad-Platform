import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    // Generated Prisma client and compiled output aren't ours to lint.
    ignores: ['dist', 'src/generated', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Must be last - disables any ESLint stylistic rule that conflicts with Prettier.
  prettier,
);
