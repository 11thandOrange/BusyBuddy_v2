import {
  test,
  dashboardTile,
  openEditorPopup,
  saveEditor,
  clickSidepaneItem,
  addProductViaPicker,
  selectConfigOption,
  fillConfigInput,
} from '../../fixtures/app.js';

// TEMPORARY DIAGNOSTIC - waitForSaveAndClose (waiting for the popup's
// "close" event after clicking save) still times out. This reproduces the
// full create-bundle flow and captures the actual /api/bundles response,
// all browser console messages, and page errors, to determine whether the
// save request itself fails or whether window.close() just doesn't fire in
// this context. Safe to delete once resolved.
test('DIAGNOSTIC: save flow for bundle creation', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /create/i }).click()
  );

  const consoleMessages = [];
  popup.on('console', (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  popup.on('pageerror', (err) => consoleMessages.push(`[pageerror] ${err.message}`));

  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPicker(popup, 'Nintendo Game Boy');
  await addProductViaPicker(popup, 'Game Boy Color');

  await clickSidepaneItem(popup, 'Discount Settings');
  await selectConfigOption(popup, 'Discount Type', 'Percentage');
  await fillConfigInput(popup, 'Discount Value', '15');

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

  await popup.waitForTimeout(3000);
  console.log('POPUP_IS_CLOSED', popup.isClosed());
  console.log('CONSOLE_MESSAGES', JSON.stringify(consoleMessages.slice(-30)));
});
