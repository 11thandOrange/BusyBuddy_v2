import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// Runs after 01-create-and-customize.spec.js (relies on the bundle it
// creates rather than creating its own - see workers:1/file-order
// convention this suite already depends on).
// 1. Load the Polaroid Instant Camera product page on the live storefront
// 2. Confirm the bundle widget renders there
test('Bundle Discount: bundle widget renders on the storefront product page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'polaroid-instant-camera');
  // .bogo-bundle-container is the real markup from
  // extensions/bogo-shopify-app/blocks/bundles_and_discounts.liquid (the
  // block shared by all 4 bundle-type apps).
  await expect(page.locator('.bogo-bundle-container').first()).toBeVisible({ timeout: 15_000 });
});
