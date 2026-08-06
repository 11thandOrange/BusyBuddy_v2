import { test, expect, demoPause, dashboardTile, gotoTab } from '../../fixtures/app.js';

// Ticket: Mix & Match Discount Bundle - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/308)
//
// Suite 4 - Settings.
test('Mix & Match: disable Smart Bundle Detection, then check Analytics', async ({ page, app }) => {
  await dashboardTile(app, 'Mix & Match').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');
  await demoPause(app);

  await expect(app.getByText(/smart bundle detection/i)).toBeVisible({ timeout: 15_000 });
  await app.getByText('Disabled', { exact: true }).click();
  await demoPause(app);

  await gotoTab(app, 'Analytics');
  await expect(app.getByText(/total bundle revenue/i)).toBeVisible({ timeout: 15_000 });
});
