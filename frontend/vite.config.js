import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '^/.*api.*': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (!req.url.includes('/api')) {
            return req.url; // Don't proxy this request
          }
          return null; // Proceed with proxying
        },
        rewrite: (path) => path.replace(/.*\/api/, ''), // Strip everything up to and including /api
      },
    },
  },
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
