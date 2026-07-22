import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor, clickSidepaneItem } from '../../fixtures/app.js';

test('Bundle Discounts: edit an existing bundle\'s discount and message', async ({ page, app }) => {
  await dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Discounts');

  const firstBundle = app.locator('.bundlebox').first();
  await expect(firstBundle).toBeVisible();

  const popup = await openEditorPopup(page, () =>
    firstBundle.locator('..').locator('..').getByRole('button').filter({ hasText: '' }).first().click()
  );

  await clickSidepaneItem(popup, 'Discount Settings');
  await popup.getByPlaceholder(/e\.g\., 20/).fill('25');

  await popup.getByText('Content', { exact: true }).click();
  await clickSidepaneItem(popup, 'Message Text');

  await saveEditor(popup);
});
