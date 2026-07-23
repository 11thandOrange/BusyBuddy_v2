import { test, expect, dashboardTile, openEditorPopup, clickSidepaneItem, addProductViaPicker } from '../../fixtures/app.js';

// 1. Click "Create" on the Mix and Match tile
// 2. Open "Select Products", add "BlackBerry Bold" (needed for the tier preview to render at all)
// 3. Open Tier Settings
// 4. Click through all three preset buttons in order: Buy 2, Buy 3, Buy 4
test('Mix and Match: switch across all Buy 2/3/4 tier presets', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Mix & Match').getByRole('button', { name: /create/i }).click()
  );

  // The tier-selector buttons only render in the live preview once at
  // least one product is selected (otherwise it shows a placeholder).
  // "Cassette" was never a seeded product title - see
  // scripts/seed-demo-store/products.json. Uses a different product than
  // 02-create-offer.spec.js's "Sega Game Gear" since that spec's save
  // permanently tags its product out of every app's picker afterward.
  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPicker(popup, 'BlackBerry Bold');

  await clickSidepaneItem(popup, 'Tier Settings');
  // The live-preview tier presets object (MixAndMatchEditor.jsx) only
  // defines tiers 2, 3, and 4 - there is no "Buy 5" preset button to click.
  for (const tier of ['Buy 2', 'Buy 3', 'Buy 4']) {
    const tierButton = popup.getByRole('button', { name: tier });
    await tierButton.click();
    await expect(tierButton).toBeVisible();
  }
});
