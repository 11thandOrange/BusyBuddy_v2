import { test, dashboardTile, openEditorPopup, saveEditor, waitForSaveAndClose, clickSidepaneItem, addProductViaPicker, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Click "Create" on the Mix and Match tile - opens the standalone editor
// 2. Open "Select Products", add 3 products via the product picker (the
//    "Buy 3" tier requires at least 3 selected products - MixAndMatchEditor.jsx
//    validates selectedProducts.length >= selectedTier before saving)
// 3. Open Tier Settings, click the "Buy 3" preset button in the live preview
// 4. Click Save and wait for the save confirmation
// 5. Go back to the app, open the Discounts list tab, confirm the new offer is in the list
test('Mix and Match: create an offer with a Buy 3 tier preset', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Mix & Match').getByRole('button', { name: /create/i }).click()
  );

  // "Cassette" was never a seeded product title at all - see
  // scripts/seed-demo-store/products.json. Products also get tagged
  // busybuddybundles once used in any bundle-type discount (across every
  // app), permanently excluding them from the picker afterward - so these
  // need to be names confirmed currently available, not just real.
  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPicker(popup, 'Sega Game Gear');
  await addProductViaPicker(popup, 'CRT Television');
  await addProductViaPicker(popup, 'MiniDV Camcorder');

  await clickSidepaneItem(popup, 'Tier Settings');
  // "Buy 3" also appears as a plain (non-interactive) form-group label in
  // the Tier Settings panel itself - the real, clickable tier selector is
  // a <button> in the live preview pane, so scope by role to land on it.
  await popup.getByRole('button', { name: 'Buy 3' }).click();

  await saveEditor(popup);
  await waitForSaveAndClose(popup);

  await dashboardTile(app, 'Mix & Match').getByRole('button', { name: /manage/i }).click();
  await refreshAndVerifyInList(app, 'Discounts', /Sega Game Gear/i);
});
