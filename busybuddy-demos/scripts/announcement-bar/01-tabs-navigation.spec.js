import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// 1. Open the Announcement Bar app from the dashboard
// 2. Click through each tab in turn: Overview, Announcement Bars, Settings, Analytics
// 3. Confirm each tab actually loads
test('Announcement Bar: navigate Overview -> Announcement Bars -> Settings -> Analytics', async ({ page, app }) => {
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();

  await expect(app.getByText('Announcement Bar', { exact: true }).first()).toBeVisible();

  for (const tab of ['Overview', 'Announcement Bars', 'Settings', 'Analytics']) {
    await gotoTab(app, tab);
    await page.waitForTimeout(4000); // pacing so the recorded video shows each tab's content, not just a flash
  }
});
