import { test, expect, dashboardTile, openEditorPopup } from '../../fixtures/app.js';

test('Volume Discounts: add and remove a quantity-break tier', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /create/i }).click()
  );

  await popup.getByText('Quantity Breaks', { exact: true }).first().click();
  // Tier rows are unstyled divs labeled "Tier N" (optionally "★Tier N" for
  // the default tier) - count those rather than a nonexistent CSS class.
  const tierLabel = popup.getByText(/Tier \d+/);
  const tierCountBefore = await tierLabel.count();

  await popup.getByRole('button', { name: '+ Add Another Quantity Break' }).click();
  await expect(async () => {
    expect(await tierLabel.count()).toBeGreaterThan(tierCountBefore);
  }).toPass({ timeout: 10_000 });

  // Each tier's remove control is a bare "✕" button, only rendered once
  // there's more than one tier.
  await popup.getByRole('button', { name: '✕', exact: true }).last().click();
});
