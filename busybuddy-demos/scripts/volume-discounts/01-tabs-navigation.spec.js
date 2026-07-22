import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('Volume Discounts: navigate Overview -> Discounts -> Settings -> Analytics', async ({ page, app }) => {
  await dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /manage/i }).click();

  for (const tab of ['Overview', 'Discounts', 'Settings', 'Analytics']) {
    await gotoTab(app, tab);
  }
});
