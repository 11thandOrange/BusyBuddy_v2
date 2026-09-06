import { defineConfig } from 'vitest/config';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// `npm test` runs from web/, so every relative path below - the test `include`
// glob and the coverage `include` list alike - was resolved against web/ and
// matched nothing, because the suites live in web/backend/tests/. Vitest then
// exited 1 with "No test files found", which reads like a broken checkout
// rather than a broken path. Pin the root to this file's own directory so
// those paths mean what they look like they mean, from any cwd.
export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'controller/activity/*.js',
        'controller/webhooks/*.js',
        'services/activityLogService.js',
      ],
    },
  },
});
