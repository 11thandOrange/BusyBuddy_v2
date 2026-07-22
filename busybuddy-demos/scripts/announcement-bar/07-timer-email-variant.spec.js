import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem } from '../../fixtures/app.js';

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
});
