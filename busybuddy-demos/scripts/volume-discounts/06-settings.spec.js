import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Volume Discounts: shared Settings tab is reachable', async ({ page, app }) => {
  await dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');

  await expect(app.getByText(/smart bundle detection/i)).toBeVisible({ timeout: 15_000 });
});
