import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor, clickSidepaneItem } from '../../fixtures/app.js';

test('BOGO: edit the "get" product selection and discount', async ({ page, app }) => {
  await dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Discounts');

  const firstOffer = app.locator('.bundlebox').first();
  await expect(firstOffer).toBeVisible();

  const popup = await openEditorPopup(page, () =>
    firstOffer.locator('..').locator('..').getByRole('button').first().click()
  );

  await clickSidepaneItem(popup, 'Discount Settings');
  await popup.getByPlaceholder(/e\.g\., 20/).fill('30');

  await saveEditor(popup);
});
