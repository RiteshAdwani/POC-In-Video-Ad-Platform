import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/support/globalSetup.ts'],
    setupFiles: ['tests/support/setupEnv.ts'],
    // Every integration file truncates the same test database - running them side by side would
    // wipe each other's rows mid-test.
    fileParallelism: false,
  },
});
