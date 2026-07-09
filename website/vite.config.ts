import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Hosting path/domain for this site hasn't been decided yet - adjust
// `base` once it's deployed somewhere (root domain vs. a GitHub Pages
// project subpath, same as docs/frontend's vite.config.ts).
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
