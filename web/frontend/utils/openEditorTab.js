/**
 * Opens the standalone editor (/editor.html) in a new tab with a signed
 * shop+signature pair already in its URL, fetched fresh from the main
 * app's own authenticated session (see web/backend/routes/editor/index.js).
 *
 * window.open() is called synchronously, before the signature fetch, and
 * the resulting blank tab is navigated once the fetch resolves. Calling
 * window.open() only after an awaited fetch gets treated as a blocked
 * popup by most browsers, since it's no longer directly inside the click
 * handler's call stack.
 *
 * This replaces the old approach of baking a signed shop/signature pair
 * into editor.html server-side (%EDITOR_SHOP%/%EDITOR_SIGNATURE%
 * placeholders substituted by Express): that substitution only ran when
 * Express itself served the file, which never happens in local dev
 * (`npm run dev` serves editor.html straight off Vite's dev server), so
 * the editor always opened broken outside of a production build. Putting
 * the signature in the URL up front works identically in both.
 */
export function openEditorTab(path, locationSearch) {
  const win = window.open('', '_blank');
  const params = new URLSearchParams(locationSearch);
  const shop = params.get('shop');

  if (!shop) {
    if (win) win.location.href = `/editor.html#${path}`;
    return win;
  }

  fetch('/api/editor/signature')
    .then(async (response) => {
      const data = await response.json().catch(() => null);
      const signature = response.ok ? data?.signature : null;
      const query = signature
        ? `?shop=${encodeURIComponent(shop)}&signature=${encodeURIComponent(signature)}`
        : `?shop=${encodeURIComponent(shop)}`;
      if (win) win.location.href = `/editor.html${query}#${path}`;
    })
    .catch(() => {
      if (win) win.location.href = `/editor.html?shop=${encodeURIComponent(shop)}#${path}`;
    });

  return win;
}

export default openEditorTab;
