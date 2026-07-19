import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from the custom domain (busybuddy.dev) at the site root via
// GitHub Pages (see public/CNAME). Root base works because the domain has
// no path prefix to account for - see git history for the prior
// /BusyBuddy_v2/ project-path base, from before the custom domain was set up.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
