import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// 1. Open the Bundle Discounts app, go to the Settings tab
// 2. Click the "Disabled" then "Enabled" radio for Smart Bundle Detection
// 3. Confirm the Discount Combination section is visible
test('Bundle Discounts: Smart Bundle Detection priority setting', async ({ page, app }) => {
  await dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');

  await expect(app.getByText(/smart bundle detection/i)).toBeVisible({ timeout: 15_000 });
  await app.getByText('Disabled', { exact: true }).click();
  await app.getByText('Enabled', { exact: true }).click();

  await expect(app.getByText(/discount combination/i)).toBeVisible();
});
