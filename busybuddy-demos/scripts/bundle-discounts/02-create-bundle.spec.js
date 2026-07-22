import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem, addProductViaPicker, selectConfigOption, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Click "Create" on the Bundle Discounts tile - opens the standalone editor
// 2. Open "Select Products", add "Game Boy" and "Game Boy Color" via the product picker
// 3. Go to Discount Settings, select "Percentage", enter 15
// 4. Click Save and wait for the save confirmation
// 5. Go back to the app, open the Discounts list tab, confirm the new bundle is in the list
test('Bundle Discounts: create a bundle from 2 seeded products', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPicker(popup, 'Game Boy');
  await addProductViaPicker(popup, 'Game Boy Color');

  await clickSidepaneItem(popup, 'Discount Settings');
  await selectConfigOption(popup, 'Discount Type', 'Percentage');
  await popup.getByPlaceholder(/e\.g\., 20/).fill('15');

  await saveEditor(popup);
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
  await popup.close();

  await dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /manage/i }).click();
  await refreshAndVerifyInList(app, 'Discounts', /Game Boy/i);
});
