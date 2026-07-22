import { test, expect, dashboardTile, openEditorPopup, saveEditor, clickSidepaneItem, fillActiveConfigField } from '../../fixtures/app.js';

test('Announcement Bar: create a new bar from the dashboard', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /create/i }).click()
  );

  await expect(popup.getByText('Content', { exact: true })).toBeVisible();

  await clickSidepaneItem(popup, 'Message Text');
  await fillActiveConfigField(popup, "New arrivals just dropped - 20% off today only!");

  await popup.getByText('Appearance', { exact: true }).click();
  await clickSidepaneItem(popup, 'Background');

  await saveEditor(popup);
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
});
