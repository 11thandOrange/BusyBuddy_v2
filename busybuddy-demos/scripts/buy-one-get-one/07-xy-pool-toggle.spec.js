import { test, expect, dashboardTile, openEditorPopup, clickSidepaneItem } from '../../fixtures/app.js';

test('BOGO: toggle between the X (buy) and Y (get) product pools', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Customer Buys (X)');
  await expect(popup.getByPlaceholder('Search products...')).toBeVisible();

  await clickSidepaneItem(popup, 'Customer Gets (Y)');
  await expect(popup.getByPlaceholder('Search products...')).toBeVisible();
});
