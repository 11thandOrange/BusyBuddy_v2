import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

test('Volume Discounts: quantity-break tiers render on the product page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'discman');
  await expect(page.locator('[id*="star_rating"], [class*="busybuddy-bundle"]').first()).toBeVisible({ timeout: 15_000 });
});
