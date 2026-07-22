import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Some sandboxed dev environments pre-cache a Chromium build at a fixed path
// outside Playwright's normal per-version cache. Only pin to it when it's
// actually present, so real CI (which runs `playwright install`) still uses
// its own resolved browser.
const SANDBOX_CHROMIUM_PATH = '/opt/pw-browsers/chromium';
const executablePath = fs.existsSync(SANDBOX_CHROMIUM_PATH) ? SANDBOX_CHROMIUM_PATH : undefined;

const AUTH_STATE_PATH = path.resolve('./auth.json');
const hasAuthState = fs.existsSync(AUTH_STATE_PATH);

/**
 * Demo recording config for all 6 BusyBuddy apps' admin + storefront
 * journeys. Every project apps its own storageState (see fixtures/) - admin
 * scripts reuse the merchant session saved to auth.json (see README), while
 * storefront scripts run unauthenticated against the live theme.
 *
 * Run:  npx playwright test          (requires auth.json - see README)
 */
export default defineConfig({
  testDir: './scripts',
  // Playwright nests each test's video/trace/screenshot under its own
  // outputDir subfolder - the record-demos workflow's organize-artifacts
  // step renames/moves those into videos/, traces/, screenshots/ with
  // descriptive filenames after the run finishes.
  outputDir: './.raw-output',
  reporter: [['list'], ['./fixtures/organize-reporter.js']],
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,

  use: {
    headless: true,
    baseURL: process.env.BUSYBUDDY_ADMIN_URL,
    storageState: hasAuthState ? AUTH_STATE_PATH : undefined,
    video: 'on',
    trace: 'on',
    screenshot: 'on',
    launchOptions: executablePath ? { executablePath } : {},
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
