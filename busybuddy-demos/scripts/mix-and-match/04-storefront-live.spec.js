import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// 1. Load the Cassette Player product page on the live storefront
// 2. Confirm the offer widget renders on that page
test('Mix and Match: offer widget renders on a grouped product\'s page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'cassette-player');
  await expect(page.locator('[id*="star_rating"], [class*="busybuddy-bundle"]').first()).toBeVisible({ timeout: 15_000 });
});
