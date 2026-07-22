import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// 1. Open the Buy One Get One app, go to the Settings tab
// 2. Confirm the Smart Bundle Detection and Discount Combination sections are visible
test('BOGO: Smart Bundle Detection / Discount Combination settings', async ({ page, app }) => {
  await dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');

  await expect(app.getByText(/smart bundle detection/i)).toBeVisible({ timeout: 15_000 });
  await expect(app.getByText(/discount combination/i)).toBeVisible();
});
