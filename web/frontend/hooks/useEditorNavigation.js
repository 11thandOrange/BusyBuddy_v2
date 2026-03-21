import { useLocation } from 'react-router-dom';
import { useCallback } from 'react';

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
    const queryString = getQueryString();
    const path = id
      ? `/${appType}/editor/${id}`
      : `/${appType}/editor`;

    // Open editor in a new browser tab as standalone page (using editor.html with hash routing)
    // This loads the editor outside of Shopify App Bridge shell
    window.open(`/editor.html${queryString}#${path}`, '_blank');
  }, [appType, getQueryString]);

  const closeEditor = useCallback(() => {
    // Close the current tab/window
    window.close();

    // Fallback: if window.close() is blocked (not opened via JS),
    // redirect to the list page
    const queryString = getQueryString();
    window.location.href = `/${appType}` + queryString;
  }, [appType, getQueryString]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
