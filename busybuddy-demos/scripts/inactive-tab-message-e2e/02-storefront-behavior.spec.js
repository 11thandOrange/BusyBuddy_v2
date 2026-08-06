import { test, expect, dashboardTile, appWideToggle, STORE_DOMAIN } from '../../fixtures/app.js';

// Ticket: Inactive Tab Message App - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/311)
//
// Suite 2 - Storefront Behavior. This app's real effect is entirely on the
// storefront (extensions/bogo-shopify-app/assets/inactiveTab.js listens for
// visibilitychange and swaps document.title), which only runs at all once
// the app-wide switch (ToggelSwitch.jsx) is enabled. This suite ensures
// that itself (rather than depending on 01-configure-settings.spec.js
// having left it that way) and restores whatever it found afterward -
// forcing it Active and leaving it there previously ate into the store's
// plan-limited enabled-app count and broke every other app's own toggle
// step once their own attempt to enable hit that same limit.
test('Inactive Tab Message: swaps and restores the browser tab title on visibilitychange', async ({ page, app }) => {
  await dashboardTile(app, 'Inactive Tab Message').getByRole('button', { name: 'Manage', exact: true }).click();
  const toggle = appWideToggle(app);
  await expect(toggle).toBeVisible({ timeout: 15_000 });
  const wasActive = (await toggle.getAttribute('title')) === 'Click to disable';
  if (!wasActive) {
    // ToggelSwitch.jsx fetches /api/subscription/getUserSubscription once
    // on mount; until that resolves, checkCanEnable() no-ops every enable
    // click (see fixtures/app.js's toggleAppWideSwitchAndRestore, which
    // hit this same race) - retry rather than assuming the first click
    // lands after that fetch has settled.
    let flipped = false;
    for (let attempt = 0; attempt < 8 && !flipped; attempt++) {
      await toggle.click();
      flipped = await expect(toggle.getByText('Active', { exact: true }))
        .toBeVisible({ timeout: 3_000 })
        .then(() => true)
        .catch(() => false);
    }
    if (!flipped) throw new Error('App-wide toggle never flipped to Active after 8 attempts.');
  }

  // A separate tab (rather than navigating the admin `page` itself away to
  // the storefront) keeps the toggle above alive and reachable, so it can
  // be restored below without re-resolving the embedded admin iframe.
  const storefrontPage = await page.context().newPage();
  await storefrontPage.goto(`https://${STORE_DOMAIN}`);
  const originalTitle = await storefrontPage.title();

  // document.hidden is a read-only getter on the real Document prototype -
  // overriding it here is what lets a single-page headless browser context
  // simulate "tab switched away" without a second real tab.
  await storefrontPage.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => storefrontPage.title(), { timeout: 10_000 }).not.toBe(originalTitle);

  await storefrontPage.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => storefrontPage.title(), { timeout: 10_000 }).toBe(originalTitle);
  await storefrontPage.close();

  if (!wasActive) {
    await toggle.click();
    await expect(toggle.getByText('Inactive', { exact: true })).toBeVisible({ timeout: 15_000 });
  }
});
