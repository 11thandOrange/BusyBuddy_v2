import { test, dashboardTile, openEditorPopup, clickSidepaneItem } from '../../fixtures/app.js';

// TEMPORARY DIAGNOSTIC - volume-discounts/02-create-volume-discount.spec.js
// times out searching for "Palm Pilot" even though nothing in today's runs
// should have consumed it. Captures the raw /api/products?search=Palm+Pilot
// response to settle whether it's a tag exclusion, a multi-word search
// issue, or something else. Safe to delete once resolved.
test('DIAGNOSTIC: search for "Palm Pilot"', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /create/i }).click()
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
  await popup.getByPlaceholder('Search by product name...').fill('Palm Pilot');
  const response = await responsePromise;
  const body = await response.text();
  console.log('SEARCH_URL', response.url());
  console.log('SEARCH_STATUS', response.status());
  console.log('SEARCH_BODY', body.slice(0, 2000));
});
