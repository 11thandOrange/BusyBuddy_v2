import { test, expect, dashboardTile, openEditorPopup, saveEditor, waitForSaveAndClose, clickSidepaneItem, fillActiveConfigField, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Click "Create" on the Announcement Bar tile - opens the standalone editor
// 2. Set the message text to "New arrivals just dropped - 20% off today only!"
// 3. Switch to the Appearance tab, open the Background color option
// 4. Click Save and wait for the save confirmation
// 5. Go back to the app, open the Announcement Bars list tab, confirm the new bar is in the list
test('Announcement Bar: create a new bar from the dashboard', async ({ page, app }) => {
  const message = 'New arrivals just dropped - 20% off today only!';
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /create/i }).click()
  );

  await expect(popup.getByText('Content', { exact: true })).toBeVisible();

  await clickSidepaneItem(popup, 'Message Text');
  await fillActiveConfigField(popup, message);

  await popup.getByText('Appearance', { exact: true }).click();
  await clickSidepaneItem(popup, 'Background');

  await saveEditor(popup);
  await waitForSaveAndClose(popup);

  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await refreshAndVerifyInList(app, 'Announcement Bars', message);
});
