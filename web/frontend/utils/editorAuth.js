/**
 * The standalone editor (/editor.html, see web/frontend/editor.jsx) runs
 * outside the App Bridge iframe by design, so it has no session token to
 * authenticate its own /api/* calls with the way the embedded app's calls
 * do (shopify.validateAuthenticatedSession() in web/index.js).
 *
 * Whoever opens this tab (see web/frontend/utils/openEditorTab.js) fetches
 * a signed shop+signature pair from the authenticated main app first and
 * puts it directly in this page's URL query string - that's the only
 * source of truth read here. This has to work identically whether
 * editor.html is served by Express (production build) or by Vite's dev
 * server directly (local `npm run dev`, which never runs any server-side
 * templating), so nothing here depends on the server having touched the
 * page at all.
 */
const params = new URLSearchParams(window.location.search);

export const EDITOR_SHOP = params.get('shop') || '';
export const EDITOR_SIGNATURE = params.get('signature') || '';

if (EDITOR_SHOP && !EDITOR_SIGNATURE) {
  // Not a redirect - a merchant mid-edit should never get bounced out of
  // this tab. Every /api/* call below will 401 with a clear message
  // instead, which the calling component surfaces as a toast.
  console.error(
    'BusyBuddy editor: opened with a shop but no signature - every /api/* ' +
    'call on this page will fail until this tab is closed and reopened ' +
    'from the app.'
  );
}

export function editorFetch(url, options) {
  const separator = url.includes('?') ? '&' : '?';
  const authedUrl = `${url}${separator}shop=${encodeURIComponent(EDITOR_SHOP)}&signature=${encodeURIComponent(EDITOR_SIGNATURE)}`;
  return fetch(authedUrl, options);
}

/**
 * Parses a fetch Response body as JSON without throwing when it isn't JSON
 * (a proxy error page, a plain-text 401, an empty body, ...). Every editor's
 * fetchStoreProducts called response.json() unconditionally, so a non-JSON
 * error body crashed with a raw "Unexpected token '...' is not valid JSON"
 * instead of surfacing what the server actually said.
 */
export async function safeParseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 200) };
  }
}
