import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// Runs after 01-create-and-customize.spec.js (relies on the offer it
// creates rather than creating its own - see workers:1/file-order
// convention this suite already depends on).
// 1. Load the Original iPod product page on the live storefront - the "buy"
//    (X) side product that offer's created against
// 2. Confirm the offer widget renders there
test('BOGO: offer widget renders on the storefront trigger product page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'original-ipod');
  // .bogo-bundle-container is the real markup from
  // extensions/bogo-shopify-app/blocks/bundles_and_discounts.liquid (the
  // block shared by all 4 bundle-type apps).
  await expect(page.locator('.bogo-bundle-container').first()).toBeVisible({ timeout: 15_000 });
});
