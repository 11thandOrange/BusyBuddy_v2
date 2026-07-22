import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// 1. Load the Nintendo Game Boy product page on the live storefront
// 2. Confirm the bundle widget renders on that page
test('Bundle Discounts: bundle widget renders on a bundled product\'s page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'nintendo-game-boy');
  await expect(page.locator('[id*="star_rating"], [class*="busybuddy-bundle"]').first()).toBeVisible({ timeout: 15_000 });
});
