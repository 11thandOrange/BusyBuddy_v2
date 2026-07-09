/**
 * E2E tests for the storefront-facing theme extension scripts.
 *
 * These load the *real* assets/announcement-bar-extension.js and
 * assets/inactiveTab.js files via a normal <script src> tag served from a
 * throwaway static server (see static-server.js), and mock only the
 * /apps/bogo-app/api/frontStore/* network calls those scripts make - the
 * same contract the real backend serves. This is the first test coverage
 * of any kind for the customer-facing (as opposed to admin) side of the app.
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import { startStaticServer, stopStaticServer, ASSETS_DIR } from './static-server.js';

const ANNOUNCEMENT_BAR_SCRIPT = path.join(ASSETS_DIR, 'announcement-bar-extension.js');
const INACTIVE_TAB_SCRIPT = path.join(ASSETS_DIR, 'inactiveTab.js');

let server;
let baseURL;

test.beforeAll(async () => {
  const fixtureHtml = `<!doctype html>
<html>
  <head><title>Storefront Test</title></head>
  <body>
    <div id="busybuddy-announcement-bar"></div>
  </body>
</html>`;
  const started = await startStaticServer(fixtureHtml);
  server = started.server;
  baseURL = started.baseURL;
});

test.afterAll(async () => {
  await stopStaticServer(server);
});

const ANNOUNCEMENT_ENDPOINT = '**/apps/bogo-app/api/frontStore/getAnnouncementBar';
const SUBSCRIBE_ENDPOINT = '**/apps/bogo-app/api/frontStore/subscribe';

function baseAnnouncementBarData(overrides = {}) {
  return {
    _id: 'bar-1',
    type: 'Info',
    showMessage: true,
    message: 'Free shipping on orders over $50',
    animateMessage: false,
    generalColorSettings: { 'Background Color': '#007bff', 'Message Font Color': '#ffffff' },
    colorSettings: { 'Background Color': '#007bff' },
    selectedTheme: 'solid',
    barWidth: 100,
    barHeight: 60,
    barPosition: 'top-fixed',
    showSaveBox: false,
    showTimerOptions: false,
    showEndSaleMessage: false,
    showWaveOptions: false,
    showShopNowButton: false,
    ...overrides,
  };
}

async function loadAnnouncementBarPage(page, apiResponse) {
  await page.route(ANNOUNCEMENT_ENDPOINT, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(apiResponse) })
  );
  // addInitScript runs before the navigated document's own scripts, so the
  // real file's `document.addEventListener("DOMContentLoaded", ...)`
  // reliably attaches before that event fires - unlike addScriptTag after
  // goto(), which would inject too late (DOMContentLoaded already passed).
  await page.addInitScript({ path: ANNOUNCEMENT_BAR_SCRIPT });
  await page.goto(baseURL);
  // The script's DOMContentLoaded handler is async (awaits fetch); give it
  // a moment to settle rather than asserting immediately.
  await page.waitForTimeout(300);
}

