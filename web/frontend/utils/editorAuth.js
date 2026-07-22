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

export const EDITOR_SHOP = editorShopMeta?.content || '';
export const EDITOR_SIGNATURE = editorSignatureMeta?.content || '';

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
