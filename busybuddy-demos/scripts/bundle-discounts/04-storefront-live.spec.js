import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// 1. Load the Nintendo Game Boy product page on the live storefront
// 2. Confirm the bundle widget renders on that page
test('Bundle Discounts: bundle widget renders on a bundled product\'s page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'nintendo-game-boy');
  // .bogo-bundle-container is the real markup from
  // extensions/bogo-shopify-app/blocks/bundles_and_discounts.liquid (the
  // block shared by all 4 bundle-type apps) - the previous selector never
  // matched anything real on this page.
  await expect(page.locator('.bogo-bundle-container').first()).toBeVisible({ timeout: 15_000 });
});
