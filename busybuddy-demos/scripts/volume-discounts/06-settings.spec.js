import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// 1. Open the Volume Discounts app, go to the Settings tab
// 2. Confirm the Smart Bundle Detection section is visible
test('Volume Discounts: shared Settings tab is reachable', async ({ page, app }) => {
  await dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');

  await expect(app.getByText(/smart bundle detection/i)).toBeVisible({ timeout: 15_000 });
});
