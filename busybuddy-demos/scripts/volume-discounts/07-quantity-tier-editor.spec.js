import { test, expect, dashboardTile, openEditorPopup } from '../../fixtures/app.js';

test('Volume Discounts: add and remove a quantity-break tier', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /create/i }).click()
  );

  await popup.getByText('Quantity Breaks', { exact: true }).click();
  const tierCountBefore = await popup.locator('[class*="quantity-break"], [class*="tier-row"]').count();

  await popup.getByRole('button', { name: /add.*tier|add.*break/i }).click();
  await expect(async () => {
    const tierCountAfter = await popup.locator('[class*="quantity-break"], [class*="tier-row"]').count();
    expect(tierCountAfter).toBeGreaterThan(tierCountBefore);
  }).toPass({ timeout: 10_000 });

  await popup.getByRole('button', { name: /remove|delete/i }).last().click();
});
