import { test, expect, dashboardTile, openEditorPopup, clickSidepaneItem } from '../../fixtures/app.js';

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
