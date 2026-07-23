import {
  test,
  dashboardTile,
  openEditorPopup,
  saveEditor,
  clickSidepaneItem,
  addProductViaPickerRow,
} from '../../fixtures/app.js';

// TEMPORARY DIAGNOSTIC - even a 30s wait for the popup to close times out,
// and the failure screenshot is stuck showing "Saving..." the whole time
// (byte-identical across runs), suggesting the request may be genuinely
// hanging rather than just slow. Waits up to 60s for the actual
// /api/bundles response to settle whether it ever resolves at all. Safe to
// delete once resolved.
test('DIAGNOSTIC: volume discount save flow (long wait)', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /create/i }).click()
  );

  const consoleMessages = [];
  popup.on('console', (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  popup.on('pageerror', (err) => consoleMessages.push(`[pageerror] ${err.message}`));

  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPickerRow(popup, 'Palm Pilot');

  await clickSidepaneItem(popup, 'Quantity Breaks');

  const savePromise = popup.waitForResponse((res) => res.url().includes('/api/bundles'), { timeout: 60_000 }).catch((e) => e);
  const startTime = Date.now();
  await saveEditor(popup);
  const saveResponse = await savePromise;
  const elapsedMs = Date.now() - startTime;

  console.log('ELAPSED_MS', elapsedMs);
  if (saveResponse instanceof Error) {
    console.log('SAVE_RESPONSE_ERROR', saveResponse.message);
  } else {
    const body = await saveResponse.text().catch(() => '<unreadable>');
    console.log('SAVE_URL', saveResponse.url());
    console.log('SAVE_STATUS', saveResponse.status());
    console.log('SAVE_BODY', body.slice(0, 2000));
  }

  await popup.waitForTimeout(2000).catch(() => {});
  console.log('POPUP_IS_CLOSED', popup.isClosed());
  console.log('CONSOLE_MESSAGES', JSON.stringify(consoleMessages.slice(-30)));
});
