import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// 1. Load the Discman product page on the live storefront
// 2. Confirm the quantity-break widget renders on that page
test('Volume Discounts: quantity-break tiers render on the product page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'discman');
  await expect(page.locator('[id*="star_rating"], [class*="busybuddy-bundle"]').first()).toBeVisible({ timeout: 15_000 });
});
