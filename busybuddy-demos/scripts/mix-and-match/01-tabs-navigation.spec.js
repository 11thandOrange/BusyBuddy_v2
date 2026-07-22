import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Mix and Match: navigate Overview -> Discounts -> Settings -> Analytics', async ({ page, app }) => {
  await dashboardTile(app, 'Mix & Match').getByRole('button', { name: /manage/i }).click();

  for (const tab of ['Overview', 'Discounts', 'Settings', 'Analytics']) {
    await gotoTab(app, tab);
  }
});
