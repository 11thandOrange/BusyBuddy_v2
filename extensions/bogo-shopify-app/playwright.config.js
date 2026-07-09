import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';

// Some sandboxed dev environments pre-cache a Chromium build at a fixed path
// outside Playwright's normal per-version cache. Only pin to it when it's
// actually present, so real CI (which runs `playwright install`) still uses
// its own resolved browser.
const SANDBOX_CHROMIUM_PATH = '/opt/pw-browsers/chromium';
const executablePath = fs.existsSync(SANDBOX_CHROMIUM_PATH) ? SANDBOX_CHROMIUM_PATH : undefined;

/**
 * E2E config for the storefront theme extension assets.
 *
 * Unlike web/frontend's smoke tests, there's no dev server here - each spec
 * spins up its own tiny static file server (tests/e2e/static-server.js) that
 * serves the *real* assets/*.js files via a normal <script src> tag, so the
 * scripts run exactly as they would on a real storefront.
 *
 * Run:  npm run test:e2e          (requires npm run test:e2e:install first)
 */
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/e2e/.playwright-output',
  reporter: [['list']],
  timeout: 30_000,

  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'off',
    launchOptions: executablePath ? { executablePath } : {},
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
