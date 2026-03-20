import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'pages/DashboardHome.jsx',
        'apps/**/BundleForm.jsx',
        'apps/**/buyoneGetone.jsx',
        'apps/**/VolumeForm.jsx',
        'apps/**/MixMatchForm.jsx',
        'components/Analytics/*.jsx',
        'editor.jsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
});
