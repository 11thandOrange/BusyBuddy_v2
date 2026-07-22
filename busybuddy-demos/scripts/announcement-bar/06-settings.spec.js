import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Announcement Bar: toggle close button and view email integration settings', async ({ page, app }) => {
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');

  await expect(app.getByText(/enable close button/i)).toBeVisible({ timeout: 15_000 });
  await app.getByText(/enable close button/i).locator('..').getByRole('checkbox').click();

  await expect(app.getByText(/email integration/i)).toBeVisible();
});
