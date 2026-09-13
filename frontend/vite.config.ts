import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Same-origin from the browser's point of view - no CORS to deal with in dev, matching
      // how nginx proxies these same two prefixes in the production container.
      '/api': 'http://localhost:8000',
      '/public': 'http://localhost:8000',
    },
  },
});
