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
  // react-bootstrap's Form.Check (DiscountList.jsx) renders the label and
  // checkbox input as siblings under a shared .form-check div, not nested -
  // .locator('..') from the label text lands one level short of where the
  // checkbox actually is. Scoping to the shared .form-check ancestor first
  // reaches both.
  await app.locator('.form-check').filter({ hasText: /enable close button/i }).getByRole('checkbox').click();
  await expect(app.getByText(/email integration/i)).toBeVisible();
  await demoPause(app);

  await gotoTab(app, 'Analytics');
  // .first(): "Total Views" appears both as a stat-card heading and again
  // as a row label in a breakdown table further down the page.
  await expect(app.getByText(/total views/i).first()).toBeVisible({ timeout: 15_000 });
});
