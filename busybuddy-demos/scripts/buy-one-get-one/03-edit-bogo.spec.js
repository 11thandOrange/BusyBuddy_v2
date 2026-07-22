import { test, expect, dashboardTile, gotoTab, openEditorPopup, saveEditor, clickSidepaneItem, refreshAndVerifyInList } from '../../fixtures/app.js';

// 1. Open the Buy One Get One app, go to the Discounts list tab
// 2. Open the first existing offer in the list
// 3. Change its discount to 30%
// 4. Click Save and wait for the save confirmation
// 5. Go back to the Discounts list tab, confirm the offer is still there
test('BOGO: edit the "get" product selection and discount', async ({ page, app }) => {
  await dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /manage/i }).click();
  await gotoTab(app, 'Discounts');

  const firstOffer = app.locator('.bundlebox').first();
  await expect(firstOffer).toBeVisible();

  const popup = await openEditorPopup(page, () =>
    firstOffer.locator('..').locator('..').getByRole('button').first().click()
  );

  await clickSidepaneItem(popup, 'Discount Settings');
  await popup.getByPlaceholder(/e\.g\., 20/).fill('30');

  await saveEditor(popup);
  await expect(popup.getByText(/saved|success/i)).toBeVisible({ timeout: 15_000 });
  await popup.close();

  await refreshAndVerifyInList(app, 'Discounts', /Sony Walkman/i);
});
