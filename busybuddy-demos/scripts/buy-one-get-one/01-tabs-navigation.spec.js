import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

test('BOGO: navigate Overview -> Discounts -> Settings -> Analytics', async ({ page, app }) => {
  await dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /manage/i }).click();

  for (const tab of ['Overview', 'Discounts', 'Settings', 'Analytics']) {
    await gotoTab(app, tab);
  }
});
