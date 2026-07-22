import { test, expect, dashboardTile, openEditorPopup } from '../../fixtures/app.js';

test('Mix and Match: switch across all Buy 2/3/4/5 tier presets', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Mix & Match').getByRole('button', { name: /create/i }).click()
  );

  await popup.getByText('Tier Settings', { exact: true }).first().click();
  for (const tier of ['Buy 2', 'Buy 3', 'Buy 4', 'Buy 5']) {
    await popup.getByText(tier, { exact: true }).first().click();
    await expect(popup.getByText(tier, { exact: true }).first()).toBeVisible();
  }
});
