import {
  test,
  expect,
  demoPause,
  dashboardTile,
  openEditorPopup,
  saveEditor,
  waitForSaveAndClose,
  clickSidepaneItem,
  addProductToPool,
  addProductToPoolBySearch,
  selectConfigOption,
  fillConfigInput,
  fillColorInput,
  fillActiveConfigField,
  setEditorTitle,
  toggleEditorEnabled,
  toggleConfigRow,
  selectCountdownThemeByPosition,
  addProductSpec,
  appendToDescription,
  selectDeviceView,
  refreshAndVerifyInList,
  toggleAppWideSwitchAndRestore,
} from '../../fixtures/app.js';

const BOGO_TEST_TITLE = 'Create a new BOGO Bundle-test';

/** datetime-local wants "YYYY-MM-DDTHH:mm" in local time, not a full ISO string. */
function toDateTimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Ticket: BOGO Bundle - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/307)
//
// Suite 1 - Create BOGO Bundle, Suite 2 - Customize Editor. Both run as one
// continuous test since Suite 2 explicitly continues in the same editor
// session Suite 1 opens, ending in a single Save.
test('BOGO: create + customize full editor workflow', async ({ page, app }) => {
  // --- Suite 1: Create BOGO Bundle ---
  // Step 2 (added once ticket #307 was updated to require this): the
  // app-wide Active/Inactive switch (ToggelSwitch.jsx, appId="buy_one_get_one")
  // only renders on this app's own page, reached via "Manage" - not on the
  // dashboard tile itself - so this now opens the editor via that page's
  // own "Create New BOGO" button instead of the dashboard tile's "Create"
  // button used previously.
  await dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /manage/i }).click();
  await toggleAppWideSwitchAndRestore(app);

  const popup = await openEditorPopup(page, () => app.getByRole('button', { name: 'Create New BOGO' }).click());
  await expect(popup.locator('input.editable-title')).toBeVisible({ timeout: 15_000 });

  await setEditorTitle(popup, BOGO_TEST_TITLE);
  await demoPause(popup);

  // Toggle Discount to Inactive (header enable switch defaults to on/enabled).
  await toggleEditorEnabled(popup);
  await demoPause(popup);

  // Polaroid Instant Camera/MiniDV Camcorder are used by bundle-discounts-e2e
  // (and products get permanently tagged busybuddybundles - excluded from
  // every bundle-type picker across every app - once used in any bundle-type
  // discount, per the non-e2e volume-discounts/mix-and-match suites' own
  // comments), so this uses disjoint, otherwise-untouched catalog products
  // instead of overlapping with that test's pair.
  await clickSidepaneItem(popup, 'Customer Buys (X)');
  await addProductToPool(popup, 'Original iPod');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Customer Gets (Y)');
  // "ipod" matches iPod Mini/Classic/Nano in Y's available pool (Original
  // iPod is already selected for X and excluded from it) - search it and
  // click iPod Mini specifically rather than assuming the pool is unambiguous.
  await addProductToPoolBySearch(popup, 'ipod', 'iPod Mini');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Discount Settings');
  await selectConfigOption(popup, 'Discount Type', 'Percentage Discount');
  await fillConfigInput(popup, 'Discount Percentage', '10');
  await demoPause(popup);
  await selectConfigOption(popup, 'Discount Type', 'Fixed Amount');
  await fillConfigInput(popup, 'Discount Amount ($)', '15');
  await demoPause(popup);
  await selectConfigOption(popup, 'Discount Type', 'Free Gift (100% Off)');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Priority');
  await fillConfigInput(popup, 'Bundle Priority', '2');
  await demoPause(popup);

  await popup.getByText('Content', { exact: true }).click();
  await demoPause(popup);
  await clickSidepaneItem(popup, 'Message Text');
  await fillActiveConfigField(popup, 'BOGO Buy More & Save More!\u{1F525}');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Emoji & Icons');
  await selectConfigOption(popup, 'Emoji Position', 'Both Sides');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Countdown Timer');
  await toggleConfigRow(popup, 'Show Countdown Timer');
  await expect(popup.getByText(/timer theme/i)).toBeVisible();
  await selectCountdownThemeByPosition(popup, 4);
  await demoPause(popup);

  // --- Suite 2: Customize Editor (same editor session, continues here) ---
  await clickSidepaneItem(popup, 'Add to Cart Button');
  await fillColorInput(popup, 'Background Color', '#FF0000');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Skip Offer Button');
  await fillColorInput(popup, 'Background Color', '#1E90FF');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Product Info');
  await appendToDescription(popup, '! :)');
  await addProductSpec(popup, 'label', 'value');
  await demoPause(popup);

  await popup.getByText('Appearance', { exact: true }).click();
  await demoPause(popup);
  await clickSidepaneItem(popup, 'Primary Colors');
  await fillColorInput(popup, 'Primary Text Color', '#000000');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Secondary Colors');
  await fillColorInput(popup, 'Secondary Background', '#D3D3D3');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Margins');
  await fillConfigInput(popup, 'Top Margin', '30');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Card Settings');
  await fillConfigInput(popup, 'Corner Radius', '5');
  await demoPause(popup);

  await popup.getByText('Schedule', { exact: true }).click();
  await demoPause(popup);
  const today = new Date();
  const inSevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  await clickSidepaneItem(popup, 'Start Date');
  await fillConfigInput(popup, 'Start Date & Time', toDateTimeLocal(today));
  await demoPause(popup);
  await clickSidepaneItem(popup, 'End Date');
  await fillConfigInput(popup, 'End Date & Time', toDateTimeLocal(inSevenDays));
  await demoPause(popup);

  // Views: Mobile, then Desktop.
  await selectDeviceView(popup, 'Mobile');
  await demoPause(popup);
  await selectDeviceView(popup, 'Desktop');
  await demoPause(popup);

  // Save and verify.
  await saveEditor(popup);
  await waitForSaveAndClose(popup);

  await refreshAndVerifyInList(app, 'Discounts', new RegExp(BOGO_TEST_TITLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
});
