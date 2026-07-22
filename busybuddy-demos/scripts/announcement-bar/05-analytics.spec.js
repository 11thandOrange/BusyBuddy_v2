import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Announcement Bar: Analytics tab shows stat cards and charts', async ({ page, app }) => {
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Analytics');

  await expect(app.getByText(/total views/i)).toBeVisible({ timeout: 15_000 });
  await expect(app.getByText(/total clicks/i)).toBeVisible();
  await expect(app.getByText(/active bars/i)).toBeVisible();
});
