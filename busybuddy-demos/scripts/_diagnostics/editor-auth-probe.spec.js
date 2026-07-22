import { test, expect, dashboardTile, openEditorPopup } from '../../fixtures/app.js';

// TEMPORARY DIAGNOSTIC - not a demo journey. Captures whether the editor's
// injected shop/signature meta tags are actually populated (proves whether
// the PR #258 fix reached the live build) and the raw /api/products
// response status+body (proves whether auth is actually passing now).
// Safe to delete once the standalone-editor auth issue is resolved.
test('DIAGNOSTIC: editor auth meta tags + /api/products response', async ({ page, app }) => {
  const popup = await openEditorPopup(page, () =>
    dashboardTile(app, 'Bundle Discounts').getByRole('button', { name: /create/i }).click()
  );

  const authMeta = await popup.evaluate(() => ({
    shop: document.querySelector('meta[name="editor-shop"]')?.content || null,
    signature: document.querySelector('meta[name="editor-signature"]')?.content || null,
  }));
  console.log('EDITOR_AUTH_META', JSON.stringify(authMeta));

  const responsePromise = popup.waitForResponse((res) => res.url().includes('/api/products'), { timeout: 30_000 });
  // fetchStoreProducts already ran once on mount before we attached this
  // listener - reload to force a fresh, observable call.
  await popup.reload();
  const response = await responsePromise;
  const body = await response.text();
  console.log('API_PRODUCTS_STATUS', response.status());
  console.log('API_PRODUCTS_BODY', body.slice(0, 3000));

  expect(authMeta.shop, 'editor-shop meta tag should be populated').toBeTruthy();
  expect(authMeta.signature, 'editor-signature meta tag should be populated').toBeTruthy();
  expect(response.status(), `Expected 200 from /api/products, got ${response.status()}: ${body.slice(0, 500)}`).toBe(200);
});
