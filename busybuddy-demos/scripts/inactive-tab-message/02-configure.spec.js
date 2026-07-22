import { test, expect, dashboardTile } from '../../fixtures/app.js';

test('Inactive Tab Message: configure via Create (same-window, no standalone editor)', async ({ page, app }) => {
  // Unlike the other 5 apps, "Create" navigates straight to
  // /inactive-tab-message?tab=settings in the same window rather than
  // opening a standalone /editor.html popup.
  await dashboardTile(app, 'Inactive Tab Message').getByRole('button', { name: /create/i }).click();

  const messageInput = app.getByPlaceholder('Enter message to display when tab is inactive');
  await expect(messageInput).toBeVisible({ timeout: 15_000 });
  await messageInput.fill('Come back! Your cart is waiting 🛒');

  await app.getByRole('button', { name: /save settings/i }).click();
});
