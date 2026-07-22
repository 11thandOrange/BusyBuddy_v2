import { test, expect, dashboardTile, openEditorPopup, clickSidepaneItem } from '../../fixtures/app.js';

// 1. Click "Create" on the Bundle Discounts tile
// 2. Open the Content tab, turn on the Countdown Timer option
// 3. Open the Skip Offer Button option, set its label to "No thanks"
// 4. Confirm the live preview panel is visible showing these variants
test('Bundle Discounts: countdown timer + skip-offer button live preview', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /create/i }).click()
  );

  await popup.getByText('Content', { exact: true }).click();
  await clickSidepaneItem(popup, 'Countdown Timer');
  await expect(popup.getByText(/countdown timer/i)).toBeVisible();

  await clickSidepaneItem(popup, 'Skip Offer Button');
  await popup.getByPlaceholder('Skip Offer').fill('No thanks');

  await expect(popup.locator('.preview-panel, [class*="preview"]').first()).toBeVisible();
});
