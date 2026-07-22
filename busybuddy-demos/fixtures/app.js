import { test as base, expect } from '@playwright/test';

/**
 * BUSYBUDDY_ADMIN_URL must point at the BusyBuddy app's embedded admin
 * entrypoint for Daisy's Electronics, e.g.
 * https://admin.shopify.com/store/daisys-electronics-9kihd5yl/apps/<app-handle>
 * See ../README.md for how to obtain the app handle and auth.json.
 */
export const ADMIN_URL = process.env.BUSYBUDDY_ADMIN_URL;
export const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'daisys-electronics-9kihd5yl.myshopify.com';

export const EDITOR_ROUTES = {
  'Announcement Bar': 'announcement-bar',
  'Bundle Discount': 'bundle-discount',
  'Buy One Get One': 'buy-one-get-one',
  'Volume Discount': 'volume-discounts',
  'Mix and Match': 'mix-and-match',
};

export const DASHBOARD_TILES = {
  announcementBar: 'Announcement Bar',
  bundleDiscount: 'Bundle Discounts',
  bogo: 'Buy One Get One',
  volumeDiscounts: 'Volume Discounts',
  mixAndMatch: 'Mix & Match',
  inactiveTabMessage: 'Inactive Tab Message',
};

/**
 * BusyBuddy runs embedded inside an admin.shopify.com iframe, but the
 * iframe's name/id isn't stable across admin releases (Spring '26 doesn't
 * use the traditional name="app-iframe"), so guessing a selector for it is
 * fragile. Instead this polls the top-level page and every child frame for
 * '.widget-tile' (the dashboard's own DOM, see web/frontend/pages/
 * DashboardHome.jsx) and hands back whichever one actually has it - a
 * Playwright Frame supports the same locator/getByText/getByRole API as
 * Page, so every script below works unmodified against either.
 */
async function pollForAppScope(page, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      if (await page.locator('.widget-tile').count() > 0) return page;
      for (const frame of page.frames()) {
        if (frame === page.mainFrame()) continue;
        if (await frame.locator('.widget-tile').count() > 0) return frame;
      }
    } catch (err) {
      lastError = err; // frames can detach mid-poll while the app iframe loads/reloads
    }
    await page.waitForTimeout(500);
  }
  return { timedOut: true, lastError };
}

/**
 * The app's backend occasionally 502s the embedded iframe on a cold start
 * (a fresh container hasn't finished booting yet) - that response is
 * static once loaded, so only a page reload gets a fresh attempt, not more
 * polling. Retries a couple of full reloads before giving up.
 */
async function resolveAppScope(page, { attempts = 3, timeoutPerAttemptMs = 20_000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const result = await pollForAppScope(page, timeoutPerAttemptMs);
    if (result && !result.timedOut) return result;
    lastError = result?.lastError;
    if (attempt < attempts) await page.reload();
  }
  throw new Error(
    `Timed out waiting for the BusyBuddy dashboard ('.widget-tile') in the top-level page or any iframe after ${attempts} attempts (page reloaded between each - likely a cold-start 502 from the app backend if this persists).${lastError ? ` Last error: ${lastError.message}` : ''}`
  );
}

export const test = base.extend({
  app: async ({ page }, use) => {
    if (!ADMIN_URL) {
      throw new Error('BUSYBUDDY_ADMIN_URL is not set - see busybuddy-demos/README.md');
    }
    await page.goto(ADMIN_URL);
    await use(await resolveAppScope(page));
  },
});

export { expect };

/** Clicks a top-level tab rendered by DiscountList/BundelDiscountList (react-bootstrap ToggleButton labels). */
export async function gotoTab(app, tabName) {
  await app.getByText(tabName, { exact: true }).click();
}

/** Scopes down to a single widget tile on the dashboard by its visible title. */
export function dashboardTile(app, widgetTitle) {
  return app.locator('.widget-tile').filter({ hasText: widgetTitle });
}

/**
 * Widget editors (all apps except Inactive Tab Message) open via
 * window.open() as a standalone /editor.html popup, outside the App Bridge
 * iframe. This waits for that popup and returns it.
 */
export async function openEditorPopup(page, trigger) {
  const [popup] = await Promise.all([page.waitForEvent('popup'), trigger()]);
  await popup.waitForLoadState();
  return popup;
}

/** Saves from within an editor popup (components/Editor/EditorHeader.jsx's .btn-save). */
export async function saveEditor(popup) {
  await popup.locator('button.btn-save').click();
}

export async function gotoStorefrontHome(page) {
  await page.goto(`https://${STORE_DOMAIN}`);
}

export async function gotoStorefrontProduct(page, handle) {
  await page.goto(`https://${STORE_DOMAIN}/products/${handle}`);
}

/** Editor sidepane items (components/Editor/EditorSidepane.jsx) open a config panel by label. */
export async function clickSidepaneItem(popup, label) {
  await popup.getByText(label, { exact: true }).click();
}

/** Fills the first visible text input/textarea in the current config panel. */
export async function fillActiveConfigField(popup, value) {
  const field = popup.locator('.config-panel textarea, .config-panel input[type="text"]').first();
  await field.fill(value);
}
