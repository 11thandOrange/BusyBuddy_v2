import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem, addProductViaPicker } from '../../fixtures/app.js';

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
});
