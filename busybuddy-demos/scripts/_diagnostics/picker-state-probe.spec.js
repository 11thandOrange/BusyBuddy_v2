import { test, expect, dashboardTile, openEditorPopup, clickSidepaneItem } from '../../fixtures/app.js';

// TEMPORARY DIAGNOSTIC - the search endpoint itself was confirmed returning
// 200 with matching products (product-search-probe.spec.js), yet the real
// bundle-discounts/02-create-bundle.spec.js still times out waiting for a
// "+ Add" button after the same search. This captures every /api/products
// request/response IN ORDER (to check for a race between the unrelated
// mount-time fetch and the debounced search fetch) plus the picker panel's
// actual rendered text and "+ Add" button count a few seconds after
// searching, instead of waiting up to 120s for a button that may never
// appear. Safe to delete once resolved.
test('DIAGNOSTIC: product picker state after searching "Game Boy"', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /create/i }).click()
  );

  const responses = [];
  popup.on('response', (res) => {
    if (res.url().includes('/api/products')) {
      res
        .json()
        .then((json) => {
          const titles = (json.data?.edges || []).map((e) => e.node.title);
          responses.push(`${res.url()} -> ${res.status()} -> ${JSON.stringify(titles)}`);
        })
        .catch(() => {
          responses.push(`${res.url()} -> ${res.status()} -> <parse error>`);
        });
    }
  });

  await clickSidepaneItem(popup, 'Select Products');
  const addProductsButton = popup.getByRole('button', { name: '+ Add Products' });
  if (await addProductsButton.isVisible().catch(() => false)) {
    await addProductsButton.click();
  }
  await popup.getByPlaceholder('Search by product name...').fill('Game Boy');

  // Give the debounced search + any subsequent re-render time to settle,
  // then snapshot state instead of waiting up to 120s for a button.
  await popup.waitForTimeout(3000);

  const addButtonCount = await popup.getByRole('button', { name: '+ Add', exact: true }).count();
  const panelText = await popup
    .getByText('Select from Inventory')
    .locator('..')
    .locator('..')
    .innerText()
    .catch((err) => `PANEL_NOT_FOUND: ${err.message}`);

  console.log('PRODUCT_API_RESPONSES', JSON.stringify(responses));
  console.log('ADD_BUTTON_COUNT', addButtonCount);
  console.log('PANEL_TEXT', panelText.slice(0, 1500));
});
