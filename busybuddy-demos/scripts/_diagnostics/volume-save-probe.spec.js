import {
  test,
  dashboardTile,
  openEditorPopup,
  saveEditor,
  clickSidepaneItem,
  addProductViaPickerRow,
} from '../../fixtures/app.js';

// TEMPORARY DIAGNOSTIC - volume-discounts/02-create-volume-discount.spec.js's
// product-picker step now succeeds (row-click fix), but waitForSaveAndClose
// still times out afterward. All client-side validations in handleSave
// appear satisfiable by defaults on source review. Captures the actual
// /api/bundles response and console output to settle whether the save
// itself fails, rather than guessing further. Safe to delete once resolved.
test('DIAGNOSTIC: volume discount save flow', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /create/i }).click()
  );

  const consoleMessages = [];
  popup.on('console', (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  popup.on('pageerror', (err) => consoleMessages.push(`[pageerror] ${err.message}`));

  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPickerRow(popup, 'Palm Pilot');

  await clickSidepaneItem(popup, 'Quantity Breaks');

  const savePromise = popup.waitForResponse((res) => res.url().includes('/api/bundles'), { timeout: 20_000 }).catch((e) => e);
  await saveEditor(popup);
  const saveResponse = await savePromise;

  if (saveResponse instanceof Error) {
    console.log('SAVE_RESPONSE_ERROR', saveResponse.message);
  } else {
    const body = await saveResponse.text().catch(() => '<unreadable>');
    console.log('SAVE_URL', saveResponse.url());
    console.log('SAVE_STATUS', saveResponse.status());
    console.log('SAVE_BODY', body.slice(0, 2000));
  }

  await popup.waitForTimeout(3000).catch(() => {});
  console.log('POPUP_IS_CLOSED', popup.isClosed());
  console.log('CONSOLE_MESSAGES', JSON.stringify(consoleMessages.slice(-30)));
});
