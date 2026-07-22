import { test, expect, gotoStorefrontHome } from '../../fixtures/app.js';

test('Announcement Bar: renders live on the Daisy\'s Electronics storefront', async ({ page }) => {
  await gotoStorefrontHome(page);
  await expect(page.locator('#busybuddy-announcement-bar')).toBeVisible({ timeout: 15_000 });
});
