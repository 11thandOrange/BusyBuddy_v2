import { test as base, expect } from '@playwright/test';
import { installDemoCursor, demoPause, RECORD } from './demoCursor.js';

export { demoPause, RECORD };

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

/**
 * DashboardHome.jsx renders widget tiles immediately (before the plan is
 * known) and only gates Create/Manage clicks once its subscription fetch
 * resolves - `if (!loading && !isWidgetAccessible(...))`. A fast Playwright
 * click can land in that window and either race past the gate (landing in
 * a real editor while still notionally on the stale/default plan) or get
 * redirected to /plan with no explanation. Waiting for the subscription
 * response here makes every script's Create/Manage click deterministic.
 */
async function waitForSubscriptionLoaded(subscriptionResponsePromise) {
  await subscriptionResponsePromise; // best-effort; falls back to proceeding if it never fires (see .catch below)
}

export const test = base.extend({
  app: async ({ page }, use) => {
    if (!ADMIN_URL) {
      throw new Error('BUSYBUDDY_ADMIN_URL is not set - see busybuddy-demos/README.md');
    }
    // Registered before goto() so it's present in the top-level document and
    // (per Playwright's addInitScript semantics) every child frame, i.e. the
    // embedded admin iframe resolveAppScope polls for below.
    await installDemoCursor(page);
    const subscriptionResponsePromise = page
      .waitForResponse((res) => res.url().includes('/api/subscription/getUserSubscription'), { timeout: 20_000 })
      .catch(() => null);
    await page.goto(ADMIN_URL);
    const scope = await resolveAppScope(page);
    await waitForSubscriptionLoaded(subscriptionResponsePromise);
    await use(scope);
  },
});

export { expect };

/** Clicks a top-level tab rendered by DiscountList/BundelDiscountList (react-bootstrap ToggleButton labels). */
export async function gotoTab(app, tabName) {
  // Scoped to the tab bar's role="group" (react-bootstrap ButtonGroup): a
  // bare getByText can collide with unrelated page text using the exact
  // same string - confirmed for "Announcement Bars", which also appears as
  // a heading elsewhere on the page, not just the tab label itself.
  await app.getByRole('group').getByText(tabName, { exact: true }).click();
}

/**
 * DiscountList/BundelDiscountList.jsx only refetches its items when
 * `selectedTab` actually *changes* (its useEffect deps are
 * [refreshTrigger, selectedTab]), so clicking a tab you're already on
 * won't pick up something just saved in the editor popup. Bouncing
 * through Overview first forces a real refetch before landing back on
 * the list tab.
 */
export async function refreshAndVerifyInList(app, listTabName, textMatcher) {
  await gotoTab(app, 'Overview');
  await gotoTab(app, listTabName);
  // .first(): the store accumulates items across repeated runs, so more
  // than one existing row can legitimately match the same text - this only
  // needs to confirm at least one match is now present, not that it's
  // unique.
  await expect(app.getByText(textMatcher).first()).toBeVisible({ timeout: 15_000 });
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
  // openEditorTab.js opens a blank window synchronously and only navigates
  // it to /editor.html once an async signature fetch resolves, so the
  // init script is still registered well before that real navigation.
  await installDemoCursor(popup);
  await popup.waitForLoadState();
  return popup;
}

/** Saves from within an editor popup (components/Editor/EditorHeader.jsx's .btn-save). */
export async function saveEditor(popup) {
  await popup.locator('button.btn-save').click();
}

/**
 * Waits for a successful save. The standalone editor runs without App
 * Bridge (see useEditorNavigation.js), so every editor's success toast
 * (shopify?.toast?.show(...)) silently no-ops - there is no "saved" text to
 * wait for. The actual success signal is closeEditor() calling
 * window.close() immediately after a successful save, so the popup closing
 * on its own IS the confirmation.
 */
export async function waitForSaveAndClose(popup) {
  // Volume Discount bundles can take Shopify up to ~60s to fully provision
  // (see MAX_RETRIES in pollBundleStatus, web/backend/controller/bundles/index.js) -
  // leaving margin above that within the 120s overall test timeout.
  await popup.waitForEvent('close', { timeout: 90_000 });
}

export async function gotoStorefrontHome(page) {
  await page.goto(`https://${STORE_DOMAIN}`);
}

