import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

test('BOGO: offer widget renders on the trigger product\'s page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'sony-walkman');
  await expect(page.locator('[id*="star_rating"], [class*="busybuddy-bundle"]').first()).toBeVisible({ timeout: 15_000 });
});
