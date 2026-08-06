import { test, expect, demoPause, dashboardTile, gotoTab } from '../../fixtures/app.js';

// Ticket: Announcement Bar App - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/310)
//
// Suite 4 - Settings.
test('Announcement Bar: toggle close button, then check Analytics', async ({ page, app }) => {
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');
  await demoPause(app);

  await expect(app.getByText(/enable close button/i)).toBeVisible({ timeout: 15_000 });
  await app.getByText(/enable close button/i).locator('..').getByRole('checkbox').click();
  await expect(app.getByText(/email integration/i)).toBeVisible();
  await demoPause(app);

  await gotoTab(app, 'Analytics');
  await expect(app.getByText(/total views/i)).toBeVisible({ timeout: 15_000 });
});
