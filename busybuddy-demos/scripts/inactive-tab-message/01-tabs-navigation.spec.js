import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// 1. Open the Inactive Tab Message app from the dashboard
// 2. Click through the Overview and Settings tabs (this app has no Discounts/Analytics tab)
// 3. Confirm there's no Discounts or Analytics tab present
test('Inactive Tab Message: navigate Overview -> Settings (no Discounts/Analytics tab)', async ({ page, app }) => {
  await dashboardTile(app, 'Inactive Tab Message').getByRole('button', { name: /manage/i }).click();

  for (const tab of ['Overview', 'Settings']) {
    await gotoTab(app, tab);
    await page.waitForTimeout(4000); // pacing so the recorded video shows each tab's content, not just a flash
  }

  await expect(app.getByText('Discounts', { exact: true })).toHaveCount(0);
  await expect(app.getByText('Analytics', { exact: true })).toHaveCount(0);
});
