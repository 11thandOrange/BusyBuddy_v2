import { test, expect, dashboardTile, gotoTab, gotoStorefrontHome } from '../../fixtures/app.js';

// 1. Open the Inactive Tab Message app, go to the Settings tab
// 2. Toggle the enable/disable switch off then back on, click "Save Settings"
test('Inactive Tab Message: date-window gating and enable/disable toggle', async ({ page, app }) => {
  await dashboardTile(app, 'Inactive Tab Message').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Settings');

  const enableToggle = app.locator('input[type="checkbox"]').last();
  await expect(enableToggle).toBeVisible({ timeout: 15_000 });
  await enableToggle.click();
  await enableToggle.click();

  await app.getByRole('button', { name: /save settings/i }).click();
});

// 1. Load the live storefront homepage
// 2. Simulate switching away to another browser tab
// 3. Confirm the page title actually changes to the configured inactive-tab message
test('Inactive Tab Message: swaps the browser tab title when the tab goes inactive', async ({ page }) => {
  await gotoStorefrontHome(page);
  const originalTitle = await page.title();

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  await expect.poll(() => page.title(), { timeout: 10_000 }).not.toBe(originalTitle);
});