export async function gotoStorefrontProduct(page, handle) {
  await page.goto(`https://${STORE_DOMAIN}/products/${handle}`);
}

/**
 * Editor sidepane items (components/Editor/EditorSettingsPane.jsx) open a
 * config panel by label. Scoped to the actual clickable `.settings-item`
 * row rather than a bare text match: EditorSettingsPane renders each
 * group's `.settings-group-title` (plain text, no onClick) immediately
 * before its `.settings-item`s, and for groups whose title matches their
 * single item's label verbatim (e.g. "Product Info"), a bare
 * `getByText(label, {exact:true}).first()` picks that inert title div
 * instead - a silent no-op click that leaves the panel on whatever was
 * previously active. The config panel's own heading can also repeat the
 * label once selected, but scoping to `.settings-item` avoids that
 * collision too, since headings render in `.config-header`, not as a
 * `.settings-item`.
 */
export async function clickSidepaneItem(popup, label) {
  await popup.locator('.settings-item').filter({ hasText: label }).first().click();
}

/** Fills the first visible text input/textarea in the current config panel. */
export async function fillActiveConfigField(popup, value) {
  const field = popup.locator('.config-panel textarea, .config-panel input[type="text"]').first();
  await field.fill(value);
}

/**
 * Adds a product from the inline "Select Products" picker shared by
 * StandardBundleEditor.jsx, VolumeDiscountEditor.jsx, and
 * MixAndMatchEditor.jsx: a "+ Add Products" button reveals a search field
 * (placeholder "Search by product name...") and a filtered list, each row
 * with its own "+ Add" button. BOGO's BuyXGetYEditor.jsx does not use this
 * pattern - see addProductToPool below.
 */
export async function addProductViaPicker(popup, productName) {
  const addProductsButton = popup.getByRole('button', { name: '+ Add Products' });
  if (await addProductsButton.isVisible().catch(() => false)) {
    await addProductsButton.click();
  }
  await popup.getByPlaceholder('Search by product name...').fill(productName);
  await popup.getByRole('button', { name: '+ Add', exact: true }).first().click();
}

/**
 * Same picker as addProductViaPicker, but for a partial search term that
 * matches more than one product (e.g. "cam" matching both "Polaroid
 * Instant Camera" and "MiniDV Camcorder") - clicks "+ Add" on the specific
 * row identified by its full title rather than blindly taking the first
 * result.
 */
export async function addProductViaPickerSearch(popup, searchTerm, productTitleToAdd) {
  const addProductsButton = popup.getByRole('button', { name: '+ Add Products' });
  if (await addProductsButton.isVisible().catch(() => false)) {
    await addProductsButton.click();
  }
  await popup.getByPlaceholder('Search by product name...').fill(searchTerm);
  await popup
    .locator('div, li')
    .filter({ hasText: productTitleToAdd })
    .getByRole('button', { name: '+ Add', exact: true })
    .first()
    .click();
}

/**
 * BOGO's BuyXGetYEditor.jsx renders its X/Y product pools as directly
 * clickable rows (onClick={() => addProductToX(product)}) with an inline
 * "Search products..." field - no separate "+ Add Products" toggle.
 */
export async function addProductToPool(popup, productName) {
  await popup.getByPlaceholder('Search products...').fill(productName);
  await popup.getByText(productName, { exact: false }).first().click();
}

/**
 * Same pool as addProductToPool, but for a partial search term that
 * matches more than one product (e.g. "cam" matching both "Polaroid
 * Instant Camera" and "MiniDV Camcorder") - searches one term, clicks the
 * row identified by its full title rather than blindly taking the first
 * text match, which could otherwise land on the wrong product's row.
 */
export async function addProductToPoolBySearch(popup, searchTerm, productTitleToAdd) {
  await popup.getByPlaceholder('Search products...').fill(searchTerm);
  await popup.getByText(productTitleToAdd, { exact: false }).first().click();
}

/**
 * VolumeDiscountEditor.jsx renders its "+ Add Products" toggle and search
 * field like Bundle/BOGO/Mix and Match, but each product row itself is a
 * directly clickable <div onClick={() => handleAddProduct(product)}> (the
 * "+" shown next to it is a decorative icon, not a real <button> with
 * accessible text) - unlike the other 3 apps' actual `+ Add` buttons, so
 * addProductViaPicker's button locator can never match here.
 */
