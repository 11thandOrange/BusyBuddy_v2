import { test, expect, dashboardTile, openEditorPopup, clickSidepaneItem } from '../../fixtures/app.js';

// TEMPORARY DIAGNOSTIC - captures the raw /api/products?search=... response
// for a multi-word title ("Game Boy") to determine whether the backend's
// title:*term* Shopify search filter actually matches multi-word titles, or
// whether the space breaks the query into separate tokens. Safe to delete
// once the product-search bug is resolved.
test('DIAGNOSTIC: product search response for "Game Boy"', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Select Products');
  const addProductsButton = popup.getByRole('button', { name: '+ Add Products' });
  if (await addProductsButton.isVisible().catch(() => false)) {
    await addProductsButton.click();
  }

  const responsePromise = popup.waitForResponse(
    (res) => res.url().includes('/api/products') && res.url().includes('search='),
    { timeout: 15_000 }
  );
  await popup.getByPlaceholder('Search by product name...').fill('Game Boy');
  const response = await responsePromise;
  const body = await response.text();
  console.log('SEARCH_URL', response.url());
  console.log('SEARCH_STATUS', response.status());
  console.log('SEARCH_BODY', body.slice(0, 3000));
});
