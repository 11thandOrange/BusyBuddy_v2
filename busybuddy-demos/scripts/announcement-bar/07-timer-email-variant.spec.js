import { test, expect, dashboardTile, openEditorPopup, saveEditor, waitForSaveAndClose, clickSidepaneItem, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Click "Create" on the Announcement Bar tile
// 2. Open the Countdown Timer option and turn it on
// 3. Open the Email Form option (email-capture bar variant)
// 4. Click Save and wait for the save confirmation
// 5. Go back to the app, confirm the new bar (default "Summer Sale" text) is in the Announcement Bars list
test('Announcement Bar: countdown timer and email-capture bar variants', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Countdown Timer');
  await popup.getByRole('checkbox').first().check().catch(() => {});
  await expect(popup.getByText(/countdown timer/i)).toBeVisible();

  await clickSidepaneItem(popup, 'Email Form');
  await expect(popup.getByText(/email form/i)).toBeVisible();

  await saveEditor(popup);
  await waitForSaveAndClose(popup);

  // No custom message is set in this variant - AnnouncementBarEditor.jsx's
  // own default title/message ("Summer Sale Banner" / "Summer Sale") is
  // what should show up in the list.
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await refreshAndVerifyInList(app, 'Announcement Bars', /summer sale/i);
});
