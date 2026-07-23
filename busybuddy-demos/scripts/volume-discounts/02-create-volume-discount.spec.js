import { test, expect, dashboardTile, openEditorPopup, saveEditor, waitForSaveAndClose, clickSidepaneItem, addProductViaPickerRow, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Click "Create" on the Volume Discounts tile - opens the standalone editor
// 2. Open "Select Products", add "Palm Pilot" via the product picker
// 3. Open Quantity Breaks, confirm the default "Buy 2, get 10% OFF" tier is visible
// 4. Click Save and wait for the save confirmation
// 5. Go back to the app, open the Discounts list tab, confirm the new discount is in the list
test('Volume Discounts: create a discount with quantity-break tiers', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /create/i }).click()
  );

  // "Sony Discman" is a real seeded product, but products get tagged
  // busybuddybundles once used in any bundle-type discount (across every
  // app), permanently excluding them from the picker afterward - it's
  // apparently already been consumed by an earlier bundle. Use a name
  // confirmed currently available instead.
  // VolumeDiscountEditor.jsx's product rows are directly clickable <div>s,
  // not <button>+ Add</button> elements like the other 3 apps - see
  // addProductViaPickerRow in fixtures/app.js.
  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPickerRow(popup, 'Palm Pilot');

  await clickSidepaneItem(popup, 'Quantity Breaks');
  await expect(popup.getByText(/buy 2, get 10% off/i)).toBeVisible();

  await saveEditor(popup);
  await waitForSaveAndClose(popup);

  await dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /manage/i }).click();
  await refreshAndVerifyInList(app, 'Discounts', /Palm Pilot/i);
});
