import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor } from '../../fixtures/app.js';

test('Volume Discounts: adjust a quantity-break threshold and percentage', async ({ page, app }) => {
  await dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Discounts');

  const firstDiscount = app.locator('.bundlebox').first();
  await expect(firstDiscount).toBeVisible();

  const popup = await openEditorPopup(page, () =>
    firstDiscount.locator('..').locator('..').getByRole('button').first().click()
  );

  await popup.getByText('Quantity Breaks', { exact: true }).click();
  const discountInput = popup.locator('input[type="number"]').first();
  await discountInput.fill('25');

  await saveEditor(popup);
});