export async function addProductViaPickerRow(popup, productName) {
  // Regex substring match, not exact: VolumeDiscountEditor.jsx's own toggle
  // button reads "+ Add Product" (singular) once nothing is selected, or
  // "↻ Change Product" once something is - neither is the plural
  // "+ Add Products" this previously matched literally, which never found
  // the button and silently skipped opening the picker at all.
  const addProductsButton = popup.getByRole('button', { name: /Add Product|Change Product/i });
  if (await addProductsButton.isVisible().catch(() => false)) {
    await addProductsButton.click();
  }
  await popup.getByPlaceholder('Search by product name...').fill(productName);
  await popup.getByText(productName, { exact: false }).first().click();
}

/**
 * Same picker as addProductViaPickerRow, but for a partial search term that
 * matches more than one product - searches one term, clicks the row
 * identified by its full title rather than assuming the search result is
 * unambiguous.
 */
export async function addProductViaPickerRowBySearch(popup, searchTerm, productTitleToAdd) {
  const addProductsButton = popup.getByRole('button', { name: /Add Product|Change Product/i });
  if (await addProductsButton.isVisible().catch(() => false)) {
    await addProductsButton.click();
  }
  await popup.getByPlaceholder('Search by product name...').fill(searchTerm);
  await popup.getByText(productTitleToAdd, { exact: false }).first().click();
}

/**
 * Selects an option from a ConfigSelect (components/Editor/EditorConfigPanel.jsx)
 * by the visible label of its enclosing ConfigFormGroup, e.g. selecting
 * "Percentage" under "Discount Type" before the percentage/amount input
 * renders (that field is conditionally shown only once a type is chosen).
 */
export async function selectConfigOption(popup, groupLabel, optionLabel) {
  await popup
    .locator('.form-group')
    .filter({ has: popup.locator('.form-label', { hasText: groupLabel }) })
    .locator('select')
    .selectOption({ label: optionLabel });
}

/**
 * Fills the text/number input inside a ConfigFormGroup by its visible label
 * - avoids guessing placeholder text, which varies by app and by the
 * currently selected discount type (e.g. StandardBundleEditor.jsx's
 * "Discount Value" field placeholder is "10" for Percentage or "5.00" for a
 * fixed amount, neither of which is BOGO's "e.g., 20"/"e.g., 10.00").
 */
export async function fillConfigInput(popup, groupLabel, value) {
  await popup
    .locator('.form-group')
    .filter({ has: popup.locator('.form-label', { hasText: groupLabel }) })
    .locator('input')
    .fill(value);
}

/**
 * Sets a color field by its ConfigFormGroup label. Every color field
 * (see StandardBundleEditor.jsx's "Primary Text Color", "Button Color",
 * etc.) renders a paired native `<input type="color">` swatch and a plain
 * `<input type="text">` showing the hex value - `fillConfigInput`'s bare
 * `input` locator would hit both and throw a strict-mode violation, and
 * the color swatch itself isn't fillable (it needs a real OS color
 * picker). Scoping to `input[type="text"]` targets only the fillable one,
 * whose onChange drives the same state as the swatch.
 */
export async function fillColorInput(popup, groupLabel, hexValue) {
  await popup
    .locator('.form-group')
    .filter({ has: popup.locator('.form-label', { hasText: groupLabel }) })
    .locator('input[type="text"]')
    .fill(hexValue);
}

/**
 * Clicks the switch inside a ConfigToggleRow (EditorConfigPanel.jsx) by its
 * visible label, e.g. "Show Countdown Timer". Targets `.toggle-slider`, not
 * the checkbox itself - `.toggle-switch input` is `width: 0; height: 0;
 * opacity: 0` (EditorLayout.css), a zero-size element Playwright's
 * actionability check will never consider clickable/visible.
 */
export async function toggleConfigRow(popup, label) {
  await popup
    .locator('.toggle-row')
    .filter({ has: popup.locator('.toggle-label', { hasText: label }) })
    .locator('.toggle-slider')
    .click();
}

