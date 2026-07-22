import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem } from '../../fixtures/app.js';

test('Bundle Discounts: create a bundle from 2 seeded products', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Select Products');
  await popup.getByPlaceholder('Search products...').fill('Game Boy');
  await popup.getByText('Nintendo Game Boy', { exact: false }).first().click();
  await popup.getByPlaceholder('Search products...').fill('Game Boy Color');
  await popup.getByText('Game Boy Color', { exact: false }).first().click();

  await clickSidepaneItem(popup, 'Discount Settings');
  await popup.getByPlaceholder(/e\.g\., 20/).fill('15');

  await saveEditor(popup);
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
});
