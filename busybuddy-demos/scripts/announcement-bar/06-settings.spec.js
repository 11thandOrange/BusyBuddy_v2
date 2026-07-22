import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// 1. Open the Announcement Bar app, go to the Settings tab
// 2. Toggle the "Enable close button" checkbox
// 3. Confirm the Email Integration section is visible
test('Announcement Bar: toggle close button and view email integration settings', async ({ page, app }) => {
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');

  await expect(app.getByText(/enable close button/i)).toBeVisible({ timeout: 15_000 });
  await app.getByText(/enable close button/i).locator('..').getByRole('checkbox').click();

  await expect(app.getByText(/email integration/i)).toBeVisible();
});
