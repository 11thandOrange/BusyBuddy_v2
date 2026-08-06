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
} from '../../fixtures/app.js';

const BUNDLE_TEST_TITLE = 'Create a new Bundle Discount-test';

/** datetime-local wants "YYYY-MM-DDTHH:mm" in local time, not a full ISO string. */
function toDateTimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Ticket: Bundle Discount App - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/306)
//
// Suite 1 - Create Bundle Discount, Suite 2 - Customize Editor. Both run as
// one continuous test since Suite 2 explicitly continues in the same
// editor session Suite 1 opens, ending in a single Save.
test('Bundle Discount: create + customize full editor workflow', async ({ page, app }) => {
  // --- Suite 1: Create Bundle Discount ---
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /create/i }).click()
  );
  await expect(popup.locator('input.editable-title')).toBeVisible({ timeout: 15_000 });

  await setEditorTitle(popup, BUNDLE_TEST_TITLE);
  await demoPause(popup);

  // Toggle Discount to Inactive (header enable switch defaults to on/enabled).
  await toggleEditorEnabled(popup);
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPicker(popup, 'Polaroid Instant Camera');
  await demoPause(popup);
  // "cam" matches both "Polaroid Instant Camera" and "MiniDV Camcorder" -
  // pick MiniDV Camcorder specifically from that search.
  await addProductViaPickerSearch(popup, 'cam', 'MiniDV Camcorder');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Discount Settings');
  await selectConfigOption(popup, 'Discount Type', 'Percentage');
  await fillConfigInput(popup, 'Discount Value', '10');
  await demoPause(popup);
  await selectConfigOption(popup, 'Discount Type', 'Fixed Discount');
  await fillConfigInput(popup, 'Discount Value', '15');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Priority');
  await fillConfigInput(popup, 'Priority', '2');
  await demoPause(popup);

  await popup.getByText('Content', { exact: true }).click();
  await demoPause(popup);
  await clickSidepaneItem(popup, 'Message Text');
  await fillActiveConfigField(popup, 'Buy More & Save More!\u{1F525}');
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
  await fillColorInput(popup, 'Button Color', '#FF0000');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Skip Offer Button');
  await fillColorInput(popup, 'Border Color', '#1E90FF');
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

  // Views: Mobile, then back to Desktop.
  await selectDeviceView(popup, 'Mobile');
  await demoPause(popup);
  await selectDeviceView(popup, 'Desktop');
  await demoPause(popup);

  // Save and verify.
  await saveEditor(popup);
  await waitForSaveAndClose(popup);

  await dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /manage/i }).click();
  await refreshAndVerifyInList(app, 'Discounts', new RegExp(BUNDLE_TEST_TITLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
});
