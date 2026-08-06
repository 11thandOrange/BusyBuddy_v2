import {
  test,
  expect,
  demoPause,
  dashboardTile,
  openEditorPopup,
  saveEditor,
  waitForSaveAndClose,
  clickSidepaneItem,
  fillActiveConfigField,
  toggleEditorEnabled,
  toggleConfigRow,
  selectConfigOption,
  fillConfigInput,
  fillColorInput,
  selectThemeByPosition,
  selectDeviceView,
  refreshAndVerifyInList,
  toggleAppWideSwitchAndRestore,
} from '../../fixtures/app.js';

// Ticket: Announcement Bar App - Comprehensive Playwright E2E Test Suite
// (https://github.com/11thandOrange/BusyBuddy_v2/issues/310)
//
// The Announcement Bars list (DiscountList.jsx) renders bar.message, not a
// separate title - this is also the string typed into the Message Text
// panel below, so it doubles as this test's row-lookup identifier.
const TEST_MESSAGE = 'Create a new Announcement Bar-test';

/** datetime-local wants "YYYY-MM-DDTHH:mm" in local time, not a full ISO string. */
function toDateTimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Suite 1 - Create Announcement Bar, Suite 2 - Customize Editor. Both run as
// one continuous test since Suite 2 explicitly continues in the same editor
// session Suite 1 opens, ending in a single Save.
test('Announcement Bar: create + customize full editor workflow', async ({ page, app }) => {
  // --- Suite 1: Create Announcement Bar ---
  // Step 2 (added once ticket #310 was updated to require this): the
  // app-wide Active/Inactive switch (ToggelSwitch.jsx, appId="announcement_bar")
  // only renders on this app's own page, reached via "Manage" - not on the
  // dashboard tile itself - so this now opens the editor via that page's
  // own "Create Announcement Bar" button instead of the dashboard tile's
  // "Create" button used previously.
  await dashboardTile(app, 'Announcement Bar').getByRole('button', { name: /manage/i }).click();
  await toggleAppWideSwitchAndRestore(app);

  const popup = await openEditorPopup(page, () =>
    app.getByRole('button', { name: 'Create Announcement Bar' }).click()
  );
  // Editor opens directly on Content > Message Text (activeTab/activeSetting
  // both default there in AnnouncementBarEditor.jsx) - no header title input
  // to wait on here, since (unlike the other 4 apps) the header's title
  // field is a separate `title` state never touched by this flow.
  await expect(popup.getByText('Content', { exact: true })).toBeVisible({ timeout: 15_000 });

  await clickSidepaneItem(popup, 'Message Text');
  await fillActiveConfigField(popup, TEST_MESSAGE);
  await demoPause(popup);

  // Toggle Bar to Inactive (header enable switch - AnnouncementBarEditor.jsx
  // wires EditorHeader's enabled prop directly to barEnabled).
  await toggleEditorEnabled(popup);
  await demoPause(popup);

  // The ticket's "Select Bar Type" step has no reachable control: barType's
  // only ConfigSelect lives in a case ('type') that no sidepane item points
  // to (ANNOUNCEMENT_BAR_SETTINGS.content has no id:'type' entry, and the
  // default activeSetting is 'message', not 'type') - it's unreachable dead
  // UI, not something to fake a click for. The ticket's countdown-related
  // steps instead map to the separately reachable "Countdown Timer" panel
  // below, which is a real, always-available control independent of
  // whatever barType defaults to.
  await clickSidepaneItem(popup, 'Countdown Timer');
  await toggleConfigRow(popup, 'Show Timer');
  await expect(popup.getByText(/timer theme/i)).toBeVisible();
  await selectThemeByPosition(popup, 'Timer Theme', 4);
  await demoPause(popup);

  // The ticket's "Emoji Position -> Both Sides" step has no equivalent here:
  // AnnouncementBarEditor.jsx's emoji panel is just a picker that appends
  // the chosen emoji directly into the message text - no position selector
  // like the bundle-type apps have. Opens the picker via the real "Choose
  // Emoji" button; not asserting on or clicking into the third-party
  // emoji-picker-react widget's own internal DOM, which this suite hasn't
  // verified the exact rendered structure of.
  await clickSidepaneItem(popup, 'Emoji & Icons');
  await popup.getByRole('button', { name: 'Choose Emoji' }).click();
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Shop Now Button');
  await toggleConfigRow(popup, 'Show Button');
  await fillConfigInput(popup, 'Button Text', 'Shop the Sale');
  await fillColorInput(popup, 'Background Color', '#FF0000');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Save Badge');
  await toggleConfigRow(popup, 'Show Save Badge');
  await fillConfigInput(popup, 'Badge Text', 'SAVE 20%');
  await demoPause(popup);

  // --- Suite 2: Customize Editor (same editor session, continues here) ---
  await clickSidepaneItem(popup, 'Email Form');
  await toggleConfigRow(popup, 'Show Email Form');
  // Email List/Email Template options depend on a connected Mailchimp/
  // Klaviyo provider (Settings tab) - on a fresh store neither has any real
  // option beyond the defaults ("Connect a provider first" / "No automated
  // email"), so this only exercises the toggle rather than forcing a named
  // selection that may not exist.
  await demoPause(popup);

  await popup.getByText('Appearance', { exact: true }).click();
  await demoPause(popup);
  await clickSidepaneItem(popup, 'Background');
  await selectConfigOption(popup, 'Background Type', 'Theme');
  await expect(popup.getByText('Pick a Theme', { exact: true })).toBeVisible();
  await selectThemeByPosition(popup, 'Pick a Theme', 1);
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Text Color');
  await fillColorInput(popup, 'Message Text Color', '#000000');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Font Settings');
  await selectConfigOption(popup, 'Font Family', 'Roboto');
  await fillConfigInput(popup, 'Font Size', '18');
  await selectConfigOption(popup, 'Font Weight', 'Bold');
  await demoPause(popup);

  await clickSidepaneItem(popup, 'Bar Size');
  await fillConfigInput(popup, 'Bar Height', '60');
  await fillConfigInput(popup, 'Padding', '12');
  await demoPause(popup);

  await popup.getByText('Behavior', { exact: true }).click();
  await demoPause(popup);
  await clickSidepaneItem(popup, 'Position');
  await selectConfigOption(popup, 'Bar Position', 'Bottom');
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

  await refreshAndVerifyInList(app, 'Announcement Bars', TEST_MESSAGE);
});
