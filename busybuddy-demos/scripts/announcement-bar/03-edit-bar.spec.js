import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor, clickSidepaneItem, fillActiveConfigField } from '../../fixtures/app.js';

test('Announcement Bar: edit an existing bar', async ({ page, app }) => {
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Announcement Bars');

  const firstRow = app.locator('.bundlebox, [class*="bar-item"], [class*="bar-row"]').first();
  await expect(firstRow).toBeVisible();

  const popup = await openEditorPopup(page, () => firstRow.getByRole('button').first().click());

  await clickSidepaneItem(popup, 'Message Text');
  await fillActiveConfigField(popup, 'Updated: Free shipping over $50!');

  await saveEditor(popup);
});
