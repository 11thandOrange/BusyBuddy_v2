import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// 1. Load the Sony Walkman product page on the live storefront
// 2. Confirm the offer widget renders on that page
test('BOGO: offer widget renders on the trigger product\'s page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'sony-walkman');
  await expect(page.locator('[id*="star_rating"], [class*="busybuddy-bundle"]').first()).toBeVisible({ timeout: 15_000 });
});
