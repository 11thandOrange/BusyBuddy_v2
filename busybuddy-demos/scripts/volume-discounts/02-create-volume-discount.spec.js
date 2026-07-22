import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem, addProductViaPicker, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Click "Create" on the Volume Discounts tile - opens the standalone editor
// 2. Open "Select Products", add "Discman" via the product picker
// 3. Open Quantity Breaks, confirm the default "Buy 2, get 10% OFF" tier is visible
// 4. Click Save and wait for the save confirmation
// 5. Go back to the app, open the Discounts list tab, confirm the new discount is in the list
test('Volume Discounts: create a discount with quantity-break tiers', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPicker(popup, 'Discman');

  await clickSidepaneItem(popup, 'Quantity Breaks');
  await expect(popup.getByText(/buy 2, get 10% off/i)).toBeVisible();

  await saveEditor(popup);
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
  await popup.close();

  await dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /manage/i }).click();
  await refreshAndVerifyInList(app, 'Discounts', /Discman/i);
});
