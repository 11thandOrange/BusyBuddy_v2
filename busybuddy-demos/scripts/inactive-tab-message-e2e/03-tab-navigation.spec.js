import { test, expect, dashboardTile, gotoTab } from '../../fixtures/app.js';

// Ticket: Inactive Tab Message App - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/311)
//
// Suite 3 - Tab Navigation. Unlike the other 5 apps, DiscountList.jsx (this
// app's own page) only ever renders 2 tabs (Overview, Settings) - no
// Discounts or Analytics tab exists here at all.
test('Inactive Tab Message: navigate Overview <-> Settings, no Discounts/Analytics tab', async ({ page, app }) => {
  // Both the tile's "Create" and "Manage" buttons resolve to this same page
  // - a regex matching either throws a strict-mode violation since both are
  // present at once (see 01-configure-settings.spec.js), so pick one.
  await dashboardTile(app, 'Inactive Tab Message').getByRole('button', { name: 'Manage', exact: true }).click();

  await gotoTab(app, 'Overview');
  await expect(app.getByText('Customizable', { exact: true })).toBeVisible({ timeout: 15_000 });

  await gotoTab(app, 'Settings');
  await expect(app.getByText("Shown in the browser tab's title when a visitor switches away from your store.")).toBeVisible({ timeout: 15_000 });

  await expect(app.getByRole('group').getByText('Discounts', { exact: true })).toHaveCount(0);
  await expect(app.getByRole('group').getByText('Analytics', { exact: true })).toHaveCount(0);
});
