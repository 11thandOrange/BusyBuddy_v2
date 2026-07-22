import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// 1. Open the Bundle Discounts app, go to the Analytics tab
// 2. Confirm Total Bundle Revenue, Orders with Bundles, and Top Bundles are visible
test('Bundle Discounts: Analytics tab shows revenue, orders, and top bundles', async ({ page, app }) => {
  await dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Analytics');

  await expect(app.getByText(/total bundle revenue/i)).toBeVisible({ timeout: 15_000 });
  await expect(app.getByText(/orders with bundles/i)).toBeVisible();
  await expect(app.getByText(/top bundles/i)).toBeVisible();
});
