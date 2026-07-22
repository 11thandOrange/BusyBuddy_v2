import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor } from '../../fixtures/app.js';

test('Mix and Match: switch tier preset and change a tier discount', async ({ page, app }) => {
  await dashboardTile(app, 'Mix & Match').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Discounts');

  const firstOffer = app.locator('.bundlebox').first();
  await expect(firstOffer).toBeVisible();

  const popup = await openEditorPopup(page, () =>
    firstOffer.locator('..').locator('..').getByRole('button').first().click()
  );

  await popup.getByText('Tier Settings', { exact: true }).click();
  await popup.getByText('Buy 4', { exact: true }).click();

  await saveEditor(popup);
});
