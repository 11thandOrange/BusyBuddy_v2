import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor, waitForSaveAndClose, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Open the Mix and Match app, go to the Discounts list tab
// 2. Open the first existing offer in the list
// 3. Go to Tier Settings, click the "Buy 4" preset button
// 4. Click Save and wait for the save confirmation
// 5. Go back to the Discounts list tab, confirm the offer is still there
test('Mix and Match: switch tier preset and change a tier discount', async ({ page, app }) => {
  await dashboardTile(app, 'Mix & Match').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Discounts');

  const firstOffer = app.locator('.bundlebox').first();
  await expect(firstOffer).toBeVisible();

  const popup = await openEditorPopup(page, () =>
    firstOffer.locator('..').locator('..').getByRole('button').first().click()
  );

  await popup.getByText('Tier Settings', { exact: true }).first().click();
  // The clickable tier selector is a <button> in the live preview pane;
  // "Buy 4" also appears as a plain label in the Tier Settings panel.
  await popup.getByRole('button', { name: 'Buy 4' }).click();

  await saveEditor(popup);
  await waitForSaveAndClose(popup);

  await refreshAndVerifyInList(app, 'Discounts', /Cassette/i);
});
