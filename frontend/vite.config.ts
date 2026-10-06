import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Same-origin from the browser's point of view - no CORS to deal with in dev. Every
      // backend route (public ones included) lives under /api.
      '/api': 'http://localhost:8000',
    },
  },
});
