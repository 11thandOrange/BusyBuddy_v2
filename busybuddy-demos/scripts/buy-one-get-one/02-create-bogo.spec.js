import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem, addProductToPool, selectConfigOption } from '../../fixtures/app.js';

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
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
});
