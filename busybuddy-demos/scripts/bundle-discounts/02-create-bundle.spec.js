import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem, addProductViaPicker, selectConfigOption } from '../../fixtures/app.js';

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
});
