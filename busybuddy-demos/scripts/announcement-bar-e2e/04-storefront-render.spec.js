import { test, expect, gotoStorefrontHome } from '../../fixtures/app.js';

// Runs after 01-create-and-customize.spec.js (relies on the bar it creates
// rather than creating its own - see workers:1/file-order convention this
// suite already depends on).
// 1. Load the live storefront homepage
// 2. Confirm the announcement bar actually renders on the page
test('Announcement Bar: renders live on the storefront homepage', async ({ page }) => {
  await gotoStorefrontHome(page);
  await expect(page.locator('#busybuddy-announcement-bar')).toBeVisible({ timeout: 15_000 });
});
