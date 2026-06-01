import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: '/BusyBuddy_v2/',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
});
