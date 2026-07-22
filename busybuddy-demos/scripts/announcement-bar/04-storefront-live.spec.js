import { test, expect, gotoStorefrontHome } from '../../fixtures/app.js';

// 1. Load the live Daisy's Electronics storefront homepage
// 2. Confirm the announcement bar actually renders on the page
test('Announcement Bar: renders live on the Daisy\'s Electronics storefront', async ({ page }) => {
  await gotoStorefrontHome(page);
  await expect(page.locator('#busybuddy-announcement-bar')).toBeVisible({ timeout: 15_000 });
});
