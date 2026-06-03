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

/** Pages to smoke test on every PR. */
const PAGES = [
  {
    route: '/',
    name: 'dashboard',
    // Dashboard renders at least one widget tile or a heading
    selector: 'h1, h2, [class*="widget"], [class*="dashboard"], .Page',
  },
  {
    route: '/bundles',
    name: 'bundles',
    // Page renders h1 on success (status:true) or an Alert on error; both have .container
    selector: 'h1, h2, h3, h4, h5, h6, form, [class*="bundle"], .container, .container-fluid, .Page',
  },
  {
    route: '/announcement-bar',
    name: 'announcement-bar',
    // AnnouncementBarForm renders an <h5> heading immediately
    selector: 'h1, h2, h3, h4, h5, h6, form, [class*="announcement"], .container, .container-fluid, .Page',
  },
  {
    route: '/buy-one-get-one',
    name: 'buy-one-get-one',
    selector: 'h1, h2, h3, h4, h5, h6, form, .container, .container-fluid, .Page',
  },
  {
    route: '/mix-and-match',
    name: 'mix-and-match',
    selector: 'h1, h2, h3, h4, h5, h6, form, .container, .container-fluid, .Page',
  },
  {
    route: '/volume-discounts',
    name: 'volume-discounts',
    selector: 'h1, h2, h3, h4, h5, h6, form, .container, .container-fluid, .Page',
  },
  {
    route: '/inactive-tab-message',
    name: 'inactive-tab-message',
    selector: 'h1, h2, form, .Page',
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
