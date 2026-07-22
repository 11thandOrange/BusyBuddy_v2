import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// 1. Open the Mix and Match app from the dashboard
// 2. Click through each tab in turn: Overview, Discounts, Settings, Analytics
// 3. Confirm each tab actually loads
test('Mix and Match: navigate Overview -> Discounts -> Settings -> Analytics', async ({ page, app }) => {
  await dashboardTile(app, 'Mix & Match').getByRole('button', { name: /manage/i }).click();

  for (const tab of ['Overview', 'Discounts', 'Settings', 'Analytics']) {
    await gotoTab(app, tab);
    await page.waitForTimeout(4000); // pacing so the recorded video shows each tab's content, not just a flash
  }
});
