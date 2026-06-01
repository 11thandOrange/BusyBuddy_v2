/**
 * Shared helpers for BusyBuddy_v2 Playwright smoke tests.
 *
 * Two responsibilities:
 * 1. setupMocks(page, apiOverrides) — intercept Shopify App Bridge module
 *    loads and all /api/* calls so the app renders without a live Shopify store.
 * 2. screenshotPage(page, route, name) — navigate, wait for idle, screenshot.
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to repo-root .smoke-results/ directory. */
export const SMOKE_RESULTS_DIR = path.resolve(__dirname, '../../../../.smoke-results');

/**
 * Minimal ESM stub returned for every @shopify/app-bridge-react module request.
 * Exports every symbol the app may import from the package so nothing crashes
 * when running outside a Shopify iframe.
 */
const APP_BRIDGE_STUB = `
export const NavMenu          = () => null;
export const TitleBar         = () => null;
export const Loading          = () => null;
export const Toast            = () => null;
export const Modal            = ({ children }) => children ?? null;
export const Provider         = ({ children }) => children ?? null;
export const useAppBridge     = () => ({});
export const useAuthenticatedFetch = () => (url, opts) => fetch(url, opts);
export const useNavigate      = () => () => {};
export default {};
`;

/**
 * Wire up all network mocks for a Playwright page.
 * Must be called before page.goto().
 *
 * @param {import('@playwright/test').Page} page
 * @param {Record<string, unknown>} apiOverrides
 *   Map of URL substring → response body to override the default
 *   { success: true, data: [] }.  E.g. { '/bundles': { success: true, data: [{ name: 'Test' }] } }
 */
export async function setupMocks(page, apiOverrides = {}) {
  // ── Shopify App Bridge stub ──────────────────────────────────────────────
  // Vite pre-bundles @shopify/app-bridge-react to a path like:
  //   /node_modules/.vite/deps/@shopify_app-bridge-react.js
  // Intercept every request whose URL contains "app-bridge-react" and return
  // the stub so the app renders without a live embedded context.
  await page.route('**app-bridge-react**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript; charset=utf-8',
      body: APP_BRIDGE_STUB,
    })
  );

  // ── API mock ─────────────────────────────────────────────────────────────
  // Return a safe default for every /api/* call.  Specific tests can pass
  // apiOverrides to return meaningful data for the feature under test.
  await page.route('/api/**', route => {
    const url = route.request().url();
    const match = Object.entries(apiOverrides).find(([pattern]) =>
      url.includes(pattern)
    );
    const body = match ? match[1] : { success: true, data: [] };
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  // ── Location mock ─────────────────────────────────────────────────────────
  // Many components read window.location.search for the shop param.
  await page.addInitScript(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: Object.assign(Object.create(window.location), {
        search: '?shop=test-shop.myshopify.com',
      }),
    });
  });
}

/**
 * Navigate to a route, wait for the page to reach network-idle, take a
 * full-page screenshot and save it to SMOKE_RESULTS_DIR/<name>.png.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} route    e.g. '/bundles'
 * @param {string} name     filename without extension, e.g. 'ac-1-bundles-list-renders'
 * @returns {Promise<string>} Absolute path of the saved screenshot.
 */
export async function screenshotPage(page, route, name) {
  await page.goto(route, { waitUntil: 'networkidle', timeout: 20_000 });
  // Allow React one render cycle after data mocks settle
  await page.waitForTimeout(600);

  fs.mkdirSync(SMOKE_RESULTS_DIR, { recursive: true });
  const screenshotPath = path.join(SMOKE_RESULTS_DIR, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}
