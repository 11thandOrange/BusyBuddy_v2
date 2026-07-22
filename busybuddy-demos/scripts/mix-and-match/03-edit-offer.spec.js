import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor } from '../../fixtures/app.js';

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
});
