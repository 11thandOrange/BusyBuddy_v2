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
 * BusyBuddy runs embedded inside admin.shopify.com's app-iframe. This
 * fixture navigates to the app and hands back a locator root scoped to
 * wherever the app actually rendered (iframe when embedded, top-level page
 * when loaded standalone) so every script can use the same `app.getByText`
 * / `app.locator` calls regardless of which context it ends up in.
 */
export const test = base.extend({
  app: async ({ page }, use) => {
    if (!ADMIN_URL) {
      throw new Error('BUSYBUDDY_ADMIN_URL is not set - see busybuddy-demos/README.md');
    }
    await page.goto(ADMIN_URL);
    const iframe = page.frameLocator('iframe[name="app-iframe"]');
    const embedded = (await page.locator('iframe[name="app-iframe"]').count()) > 0;
    await use(embedded ? iframe : page);
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
