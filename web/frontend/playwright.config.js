import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright smoke test configuration — BusyBuddy_v2
 *
 * Starts the Vite dev server on port 4000, intercepts all Shopify App Bridge
 * module loads and /api/* calls so the app renders without a live Shopify store.
 * Screenshots are saved to ../../.smoke-results/ (repo root).
 *
 * Run:  npm run smoke          (requires npm run smoke:install first)
 * Install: npm run smoke:install
 */
export default defineConfig({
  testDir: './tests/smoke',
  testMatch: ['**/*.smoke.js', '**/*.spec.js', '**/*.test.js'],
  outputDir: './tests/smoke/.playwright-output',
  reporter: [['list'], ['html', { open: 'never', outputFolder: './tests/smoke/.playwright-report' }]],
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:4000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'off',
    viewport: { width: 1280, height: 800 },
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: false,
    timeout: 45_000,
    env: {
      CI: 'true',
      SHOPIFY_API_KEY: 'smoke-test-key',
      FRONTEND_PORT: '4000',
      BACKEND_PORT: '3001',  // not used — all /api/* calls are intercepted
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
