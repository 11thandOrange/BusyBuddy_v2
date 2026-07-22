import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Inactive Tab Message: navigate Overview -> Settings (no Discounts/Analytics tab)', async ({ page, app }) => {
  await dashboardTile(app, 'Inactive Tab Message').getByRole('button', { name: /manage/i }).click();

  for (const tab of ['Overview', 'Settings']) {
    await gotoTab(app, tab);
  }

  await expect(app.getByText('Discounts', { exact: true })).toHaveCount(0);
  await expect(app.getByText('Analytics', { exact: true })).toHaveCount(0);
});
