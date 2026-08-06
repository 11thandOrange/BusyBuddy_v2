import {
  test,
  expect,
  demoPause,
  dashboardTile,
  gotoTab,
  announcementBarRowByMessage,
  editAnnouncementBarRow,
  toggleRowActive,
} from '../../fixtures/app.js';

const TEST_MESSAGE = 'Create a new Announcement Bar-test';

// Ticket: Announcement Bar App - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/310)
//
// Suite 3 - Announcement Bars List Page. Depends on
// 01-create-and-customize.spec.js having already created and saved a bar
// with this message (runs first - playwright.config.js sets workers: 1 /
// fullyParallel: false, so file order within the directory is preserved).
//
// No Preview step here, unlike the bundle-type apps' Discounts list -
// DiscountList.jsx's AnnouncementBarItem row has no preview modal, only
// Edit and Delete buttons plus the Active/Inactive switch.
test('Announcement Bar: edit-in-new-tab and activate from the Announcement Bars list', async ({ page, app }) => {
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Announcement Bars');
  await demoPause(app);

  const row = announcementBarRowByMessage(app, TEST_MESSAGE);
  await expect(row).toBeVisible({ timeout: 15_000 });

  const editorPopup = await editAnnouncementBarRow(page, row);
  // Unlike the bundle-type apps, the header's title input isn't this bar's
  // identifying text (see 01-create-and-customize.spec.js) - confirming the
  // editor opened on its default Content > Message Text view is the
  // equivalent check here.
  await expect(editorPopup.getByText('Content', { exact: true })).toBeVisible({ timeout: 15_000 });
  await demoPause(editorPopup);

  await editorPopup.close();
  await demoPause(app);

  // Suite 1 left this bar Inactive - flip it Active here.
  await toggleRowActive(row);
  await expect(row.getByText('Active', { exact: true })).toBeVisible();
});
