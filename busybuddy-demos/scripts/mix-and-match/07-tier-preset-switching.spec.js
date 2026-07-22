import { test, expect, dashboardTile, openEditorPopup, clickSidepaneItem, addProductViaPicker } from '../../fixtures/app.js';

test('Mix and Match: switch across all Buy 2/3/4/5 tier presets', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Mix & Match').getByRole('button', { name: /create/i }).click()
  );

  // The tier-selector buttons only render in the live preview once at
  // least one product is selected (otherwise it shows a placeholder).
  await clickSidepaneItem(popup, 'Select Products');
  await addProductViaPicker(popup, 'Cassette');

  await clickSidepaneItem(popup, 'Tier Settings');
  for (const tier of ['Buy 2', 'Buy 3', 'Buy 4', 'Buy 5']) {
    const tierButton = popup.getByRole('button', { name: tier });
    await tierButton.click();
    await expect(tierButton).toBeVisible();
  }
});
