import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor } from '../../fixtures/app.js';

test('Volume Discounts: adjust a quantity-break threshold and percentage', async ({ page, app }) => {
  await dashboardTile(app, 'Volume Discounts').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Discounts');

  const firstDiscount = app.locator('.bundlebox').first();
  await expect(firstDiscount).toBeVisible();

  const popup = await openEditorPopup(page, () =>
    firstDiscount.locator('..').locator('..').getByRole('button').first().click()
  );

  await popup.getByText('Quantity Breaks', { exact: true }).first().click();
  // Each tier renders Quantity then Discount % side by side - scope by the
  // form group's own label rather than input order, since the raw first
  // number input on the page is the Quantity field, not Discount %.
  const discountInput = popup
    .locator('.form-group')
    .filter({ has: popup.locator('.form-label', { hasText: 'Discount %' }) })
    .locator('input')
    .first();
  await discountInput.fill('25');

  await saveEditor(popup);
});
