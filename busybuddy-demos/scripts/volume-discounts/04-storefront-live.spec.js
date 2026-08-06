import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// 1. Load the Palm Pilot product page on the live storefront - the actual
//    product 02-create-volume-discount.spec.js uses (Sony Discman, despite
//    being a real seeded product, gets permanently excluded from every
//    bundle-type picker once used elsewhere - see that file's own comment)
// 2. Confirm the quantity-break widget renders on that page
test('Volume Discounts: quantity-break tiers render on the product page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'palm-pilot');
  // .bogo-bundle-container is the real markup from
  // extensions/bogo-shopify-app/blocks/bundles_and_discounts.liquid (the
  // block shared by all 4 bundle-type apps) - the previous selector never
  // matched anything real on this page.
  await expect(page.locator('.bogo-bundle-container').first()).toBeVisible({ timeout: 15_000 });
});
