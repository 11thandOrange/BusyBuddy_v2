import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem, addProductViaPicker } from '../../fixtures/app.js';

test('Mix and Match: create an offer with a Buy 3 tier preset', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Mix & Match').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPicker(popup, 'Cassette');

  await clickSidepaneItem(popup, 'Tier Settings');
  // "Buy 3" also appears as a plain (non-interactive) form-group label in
  // the Tier Settings panel itself - the real, clickable tier selector is
  // a <button> in the live preview pane, so scope by role to land on it.
  await popup.getByRole('button', { name: 'Buy 3' }).click();

  await saveEditor(popup);
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
});
