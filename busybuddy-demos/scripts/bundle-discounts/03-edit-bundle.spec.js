import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor, clickSidepaneItem, fillActiveConfigField, fillConfigInput, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Open the Bundle Discounts app, go to the Discounts list tab
// 2. Open the first existing bundle in the list
// 3. Change its discount to 25%, then set a new message ("Now 25% off - Bundle and Save!")
// 4. Click Save and wait for the save confirmation
// 5. Go back to the Discounts list tab, confirm the bundle is still there
test('Bundle Discounts: edit an existing bundle\'s discount and message', async ({ page, app }) => {
  await dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Discounts');

  const firstBundle = app.locator('.bundlebox').first();
  await expect(firstBundle).toBeVisible();

  const popup = await openEditorPopup(page, () =>
    firstBundle.locator('..').locator('..').getByRole('button').filter({ hasText: '' }).first().click()
  );

  await clickSidepaneItem(popup, 'Discount Settings');
  await fillConfigInput(popup, 'Discount Value', '25');

  await popup.getByText('Content', { exact: true }).click();
  await clickSidepaneItem(popup, 'Message Text');
  await fillActiveConfigField(popup, 'Now 25% off - Bundle and Save!');

  await saveEditor(popup);
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
  await popup.close();

  // The Discounts list row shows each bundle's product-title badges, not
  // its message text (see BundelDiscountList.jsx), so verify presence via
  // the product this bundle was created with rather than the message just
  // set above.
  await refreshAndVerifyInList(app, 'Discounts', /Game Boy/i);
});
