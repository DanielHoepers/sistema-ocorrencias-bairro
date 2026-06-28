import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2018',
    cssTarget: 'chrome61'
  },
  server: {
    port: 5173
  }
});
