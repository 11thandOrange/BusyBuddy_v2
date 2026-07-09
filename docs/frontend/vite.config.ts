import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from the default GitHub Pages project path
// (11thandorange.github.io/BusyBuddy_v2/), so assets must resolve
// relative to that subpath rather than the domain root.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
