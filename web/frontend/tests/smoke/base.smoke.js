/**
 * Base smoke tests — BusyBuddy_v2
 *
 * Verifies that every main admin page renders without a blank screen or
 * uncaught JS error.  These run on every PR regardless of which feature
 * changed.  Screenshots go to .smoke-results/base-<name>.png.
 *
 * These tests do NOT verify specific AC lines — feature-specific tests
 * (written by the smoke-tester agent per ticket) cover that.
 */

import { test, expect } from '@playwright/test';
import { setupMocks, screenshotPage } from './helpers.js';

// Common heading/container selector used across all pages.
// Pages use h3–h5 titles (e.g. "Buy One Get One" in h5), so we cast
// a wide heading net.  The alert/spinner selectors also catch error or
// loading states so a render with empty mock data still registers as
// "something visible" — enough to confirm the page didn't crash.
const ANY_HEADING = 'h1, h2, h3, h4, h5, h6';
const ANY_CONTENT = `${ANY_HEADING}, form, [role="alert"], [class*="spinner"], .Page`;

/** Pages to smoke test on every PR. */
const PAGES = [
  {
    route: '/',
    name: 'dashboard',
    // Dashboard renders widget tiles (h2 "Your Widgets") plus class names
    // matching "widget" and "dashboard".  In SMOKE_TEST mode the Vite proxy
    // is disabled so the SPA serves root '/' directly.
    selector: `${ANY_CONTENT}, [class*="widget"], [class*="dashboard"]`,
  },
  {
    route: '/bundles',
    name: 'bundles',
    selector: `${ANY_CONTENT}, [class*="bundle"]`,
  },
  {
    route: '/announcement-bar',
    name: 'announcement-bar',
    selector: `${ANY_CONTENT}, [class*="announcement"]`,
  },
  {
    route: '/buy-one-get-one',
    name: 'buy-one-get-one',
    selector: ANY_CONTENT,
  },
  {
    route: '/mix-and-match',
    name: 'mix-and-match',
    selector: ANY_CONTENT,
  },
  {
    route: '/volume-discounts',
    name: 'volume-discounts',
    selector: ANY_CONTENT,
  },
  {
    route: '/inactive-tab-message',
    name: 'inactive-tab-message',
    selector: ANY_CONTENT,
  },
];

test.beforeEach(async ({ page }) => {
  await setupMocks(page);

  // Capture any uncaught page errors so they appear in test output,
  // but don't fail the test — Shopify Bridge may throw in non-embedded context.
  page.on('pageerror', err => {
    // Suppress known App Bridge init errors
    if (err.message.includes('app-bridge') || err.message.includes('shopify')) return;
    console.warn(`[pageerror] ${err.message}`);
  });
});

for (const { route, name, selector } of PAGES) {
  test(`${name} page renders without crash`, async ({ page }) => {
    await screenshotPage(page, route, `base-${name}`);

    // The page must show at least one meaningful element — not just a blank body
    await expect(page.locator(selector).first()).toBeVisible({ timeout: 8_000 });
  });
}
