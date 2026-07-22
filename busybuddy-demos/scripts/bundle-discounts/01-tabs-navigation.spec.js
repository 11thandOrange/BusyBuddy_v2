import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Bundle Discounts: navigate Overview -> Discounts -> Settings -> Analytics', async ({ page, app }) => {
  await dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /manage/i }).click();

  for (const tab of ['Overview', 'Discounts', 'Settings', 'Analytics']) {
    await gotoTab(app, tab);
  }
});