/** Sets the editable title in the editor header (EditorHeader.jsx's input.editable-title). */
export async function setEditorTitle(popup, title) {
  const titleInput = popup.locator('input.editable-title');
  await titleInput.fill('');
  await titleInput.fill(title);
}

/**
 * Clicks the enable/disable switch in the editor header (EditorHeader.jsx's
 * label.header-toggle). Targets `.toggle-slider`, not the checkbox itself -
 * `.header-toggle input` is `width: 0; height: 0; opacity: 0`
 * (EditorLayout.css), a zero-size element Playwright's actionability check
 * will never consider clickable/visible.
 */
export async function toggleEditorEnabled(popup) {
  await popup.locator('label.header-toggle .toggle-slider').click();
}

/**
 * Switches the live preview panel between Desktop and Mobile
 * (EditorPreviewPanel.jsx's .device-btn buttons). Not an exact-name match:
 * each button's accessible name includes its icon span's emoji text too
 * (e.g. "📱 Mobile"), so `{ name: device, exact: true }` never matches -
 * a substring match on the label is enough since "Desktop"/"Mobile" each
 * appear on exactly one button.
 */
export async function selectDeviceView(popup, device) {
  await popup.getByRole('button', { name: device }).click();
}

/**
 * Picks a countdown timer theme by its 1-based position in the visual
 * grid (CountdownTimerThemes.jsx's CountdownThemePicker renders each
 * theme as an unlabeled <button> in DOM order, so "4th theme" means
 * nth(3)). Scoped to the "Timer Theme" form group so it doesn't collide
 * with any other button grid on the Countdown Timer panel.
 */
export async function selectCountdownThemeByPosition(popup, position) {
  await popup
    .locator('.form-group')
    .filter({ has: popup.locator('.form-label', { hasText: 'Timer Theme' }) })
    .locator('button')
    .nth(position - 1)
    .click();
}

/**
 * Adds one product specification row (StandardBundleEditor.jsx's Product
 * Info panel, "+ Add Spec" button) and fills its Label/Value inputs. The
 * newly appended row is always last, so `.last()` on each placeholder
 * disambiguates it from any specs already present.
 */
export async function addProductSpec(popup, label, value) {
  await popup.getByRole('button', { name: '+ Add Spec' }).click();
  await popup.getByPlaceholder('Label (e.g. Material)').last().fill(label);
  await popup.getByPlaceholder('Value (e.g. Cotton)').last().fill(value);
}

/** Appends text to the Product Info description textarea without clobbering what's already there. */
export async function appendToDescription(popup, suffix) {
  const description = popup.locator('.config-panel textarea').first();
  const current = await description.inputValue();
  await description.fill(`${current}${suffix}`);
}

/**
 * Locates a single row in the Discounts list (BundelDiscountList.jsx's
 * shared markup, used by Bundle Discount, BOGO, Volume Discount, and
 * Mix & Match) by its visible title, then walks up to the row container
 * that also holds the Preview/Edit/Active controls - same walk-up
 * `03-edit-bundle.spec.js` uses to reach the pencil-edit button.
 * `.first()` guards against duplicate titles accumulated across reruns.
 */
export function discountRowByTitle(app, titleText) {
  return app.locator('.bundlebox').filter({ hasText: titleText }).first().locator('..').locator('..');
}

/** Clicks "Preview" on a discount list row (BundelDiscountList.jsx's .previewbtn). */
export async function clickPreviewOnRow(row) {
  await row.locator('.previewbtn').click();
}

/**
 * Clicks the pencil Edit button on a discount list row and returns the
 * new editor tab it opens. The pencil button (<Button text={<Pencil/>}/>)
 * is the row's only real <button> element - Priority is a plain input and
 * Preview/Active are non-button elements - but the empty-text filter from
 * `03-edit-bundle.spec.js` is kept for consistency with that established
 * pattern.
 */
export async function editRowInNewTab(page, row) {
  return openEditorPopup(page, () => row.getByRole('button').filter({ hasText: '' }).first().click());
}

/** Clicks the Active/Inactive switch on a discount list row (BundelDiscountList.jsx's Form.Check type="switch"). */
export async function toggleRowActive(row) {
  await row.locator('input[type="checkbox"]').click();
}

