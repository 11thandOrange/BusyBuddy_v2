import { test, dashboardTile, openEditorPopup } from '../../fixtures/app.js';

// TEMPORARY DIAGNOSTIC - lists the currently available (untagged,
// bundles:false AND tag_not:busybuddybundles) products, to pick replacement
// search terms for demo specs whose products have since been consumed by
// earlier bundle-creation runs (products get tagged busybuddybundles once
// used in any bundle-type discount, permanently excluding them from every
// app's picker after that). Safe to delete once resolved.
test('DIAGNOSTIC: currently available products', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /create/i }).click()
  );

  const responsePromise = popup.waitForResponse((res) => res.url().includes('/api/products') && !res.url().includes('search='), { timeout: 15_000 });
  await popup.reload();
  const response = await responsePromise;
  const body = await response.json();
  const titles = (body.data?.edges || []).map((e) => e.node.title);
  console.log('AVAILABLE_PRODUCTS', JSON.stringify(titles));
});