test.describe('Announcement bar rendering', () => {
  test('renders the bar and message when the backend returns an active bar', async ({ page }) => {
    await loadAnnouncementBarPage(page, { status: 'SUCCESS', data: baseAnnouncementBarData() });

    const container = page.locator('#busybuddy-announcement-bar');
    await expect(container).toContainText('Free shipping on orders over $50');
  });

  test('does not render anything when the backend has no active bar (disabled state)', async ({ page }) => {
    await loadAnnouncementBarPage(page, { status: 'SUCCESS', data: null });

    const container = page.locator('#busybuddy-announcement-bar');
    await expect(container).toBeEmpty();
  });

  test('does not render anything when the backend returns an error status', async ({ page }) => {
    await loadAnnouncementBarPage(page, { status: 'ERROR' });

    const container = page.locator('#busybuddy-announcement-bar');
    await expect(container).toBeEmpty();
  });

  test('uses safe DOM construction for the scrolling message, not innerHTML (XSS regression)', async ({ page }) => {
    const malicious = '<img src=x onerror="window.__xss = true">';
    await loadAnnouncementBarPage(
      page,
      { status: 'SUCCESS', data: baseAnnouncementBarData({ animateMessage: true, message: malicious }) }
    );

    // If the message were ever assigned via innerHTML again, this would be
    // a real, rendered <img> element and the onerror handler would fire.
    await expect(page.locator('#busybuddy-announcement-bar img')).toHaveCount(0);
    const xssFired = await page.evaluate(() => window.__xss === true);
    expect(xssFired).toBe(false);

    // The literal text must still be visible (as text, not parsed markup).
    await expect(page.locator('#busybuddy-announcement-bar')).toContainText(malicious);
  });

  test('shows the email capture form and submits successfully', async ({ page }) => {
    await page.route(SUBSCRIBE_ENDPOINT, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Thanks for subscribing!' }),
      })
    );
    await loadAnnouncementBarPage(page, {
      status: 'SUCCESS',
      data: baseAnnouncementBarData({
        type: 'Email',
        emailSettings: { placeholderText: 'Enter email', buttonText: 'Subscribe', listId: 'list-1' },
      }),
    });

    await page.locator('.email-input').fill('shopper@example.com');
    await page.locator('.email-submit-button').click();

    await expect(page.locator('.email-success-message')).toBeVisible();
    await expect(page.locator('.email-success-message')).toContainText('Thanks for subscribing!');
  });

  test('rejects an invalid email client-side without calling the backend', async ({ page }) => {
    let subscribeCalled = false;
    await page.route(SUBSCRIBE_ENDPOINT, (route) => {
      subscribeCalled = true;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
    await loadAnnouncementBarPage(page, {
      status: 'SUCCESS',
      data: baseAnnouncementBarData({
        type: 'Email',
        emailSettings: { placeholderText: 'Enter email', buttonText: 'Subscribe', listId: 'list-1' },
      }),
    });

    await page.locator('.email-input').fill('not-an-email');
    await page.locator('.email-submit-button').click();

    await expect(page.locator('.email-error-message')).toBeVisible();
    expect(subscribeCalled).toBe(false);
  });
});

const INACTIVE_TAB_ENDPOINT = '**/apps/bogo-app/api/frontStore/getInactiveTab';

async function loadInactiveTabPage(page, settings) {
  await page.route(INACTIVE_TAB_ENDPOINT, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'SUCCESS', data: settings }),
    })
  );
  await page.addInitScript({ path: INACTIVE_TAB_SCRIPT });
  await page.goto(baseURL);
  await page.waitForTimeout(300);
}

async function simulateVisibilityChange(page, hidden) {
  await page.evaluate((isHidden) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => isHidden });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}

test.describe('Inactive tab message', () => {
  test('changes the tab title when hidden and restores it when visible again', async ({ page }) => {
    await loadInactiveTabPage(page, {
      message: 'Come back! 🎁',
      isEnabled: true,
      startDate: null,
      endDate: null,
      imageUrl: null,
    });
    const originalTitle = await page.title();

    await simulateVisibilityChange(page, true);
    await expect.poll(() => page.title()).toBe('Come back! 🎁');

    await simulateVisibilityChange(page, false);
    await expect.poll(() => page.title()).toBe(originalTitle);
  });

  test('does not change the title when the feature is disabled', async ({ page }) => {
    await loadInactiveTabPage(page, {
      message: 'Come back! 🎁',
      isEnabled: false,
      startDate: null,
      endDate: null,
      imageUrl: null,
    });
    const originalTitle = await page.title();

    await simulateVisibilityChange(page, true);
    // Give it a beat, then confirm nothing changed.
    await page.waitForTimeout(200);
    expect(await page.title()).toBe(originalTitle);
  });

  test('honors the date window: does not show before startDate', async ({ page }) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await loadInactiveTabPage(page, {
      message: 'Come back! 🎁',
      isEnabled: true,
      startDate: tomorrow,
      endDate: null,
      imageUrl: null,
    });
    const originalTitle = await page.title();

    await simulateVisibilityChange(page, true);
    await page.waitForTimeout(200);
    expect(await page.title()).toBe(originalTitle);
  });

  test('honors the date window: does not show after endDate', async ({ page }) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await loadInactiveTabPage(page, {
      message: 'Come back! 🎁',
      isEnabled: true,
      startDate: null,
      endDate: yesterday,
      imageUrl: null,
    });
    const originalTitle = await page.title();

    await simulateVisibilityChange(page, true);
    await page.waitForTimeout(200);
    expect(await page.title()).toBe(originalTitle);
  });

  test('honors the date window: shows when within startDate/endDate range', async ({ page }) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await loadInactiveTabPage(page, {
      message: 'Come back! 🎁',
      isEnabled: true,
      startDate: yesterday,
      endDate: tomorrow,
      imageUrl: null,
    });

    await simulateVisibilityChange(page, true);
    await expect.poll(() => page.title()).toBe('Come back! 🎁');
  });
});
