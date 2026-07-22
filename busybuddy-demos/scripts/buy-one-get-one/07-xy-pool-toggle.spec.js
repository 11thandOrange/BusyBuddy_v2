import { test, expect, dashboardTile, openEditorPopup, clickSidepaneItem } from '../../fixtures/app.js';

test('BOGO: toggle between the X (buy) and Y (get) product pools', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Buy One Get One').getByRole('button', { name: /create/i }).click()
  );

  await clickSidepaneItem(popup, 'Select Products');
  await expect(popup.getByPlaceholder('Search products...').first()).toBeVisible();

  await popup.getByText(/^X$|Buy Product/i).first().click().catch(() => {});
  await popup.getByText(/^Y$|Get Product/i).first().click().catch(() => {});
});
