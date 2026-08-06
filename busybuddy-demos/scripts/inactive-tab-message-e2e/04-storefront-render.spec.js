import { test, expect, gotoStorefrontHome } from '../../fixtures/app.js';

// Runs after 01-configure-settings.spec.js (relies on the enable state it
// leaves rather than creating its own - see workers:1/file-order convention
// this suite already depends on).
// 1. Load the live storefront homepage
// 2. Confirm the Inactive Tab Message embed script is actually loaded there -
//    extensions/bogo-shopify-app/blocks/inactive_tab.liquid has no visible
//    markup of its own, just a deferred <script src="inactiveTab.js">, so
//    the script tag's presence is the real, verifiable render signal here.
test('Inactive Tab Message: embed script loads on the storefront homepage', async ({ page }) => {
  await gotoStorefrontHome(page);
  await expect(page.locator('script[src*="inactiveTab.js"]')).toHaveCount(1, { timeout: 15_000 });
});
