import { test, dashboardTile, openEditorPopup, saveEditor, waitForSaveAndClose, clickSidepaneItem, addProductToPool, selectConfigOption, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Click "Create" on the Buy One Get One tile - opens the standalone editor
// 2. Open "Customer Buys (X)", add "Sony Walkman" to the buy-side pool
// 3. Open "Customer Gets (Y)", add "Polaroid" to the get-side pool
// 4. Go to Discount Settings, select "Percentage Discount", enter 50
// 5. Click Save and wait for the save confirmation
// 6. Go back to the app, open the Discounts list tab, confirm the new offer is in the list
test('BOGO: create a Buy X Get Y offer', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /create/i }).click()
  );

  // BOGO's sidepane doesn't have a "Select Products" item - it splits
  // into "Customer Buys (X)" and "Customer Gets (Y)" (BuyXGetYEditor.jsx).
  await clickSidepaneItem(popup, 'Customer Buys (X)');
  await addProductToPool(popup, 'Sony Walkman');

  await clickSidepaneItem(popup, 'Customer Gets (Y)');
  await addProductToPool(popup, 'Polaroid');

  await clickSidepaneItem(popup, 'Discount Settings');
  // BOGO's own DISCOUNT_TYPE_OPTIONS label differs from the other 3 apps'
  // plain "Percentage" - it's "Percentage Discount" here.
  await selectConfigOption(popup, 'Discount Type', 'Percentage Discount');
  await popup.getByPlaceholder(/e\.g\., 20/).fill('50');

  await saveEditor(popup);
  await waitForSaveAndClose(popup);

  await dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /manage/i }).click();
  await refreshAndVerifyInList(app, 'Discounts', /Sony Walkman/i);
});
