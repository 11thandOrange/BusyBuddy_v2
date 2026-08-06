import { test, expect, gotoStorefrontProduct } from '../../fixtures/app.js';

// 1. Load the Sega Game Gear product page on the live storefront - "Cassette
//    Player" was never a real seeded product (see products.json); Sega Game
//    Gear is the first of the 3 products 02-create-offer.spec.js actually
//    adds to this offer.
// 2. Confirm the offer widget renders on that page
test('Mix and Match: offer widget renders on a grouped product\'s page', async ({ page }) => {
  await gotoStorefrontProduct(page, 'sega-game-gear');
  // .bogo-bundle-container is the real markup from
  // extensions/bogo-shopify-app/blocks/bundles_and_discounts.liquid (the
  // block shared by all 4 bundle-type apps) - the previous selector never
  // matched anything real on this page.
  await expect(page.locator('.bogo-bundle-container').first()).toBeVisible({ timeout: 15_000 });
});
