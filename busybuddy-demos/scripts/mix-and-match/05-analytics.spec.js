import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Mix and Match: Analytics tab shows revenue and distribution', async ({ page, app }) => {
  await dashboardTile(app, 'Mix & Match').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Analytics');

  await expect(app.getByText(/total bundle revenue/i)).toBeVisible({ timeout: 15_000 });
});
