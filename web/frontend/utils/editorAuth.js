/**
 * The standalone editor (/editor.html, see web/frontend/editor.jsx) runs
 * outside the App Bridge iframe by design, so it has no session token to
 * authenticate its own /api/* calls with the way the embedded app's calls
 * do (shopify.validateAuthenticatedSession() in web/index.js). The server
 * signs a shop param when it serves this page (see serveEditorHtml in
 * web/index.js) using the same HMAC that web/middleware/verify-signature.js
 * already checks - this reads that signed pair back out and attaches it to
 * every request this page makes, so those existing checks actually pass.
 */
const editorShopMeta = document.querySelector('meta[name="editor-shop"]');
const editorSignatureMeta = document.querySelector('meta[name="editor-signature"]');

// If web/index.js's serveEditorHtml substitution never ran (e.g. serve-static
// answered with the raw built file, or the session lookup failed and the
// server fell through instead of redirecting to OAuth), these meta tags
// still contain their literal template placeholder text rather than a real
// shop/signature. Using that literal text would sign every /api/* call with
// garbage, so every request in the editor fails with a confusing 401 far
// from its actual cause. Fail loudly here instead.
const isUnsubstitutedPlaceholder = (value) => !value || value.startsWith('%EDITOR_');

export const EDITOR_SHOP = editorShopMeta?.content || '';
export const EDITOR_SIGNATURE = editorSignatureMeta?.content || '';

if (isUnsubstitutedPlaceholder(EDITOR_SHOP) || isUnsubstitutedPlaceholder(EDITOR_SIGNATURE)) {
  console.error(
    'BusyBuddy editor: shop/signature were not injected into this page (got a literal template placeholder). ' +
    'This usually means the app session expired or was never installed for this shop. Reloading to re-authenticate.'
  );
  const params = new URLSearchParams(window.location.search);
  const shop = params.get('shop');
  if (shop) {
    window.location.href = `/api/auth?shop=${encodeURIComponent(shop)}`;
  }
}

/**
 * Drop-in replacement for fetch() for calls to this app's own /api/* routes
 * from within the standalone editor. Do not use this for third-party URLs -
 * it appends the signed shop/signature pair to whatever URL it's given.
 */
export function editorFetch(url, options) {
  const separator = url.includes('?') ? '&' : '?';
  const authedUrl = `${url}${separator}shop=${encodeURIComponent(EDITOR_SHOP)}&signature=${encodeURIComponent(EDITOR_SIGNATURE)}`;
  return fetch(authedUrl, options);
}
