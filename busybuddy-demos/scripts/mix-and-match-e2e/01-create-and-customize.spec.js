import {
  test,
  expect,
  demoPause,
  dashboardTile,
  openEditorPopup,
  saveEditor,
  waitForSaveAndClose,
  clickSidepaneItem,
  addProductViaPicker,
  addProductViaPickerSearch,
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

// MixAndMatchEditor.jsx wires the header's editable title to
// bundleInternalName, not bundleTitle - unlike every other app's editor,
// where the header IS the title. bundleTitle (what the Discounts list
// actually displays and what DiscountPreviewModal shows as its heading)
// only gets set via the Content tab's "Primary Message" field. So the
// header text and the list/search-by text are two different strings here.
const HEADER_TITLE = 'Create a new Mix & Match Discount-test';
const PRIMARY_MESSAGE = 'Mix & Match To Save More!\u{1F525}';

/** datetime-local wants "YYYY-MM-DDTHH:mm" in local time, not a full ISO string. */
function toDateTimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Ticket: Mix & Match Discount Bundle - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/308)
//
// Suite 1 - Create Mix & Match Discount Bundle, Suite 2 - Customize Editor.
// Both run as one continuous test since Suite 2 explicitly continues in the
// same editor session Suite 1 opens, ending in a single Save.
test('Mix & Match: create + customize full editor workflow', async ({ page, app }) => {
  // --- Suite 1: Create Mix & Match Discount Bundle ---
  // Step 2 (added once ticket #308 was updated to require this): the
  // app-wide Active/Inactive switch (ToggelSwitch.jsx, appId="mix_match")
  // only renders on this app's own page, reached via "Manage" - not on the
  // dashboard tile itself - so this now opens the editor via that page's
  // own "Create New Mix & Match" button instead of the dashboard tile's
  // "Create" button used previously.
  await dashboardTile(app, 'Mix & Match').getByRole('button', { name: /manage/i }).click();
  await toggleAppWideSwitchAndRestore(app);

  const popup = await openEditorPopup(page, () => app.getByRole('button', { name: 'Create New Mix & Match' }).click());
  await expect(popup.locator('input.editable-title')).toBeVisible({ timeout: 15_000 });

  await setEditorTitle(popup, HEADER_TITLE);
  await demoPause(popup);

  // Toggle Discount to Inactive (header enable switch defaults to on/enabled).
  await toggleEditorEnabled(popup);
  await demoPause(popup);

  // Polaroid/MiniDV/Flip Video Camera/CRT Television are all used by the
  // other 3 bundle-type e2e suites (and products get permanently tagged
  // busybuddybundles - excluded from every bundle-type picker across every
  // app - once used in any bundle-type discount, per the non-e2e
  // volume-discounts/mix-and-match suites' own comments), so this uses 4
  // disjoint, otherwise-untouched catalog products instead.
  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPicker(popup, 'Vintage Macintosh Laptop');
  await demoPause(popup);
  await addProductViaPicker(popup, 'iMac G3');
  await demoPause(popup);
  await addProductViaPicker(popup, 'Nokia 3310');
  await demoPause(popup);
  // "motorola" matches only "Motorola Razr" in the seeded catalog.
  await addProductViaPickerSearch(popup, 'motorola', 'Motorola Razr');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Discount Settings');
  await selectConfigOption(popup, 'Discount Type', 'Percentage Discount');
  await fillConfigInput(popup, 'Default Discount Percentage', '10');
  await demoPause(popup);
  await selectConfigOption(popup, 'Discount Type', 'Fixed Amount');
  await fillConfigInput(popup, 'Default Discount Amount ($)', '15');
  await demoPause(popup);

  // Tier Settings: 4 visible tiers (Buy 2/3/4/5), each incremented by 5
  // starting at 10, per the ticket's "continue for all visible tiers".
  await clickSidepaneItem(popup, 'Tier Settings');
  await fillConfigInput(popup, 'Buy 2', '10');
  await fillConfigInput(popup, 'Buy 3', '15');
  await fillConfigInput(popup, 'Buy 4', '20');
  await fillConfigInput(popup, 'Buy 5', '25');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Priority');
  await fillConfigInput(popup, 'Bundle Priority', '2');
  await demoPause(popup);

  await popup.getByText('Content', { exact: true }).click();
  await demoPause(popup);
  await clickSidepaneItem(popup, 'Message Text');
  await fillActiveConfigField(popup, PRIMARY_MESSAGE);
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
  // "Primary Text" here, not "Primary Text Color" like Bundle Discount/
  // Volume Discount - MixAndMatchEditor.jsx drops the "Color" suffix.
  await fillColorInput(popup, 'Primary Text', '#000000');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Secondary Colors');
  // Same dropped-suffix naming: "Secondary Background", not "...Color".
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

  // Save and verify. The Discounts list displays bundleTitle (set above via
  // Primary Message), not the header text set at the top of this test.
  await saveEditor(popup);
  await waitForSaveAndClose(popup);

  await refreshAndVerifyInList(app, 'Discounts', new RegExp(PRIMARY_MESSAGE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
});
