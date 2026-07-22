import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem } from '../../fixtures/app.js';

test('Mix and Match: create an offer with a Buy 3 tier preset', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Mix & Match').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Select Products');
  await popup.getByPlaceholder('Search products...').fill('Cassette');
  await popup.getByText('Cassette', { exact: false }).first().click();

  await popup.getByText('Tier Settings', { exact: true }).click();
  await popup.getByText('Buy 3', { exact: true }).click();

  await saveEditor(popup);
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
});
