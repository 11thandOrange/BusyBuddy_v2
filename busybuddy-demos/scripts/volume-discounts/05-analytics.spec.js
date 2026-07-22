import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Volume Discounts: Analytics tab shows revenue and quantity distribution', async ({ page, app }) => {
  await dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Analytics');

  await expect(app.getByText(/total bundle revenue/i)).toBeVisible({ timeout: 15_000 });
  await expect(app.getByText(/top bundles/i)).toBeVisible();
});
