import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// 1. Open the Buy One Get One app, go to the Analytics tab
// 2. Confirm Total Bundle Revenue and Orders with Bundles are visible
test('BOGO: Analytics tab shows revenue, orders, and top offers', async ({ page, app }) => {
  await dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Analytics');

  await expect(app.getByText(/total bundle revenue/i)).toBeVisible({ timeout: 15_000 });
  await expect(app.getByText(/orders with bundles/i)).toBeVisible();
});
