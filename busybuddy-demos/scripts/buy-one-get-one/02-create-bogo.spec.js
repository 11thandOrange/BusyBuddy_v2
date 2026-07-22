import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem } from '../../fixtures/app.js';

test('BOGO: create a Buy X Get Y offer', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Select Products');
  const searchInputs = popup.getByPlaceholder('Search products...');
  await searchInputs.first().fill('Sony Walkman');
  await popup.getByText('Sony Walkman', { exact: false }).first().click();
  await searchInputs.last().fill('Polaroid');
  await popup.getByText('Polaroid', { exact: false }).first().click();

  await clickSidepaneItem(popup, 'Discount Settings');
  await popup.getByPlaceholder(/e\.g\., 20/).fill('50');

  await saveEditor(popup);
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
});
