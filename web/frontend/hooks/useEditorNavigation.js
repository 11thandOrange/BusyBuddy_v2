import { useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { openEditorTab } from '../utils/openEditorTab';

/**
 * Hook for navigating to/from the editor.
 * Opens the editor in a new browser tab as a standalone page (outside App Bridge shell).
 *
 * @param {string} appType - The app type: 'announcement-bar', 'bundle-discount', 'buy-one-get-one', 'volume-discounts', 'mix-and-match'
 */
export const useEditorNavigation = (appType = 'announcement-bar') => {
  const location = useLocation();

  // Build query string preserving shop param only (no host - we want standalone)
  const getQueryString = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const shop = params.get('shop');
    return shop ? `?shop=${shop}` : '';
  }, [location.search]);

  const openEditor = useCallback((id = null) => {
    const path = id
      ? `/${appType}/editor/${id}`
      : `/${appType}/editor`;

    // Open editor in a new browser tab as standalone page (using editor.html with hash routing)
    // This loads the editor outside of Shopify App Bridge shell
    openEditorTab(path, location.search);
  }, [appType, location.search]);

  const closeEditor = useCallback(() => {
    // The editor tab is deliberately opened without `host` (see
    // getQueryString above - standalone, outside the App Bridge shell), so
    // if window.close() is ever blocked and this tab falls back to loading
    // the main app itself, it does so without the embedded context Shopify
    // expects and doesn't land where a merchant would expect (the results
    // list) - it lands on the app's default/home route instead.
    //
    // window.opener is the original tab this editor was opened from - it
    // already has a real `host` in its own URL, so send IT to the results
    // page (same origin, safe to read/set .location directly) and only
    // then close this tab, instead of ever rendering the main app here.
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.location.href = `/${appType}${window.opener.location.search}`;
        window.opener.focus();
      } catch {
        // Opener navigated away or otherwise inaccessible - fall through
        // to closing this tab; the fallback below still covers that case.
      }
      window.close();
      return;
    }

    // No opener (e.g. this tab's URL was opened directly, not via
    // window.open) - nothing to hand off to, so just close/redirect this
    // tab itself.
    window.close();
    const queryString = getQueryString();
    window.location.href = `/${appType}` + queryString;
  }, [appType, getQueryString]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
