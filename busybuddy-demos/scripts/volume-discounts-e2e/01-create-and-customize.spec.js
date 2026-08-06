import {
  test,
  expect,
  demoPause,
  dashboardTile,
  openEditorPopup,
  saveEditor,
  waitForSaveAndClose,
  clickSidepaneItem,
  addProductViaPickerRowBySearch,
  fillConfigInput,
  fillColorInput,
  fillActiveConfigField,
  setEditorTitle,
  toggleEditorEnabled,
  toggleConfigRow,
  selectConfigOption,
  selectCountdownThemeByPosition,
  addProductSpec,
  appendToDescription,
  selectDeviceView,
  refreshAndVerifyInList,
  toggleAppWideSwitchAndRestore,
} from '../../fixtures/app.js';

const VOLUME_TEST_TITLE = 'Create a new Volume Discount-test';

/** datetime-local wants "YYYY-MM-DDTHH:mm" in local time, not a full ISO string. */
function toDateTimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Ticket: Volume Discount Bundle - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/309)
//
// Suite 1 - Create Volume Discount Bundle, Suite 2 - Customize Editor. Both
// run as one continuous test since Suite 2 explicitly continues in the same
// editor session Suite 1 opens, ending in a single Save.
test('Volume Discount: create + customize full editor workflow', async ({ page, app }) => {
  // --- Suite 1: Create Volume Discount Bundle ---
  // Step 2 (added once ticket #309 was updated to require this): the
  // app-wide Active/Inactive switch (ToggelSwitch.jsx, appId="volume_discounts")
  // only renders on this app's own page, reached via "Manage" - not on the
  // dashboard tile itself - so this now opens the editor via that page's
  // own "Create New Volume Discount" button instead of the dashboard
  // tile's "Create" button used previously.
  await dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /manage/i }).click();
  await toggleAppWideSwitchAndRestore(app);

  const popup = await openEditorPopup(page, () =>
    app.getByRole('button', { name: 'Create New Volume Discount' }).click()
  );
  await expect(popup.locator('input.editable-title')).toBeVisible({ timeout: 15_000 });

  await setEditorTitle(popup, VOLUME_TEST_TITLE);
  await demoPause(popup);

  // Toggle Discount to Inactive (header enable switch defaults to on/enabled).
  await toggleEditorEnabled(popup);
  await demoPause(popup);

  // The ticket's "Click Add Products" / "Click Exit" steps: VolumeDiscountEditor.jsx
  // has no control literally named "Exit" - only a "+ Add Product" toggle to
  // open the inline picker and a "x Close" to abort it. Clicking Close before
  // searching would abort the very picker we need open, so that step is
  // skipped here rather than faked; addProductViaPickerRowBySearch opens the
  // picker itself via the real "+ Add Product" button.
  await clickSidepaneItem(popup, 'Select Products');
  // "tele" matches only "CRT Television" in the seeded catalog - searched
  // per the ticket anyway rather than the product's full title, since the
  // real product search (web/backend/controller/products/index.js) is a
  // literal title-substring match and "tv" (the ticket's original wording)
  // doesn't match "Television" at all.
  await addProductViaPickerRowBySearch(popup, 'tele', 'CRT Television');
  await demoPause(popup);

  // Volume Discount has no separate discount-type/value screen - the
  // sidepane's "Discount" group title is what the ticket calls "Discount
  // Settings", but its only actual clickable item is "Quantity Breaks".
  await clickSidepaneItem(popup, 'Quantity Breaks');
  await popup.getByRole('button', { name: '+ Add Another Quantity Break' }).click();
  await demoPause(popup);
  // The newly added tier is last and starts non-default - toggle its
  // "Set as default selection" switch (note: lowercase "as"/"default"/
  // "selection" in the real label, unlike the ticket's title-case wording).
  await popup.locator('.toggle-row').filter({ has: popup.locator('.toggle-label', { hasText: 'Set as default selection' }) }).last().locator('.toggle-slider').click();
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Priority');
  await fillConfigInput(popup, 'Priority Order', '2');
  await demoPause(popup);

  await popup.getByText('Content', { exact: true }).click();
  await demoPause(popup);
  await clickSidepaneItem(popup, 'Message Text');
  await fillActiveConfigField(popup, 'Buy More To Save More!\u{1F525}');
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
  await fillColorInput(popup, 'Secondary Background Color', '#D3D3D3');
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

  await refreshAndVerifyInList(app, 'Discounts', new RegExp(VOLUME_TEST_TITLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
});
