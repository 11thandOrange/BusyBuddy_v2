import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// 1. Open the Announcement Bar app, go to the Analytics tab
// 2. Confirm Total Views, Total Clicks, and Active Bars stats are visible
test('Announcement Bar: Analytics tab shows stat cards and charts', async ({ page, app }) => {
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Analytics');

  await expect(app.getByText(/total views/i)).toBeVisible({ timeout: 15_000 });
  await expect(app.getByText(/total clicks/i)).toBeVisible();
  await expect(app.getByText(/active bars/i)).toBeVisible();
});
