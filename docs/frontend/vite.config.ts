import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from the default GitHub Pages project path
// (11thandorange.github.io/BusyBuddy_v2/). An absolute base (rather than
// relative) is required so that BrowserRouter deep links (e.g. /api,
// /getting-started) still resolve asset URLs correctly, since those pages
// are not one level deep from index.html the way a relative base assumes.
export default defineConfig({
  plugins: [react()],
  base: '/BusyBuddy_v2/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
