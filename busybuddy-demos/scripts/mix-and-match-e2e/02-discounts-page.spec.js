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

// See 01-create-and-customize.spec.js: MixAndMatchEditor.jsx's header title
// input is bundleInternalName, but the Discounts list (and this modal's
// heading) display bundleTitle - set via the Content tab's Primary Message
// field, not the header. The two are deliberately different strings here.
const HEADER_TITLE = 'Create a new Mix & Match Discount-test';
const PRIMARY_MESSAGE = 'Mix & Match To Save More!\u{1F525}';

// Ticket: Mix & Match Discount Bundle - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/308)
//
// Suite 3 - Discounts Page. Depends on 01-create-and-customize.spec.js
// having already created and saved a bundle (runs first -
// playwright.config.js sets workers: 1 / fullyParallel: false, so file
// order within the directory is preserved).
test('Mix & Match: preview, edit-in-new-tab, and activate from the Discounts list', async ({ page, app }) => {
  await dashboardTile(app, 'Mix & Match').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Discounts');
  await demoPause(app);

  // Row lookup is by bundleTitle (the Primary Message), not the header text.
  const row = discountRowByTitle(app, PRIMARY_MESSAGE);
  await expect(row).toBeVisible({ timeout: 15_000 });

  await clickPreviewOnRow(row);
  await expect(app.getByRole('dialog')).toBeVisible();
  await expect(app.getByRole('dialog').getByText(PRIMARY_MESSAGE).first()).toBeVisible();
  await demoPause(app);

  // The modal overlay sits on top of the row, so its Edit pencil can't be
  // reached until Preview is dismissed.
  // .last(): Modal.Header's own built-in "x" close icon (closeButton prop)
  // also has accessible name "Close" (aria-label="Close"), same as the
  // Footer's text button (DiscountPreviewModal.jsx) - the Footer button
  // renders last in DOM order.
  await app.getByRole('button', { name: 'Close', exact: true }).last().click();
  await demoPause(app);

  const editorPopup = await editRowInNewTab(page, row);
  await expect(editorPopup.locator('input.editable-title')).toBeVisible({ timeout: 15_000 });
  // The header input reflects bundleInternalName here, so it's the header
  // text set at create time, not the Primary Message used to find the row.
  await expect(editorPopup.locator('input.editable-title')).toHaveValue(HEADER_TITLE);
  await demoPause(editorPopup);

  await editorPopup.close();
  await demoPause(app);

  // Suite 1 left this bundle Inactive - flip it Active here.
  await toggleRowActive(row);
  await expect(row.getByText('Active', { exact: true })).toBeVisible();
});
