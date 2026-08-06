import {
  test,
  expect,
  demoPause,
  dashboardTile,
  gotoTab,
  discountRowByTitle,
  clickPreviewOnRow,
  editRowInNewTab,
  toggleRowActive,
} from '../../fixtures/app.js';

const BUNDLE_TEST_TITLE = 'Create a new Bundle Discount-test';

// Ticket: Bundle Discount App - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/306)
//
// Suite 3 - Discounts Page. Depends on 01-create-and-customize.spec.js
// having already created a bundle titled BUNDLE_TEST_TITLE (runs first -
// playwright.config.js sets workers: 1 / fullyParallel: false, so file
// order within the directory is preserved).
test('Bundle Discount: preview, edit-in-new-tab, and activate from the Discounts list', async ({ page, app }) => {
  await dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Discounts');
  await demoPause(app);

  const row = discountRowByTitle(app, BUNDLE_TEST_TITLE);
  await expect(row).toBeVisible({ timeout: 15_000 });

  await clickPreviewOnRow(row);
  await expect(app.getByRole('dialog')).toBeVisible();
  // .first(): DiscountPreviewModal.jsx shows the title twice - once in the
  // Modal.Title header, again in an "Internal Name: <title>" body line
  // (internalName defaults to the same string when not set separately) -
  // a bare getByText match hits both and trips Playwright's strict mode.
  // The header instance renders first in DOM order.
  await expect(app.getByRole('dialog').getByText(BUNDLE_TEST_TITLE).first()).toBeVisible();
  await demoPause(app);

  // The modal overlay sits on top of the row, so its Edit pencil can't be
  // reached until Preview is dismissed.
  await app.getByRole('button', { name: 'Close', exact: true }).click();
  await demoPause(app);

  const editorPopup = await editRowInNewTab(page, row);
  await expect(editorPopup.locator('input.editable-title')).toBeVisible({ timeout: 15_000 });
  await expect(editorPopup.locator('input.editable-title')).toHaveValue(BUNDLE_TEST_TITLE);
  await demoPause(editorPopup);

  await editorPopup.close();
  await demoPause(app);

  // Suite 1 left this bundle Inactive - flip it Active here.
  await toggleRowActive(row);
  await expect(row.getByText('Active', { exact: true })).toBeVisible();
});
