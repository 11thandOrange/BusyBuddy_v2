import { test, expect, gotoStorefrontHome } from '../../fixtures/app.js';

// Ticket: Inactive Tab Message App - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/311)
//
// Suite 2 - Storefront Behavior. This app's real effect is entirely on the
// storefront (extensions/bogo-shopify-app/assets/inactiveTab.js listens for
// visibilitychange and swaps document.title), which is testable directly by
// forcing that event rather than needing an actual OS-level tab switch.
test('Inactive Tab Message: swaps and restores the browser tab title on visibilitychange', async ({ page }) => {
  await gotoStorefrontHome(page);
  const originalTitle = await page.title();

  // document.hidden is a read-only getter on the real Document prototype -
  // overriding it here is what lets a single-page headless browser context
  // simulate "tab switched away" without a second real tab.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => page.title(), { timeout: 10_000 }).not.toBe(originalTitle);

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => page.title(), { timeout: 10_000 }).toBe(originalTitle);
});