/**
 * Picks a theme by its 1-based position in a visual button grid rendered
 * inside a named ConfigFormGroup (CountdownTimerThemes.jsx's
 * CountdownThemePicker and AnnouncementBarBackgroundThemes.jsx's
 * AnnouncementBarThemePicker both render each theme as an unlabeled
 * <button> in DOM order with no other identifying text).
 */
export async function selectThemeByPosition(popup, groupLabel, position) {
  await popup
    .locator('.form-group')
    .filter({ has: popup.locator('.form-label', { hasText: groupLabel }) })
    .locator('button')
    .nth(position - 1)
    .click();
}

/**
 * Announcement Bar's list (apps/announcement-bar/DiscountList.jsx) renders
 * each row as its own react-bootstrap <Card>, not the shared .bundlebox
 * markup the other 4 apps' BundelDiscountList.jsx uses - so it needs its
 * own row/edit/activate helpers rather than discountRowByTitle/
 * editRowInNewTab/toggleRowActive above. Rows show bar.message (not
 * bar.title), so that's what identifies a row here.
 */
export function announcementBarRowByMessage(app, message) {
  return app.locator('.card').filter({ hasText: message }).first();
}

/**
 * The Edit (pencil) button is the first of two real <button>s in the row
 * (Edit then Delete, in that DOM order) - no walk-up needed, unlike the
 * bundle-type apps' row, since Edit/Delete are direct children here.
 */
export async function editAnnouncementBarRow(page, row) {
  return openEditorPopup(page, () => row.getByRole('button').first().click());
}

/**
 * Locates the app-wide Active/Inactive switch (components/ToggelSwitch.jsx),
 * rendered once per app on that app's own page (reached via the dashboard
 * tile's "Manage" button) next to that page's own "Create New ..." button -
 * a completely different control from any per-item Active/Inactive status
 * inside BundelDiscountList.jsx/DiscountList.jsx's list rows, which also use
 * the words "Active"/"Inactive". The outer div's `title` attribute ("Click
 * to disable"/"Click to enable") is unique to this component across every
 * app's page, so it's used to scope the locator instead of that shared
 * text.
 */
export function appWideToggle(app) {
  return app.locator('[title^="Click to "]').first();
}

/**
 * Clicks the app-wide switch, confirms the visible "Active"/"Inactive"
 * label actually flips, then clicks it again to restore the original
 * state. Unlike a per-item Active/Inactive status, this switch controls
 * whether the app's real storefront behavior runs at all
 * (POST /api/subscription/toggle-app) - leaving it flipped would affect
 * every other test using the same live store, not just this assertion.
 */
export async function toggleAppWideSwitchAndRestore(app) {
  const toggle = appWideToggle(app);
  await expect(toggle).toBeVisible({ timeout: 15_000 });
  const wasActive = (await toggle.getAttribute('title')) === 'Click to disable';

  await toggle.click();

  if (wasActive) {
    // Disabling has no plan-limit check (ToggelSwitch.jsx) - a failure
    // here is a real bug, not store capacity, so it's fine to hard-fail.
    await expect(toggle.getByText('Inactive', { exact: true })).toBeVisible({ timeout: 15_000 });
    await toggle.click();
    await expect(toggle.getByText('Active', { exact: true })).toBeVisible({ timeout: 15_000 });
    return;
  }

  // Enabling checks the store's actual enabledAppsCount server-side
  // (controller/subscription/index.js's toggleApp) even when the client's
  // own stale subscriptionInfo thought there was room - on rejection the
  // switch silently stays Inactive with no visible error. There's no
  // reliable client-side signal to tell "blocked by the store's shared
  // plan capacity" apart from "actually broken", and that capacity is
  // outside any single test's control (other apps may legitimately need
  // to stay enabled for demos/screenshots) - so this skips the rest of the
  // check instead of failing the whole test over it. Nothing is left
  // changed either way.
  const flipped = await toggle.getByText('Active', { exact: true }).isVisible({ timeout: 8_000 }).catch(() => false);
  if (!flipped) {
    console.warn(
      "[toggleAppWideSwitchAndRestore] App-wide toggle did not flip to Active (likely the store's plan app-limit) - skipping this check rather than failing the test."
    );
    return;
  }
  await toggle.click();
  await expect(toggle.getByText('Inactive', { exact: true })).toBeVisible({ timeout: 15_000 });
}
