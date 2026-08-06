import { fileURLToPath } from 'url';
import path from 'path';
import { test, expect, demoPause, dashboardTile, appWideToggle, toggleAppWideSwitchAndRestore } from '../../fixtures/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The app's own placeholder image (imported by DiscountList.jsx itself for
// unrelated preview art) - reused here purely because it's a real image
// file already checked into the repo, not because it's semantically
// relevant to a favicon.
const TSHIRT_IMAGE_PATH = path.resolve(__dirname, '../../../web/frontend/apps/inactive-tab-message/tshirt.png');

const TEST_MESSAGE = 'Create a new Inactive Tab Message-test';

/** datetime-local wants "YYYY-MM-DDTHH:mm" in local time, not a full ISO string. */
function toDateTimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Ticket: Inactive Tab Message App - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/311)
//
// Suite 1 - Configure Settings. Unlike the other 5 apps, there is no
// standalone popup editor here - DiscountList.jsx (this app's own settings
// form) defaults its `selectedTab` state directly to "Settings", so landing
// on the app IS landing on the settings form already; no separate
// create/edit navigation step is needed or possible.
test('Inactive Tab Message: configure settings end to end', async ({ page, app }) => {
  // Both the tile's "Create" and "Manage" buttons resolve to this same page
  // (DashboardHome.jsx's settingsRoute/manageRoute for this widget both
  // point at /inactive-tab-message) - a regex matching either throws a
  // strict-mode violation since both are present at once, so pick one.
  await dashboardTile(app, 'Inactive Tab Message').getByRole('button', { name: 'Manage', exact: true }).click();

  // Lands directly on Settings (no popup/new tab) - this description line
  // from the "Message" card is unique on the page (unlike the bare word
  // "Message", which also appears inside the app's own "Inactive Tab
  // Message" heading), so it's a stable signal that we're on the real
  // settings form rather than mid-navigation.
  await expect(app.getByText("Shown in the browser tab's title when a visitor switches away from your store.")).toBeVisible({ timeout: 15_000 });
  await demoPause(app);

  // The Active/Inactive pill here (title="Click to disable"/"Click to
  // enable") is the exact same shared app-wide ToggelSwitch.jsx component
  // (appId="inactive_tab") that the other 5 apps' tickets test, confirmed
  // via InactiveTabMessageForm.jsx - not a separate custom control, despite
  // this app having no per-item list to otherwise distinguish it from.
  await toggleAppWideSwitchAndRestore(app);
  await demoPause(app);

  // Unlike the other 5 apps' suites, this app's own Suite 2 (storefront
  // behavior) needs the real extension (extensions/bogo-shopify-app/assets/
  // inactiveTab.js) actually enabled to run its visibilitychange listener
  // at all - restoring to whatever pre-test state toggleAppWideSwitchAndRestore
  // left it in isn't enough if that was Inactive, so explicitly finish
  // Active here regardless of where it started.
  const toggle = appWideToggle(app);
  if ((await toggle.getAttribute('title')) === 'Click to enable') {
    await toggle.click();
    await expect(toggle.getByText('Active', { exact: true })).toBeVisible({ timeout: 15_000 });
  }

  // --- Message card ---
  const messageInput = app.getByPlaceholder('Enter message to display when tab is inactive');
  await messageInput.fill(TEST_MESSAGE);
  await demoPause(app);

  // --- Favicon card ---
  await app.getByText('Use Emoji', { exact: true }).click();
  await demoPause(app);
  // Third-party emoji-picker-react widget - located via its own documented
  // search input (aria-label "Type to search for an emoji") rather than
  // guessing at an unlabeled grid position, so the exact emoji picked is
  // deterministic instead of whatever happens to render first.
  await app.getByText('Choose an emoji', { exact: false }).click();
  const emojiSearch = app.getByRole('textbox', { name: 'Type to search for an emoji' });
  await expect(emojiSearch).toBeVisible({ timeout: 10_000 });
  await emojiSearch.fill('grinning');
  await app.locator('button[data-unified]').first().click();
  // Selecting an emoji swaps the picker's placeholder for a "Change"/remove
  // control pair - confirms the pick registered.
  await expect(app.getByRole('button', { name: 'Change' })).toBeVisible({ timeout: 10_000 });
  await demoPause(app);

  await app.getByText('Upload Image', { exact: true }).click();
  await demoPause(app);
  // setInputFiles targets the hidden <input type="file"> directly - no OS
  // file-picker dialog to drive, and it works whether or not this switched
  // straight back from a still-uploaded image, since a newly set `image`
  // File always wins over any prior `imageUrl` in DiscountList.jsx's own
  // preview ternary.
  await app.locator('input[type="file"]').setInputFiles(TSHIRT_IMAGE_PATH);
  await expect(app.locator('img[alt="Preview"]')).toBeVisible({ timeout: 10_000 });
  await demoPause(app);

  // --- Schedule card --- (Form.Group controlId pairs each Form.Label to
  // its Form.Control automatically, so getByLabel resolves directly.)
  const today = new Date();
  const inSevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  await app.getByLabel('Start Date & Time').fill(toDateTimeLocal(today));
  await app.getByLabel('End Date & Time').fill(toDateTimeLocal(inSevenDays));
  await demoPause(app);

  // --- Save ---
  await app.getByRole('button', { name: /save settings/i }).click();
  await expect(app.getByText('Settings saved successfully!', { exact: true })).toBeVisible({ timeout: 15_000 });
});
