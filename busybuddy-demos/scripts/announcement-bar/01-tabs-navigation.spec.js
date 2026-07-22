import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Announcement Bar: navigate Overview -> Announcement Bars -> Settings -> Analytics', async ({ page, app }) => {
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();

  await expect(app.getByText('Announcement Bar', { exact: true }).first()).toBeVisible();

  for (const tab of ['Overview', 'Announcement Bars', 'Settings', 'Analytics']) {
    await gotoTab(app, tab);
  }
});
