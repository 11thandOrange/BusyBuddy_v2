import { test, dashboardTile, openEditorPopup, saveEditor, waitForSaveAndClose, clickSidepaneItem, addProductViaPicker, selectConfigOption, fillConfigInput, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Click "Create" on the Bundle Discounts tile - opens the standalone editor
// 2. Open "Select Products", add "Game Boy" and "Game Boy Color" via the product picker
// 3. Go to Discount Settings, select "Percentage", enter 15
// 4. Click Save and wait for the save confirmation
// 5. Go back to the app, open the Discounts list tab, confirm the new bundle is in the list
test('Bundle Discounts: create a bundle from 2 seeded products', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Select Products');
  // "Game Boy" alone would match both "Nintendo Game Boy" and "Game Boy
  // Color", and .first() would consume whichever renders first - leaving
  // the second search below unable to find anything (its target already
  // selected, no other title matching). Searching the full unique title
  // avoids that overlap.
  await addProductViaPicker(popup, 'Nintendo Game Boy');
  await addProductViaPicker(popup, 'Game Boy Color');

  await clickSidepaneItem(popup, 'Discount Settings');
  await selectConfigOption(popup, 'Discount Type', 'Percentage');
  await fillConfigInput(popup, 'Discount Value', '15');

  await saveEditor(popup);
  await waitForSaveAndClose(popup);

  await dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /manage/i }).click();
  await refreshAndVerifyInList(app, 'Discounts', /Game Boy/i);
});
