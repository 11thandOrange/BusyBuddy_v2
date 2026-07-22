import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem, addProductViaPicker, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Click "Create" on the Mix and Match tile - opens the standalone editor
// 2. Open "Select Products", add "Cassette" via the product picker
// 3. Open Tier Settings, click the "Buy 3" preset button in the live preview
// 4. Click Save and wait for the save confirmation
// 5. Go back to the app, open the Discounts list tab, confirm the new offer is in the list
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
  await popup.close();

  await dashboardTile(app, 'Mix & Match').getByRole('button', { name: /manage/i }).click();
  await refreshAndVerifyInList(app, 'Discounts', /Cassette/i);
});
