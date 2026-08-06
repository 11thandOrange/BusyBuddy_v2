import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// Runs after 01-create-and-customize.spec.js (relies on the discount it
// creates rather than creating its own - see workers:1/file-order
// convention this suite already depends on).
// 1. Load the CRT Television product page on the live storefront
// 2. Confirm the quantity-break widget renders there
test('Volume Discounts: quantity-break widget renders on the storefront product page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'crt-television');
  // .bogo-bundle-container is the real markup from
  // extensions/bogo-shopify-app/blocks/bundles_and_discounts.liquid (the
  // block shared by all 4 bundle-type apps).
  await expect(page.locator('.bogo-bundle-container').first()).toBeVisible({ timeout: 15_000 });
});
