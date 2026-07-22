import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Inactive Tab Message: edit the existing message text', async ({ page, app }) => {
  await dashboardTile(app, 'Inactive Tab Message').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');

  const messageInput = app.getByPlaceholder('Enter message to display when tab is inactive');
  await expect(messageInput).toBeVisible({ timeout: 15_000 });
  await messageInput.fill('Don\'t leave yet - 15% off waiting for you! 🎁');

  await app.getByRole('button', { name: /save settings/i }).click();
});
