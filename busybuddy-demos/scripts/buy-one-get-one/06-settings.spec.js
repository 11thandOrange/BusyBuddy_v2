import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('BOGO: Smart Bundle Detection / Discount Combination settings', async ({ page, app }) => {
  await dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');

  await expect(app.getByText(/smart bundle detection/i)).toBeVisible({ timeout: 15_000 });
  await expect(app.getByText(/discount combination/i)).toBeVisible();
});
