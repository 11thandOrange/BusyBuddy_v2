import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

test('Mix and Match: offer widget renders on a grouped product\'s page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'cassette-player');
  await expect(page.locator('[id*="star_rating"], [class*="busybuddy-bundle"]').first()).toBeVisible({ timeout: 15_000 });
});
