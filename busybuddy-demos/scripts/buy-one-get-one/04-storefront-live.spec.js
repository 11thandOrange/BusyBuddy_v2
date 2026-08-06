import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// 1. Load the Sony Walkman product page on the live storefront
// 2. Confirm the offer widget renders on that page
test('BOGO: offer widget renders on the trigger product\'s page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'sony-walkman');
  // .bogo-bundle-container is the real markup from
  // extensions/bogo-shopify-app/blocks/bundles_and_discounts.liquid (the
  // block shared by all 4 bundle-type apps) - the previous selector never
  // matched anything real on this page.
  await expect(page.locator('.bogo-bundle-container').first()).toBeVisible({ timeout: 15_000 });
});
