import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor, clickSidepaneItem, fillActiveConfigField, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Open the Announcement Bar app, go to the Announcement Bars list tab
// 2. Open the first existing bar in the list
// 3. Change its message to "Updated: Free shipping over $50!"
// 4. Click Save and wait for the save confirmation
// 5. Go back to the Announcement Bars list tab, confirm the updated message is there
test('Announcement Bar: edit an existing bar', async ({ page, app }) => {
  const updatedMessage = 'Updated: Free shipping over $50!';
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Announcement Bars');

  const firstRow = app.locator('.bundlebox, [class*="bar-item"], [class*="bar-row"]').first();
  await expect(firstRow).toBeVisible();

  const popup = await openEditorPopup(page, () => firstRow.getByRole('button').first().click());

  await clickSidepaneItem(popup, 'Message Text');
  await fillActiveConfigField(popup, updatedMessage);

  await saveEditor(popup);
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
  await popup.close();

  await refreshAndVerifyInList(app, 'Announcement Bars', updatedMessage);
});
