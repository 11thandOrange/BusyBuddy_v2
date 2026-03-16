import { useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Hook for navigating to/from the editor.
 * Opens the editor in a new browser tab for a clean, standalone experience.
 * 
 * @param {string} appType - The app type: 'announcement-bar', 'bundle-discount', 'buy-one-get-one', 'volume-discounts', 'mix-and-match'
 */
export const useEditorNavigation = (appType = 'announcement-bar') => {
  const location = useLocation();

  // Build the base URL for the editor
  const getEditorBaseUrl = useCallback(() => {
    return window.location.origin;
  }, []);

  // Build query string preserving host and shop params
  const getQueryString = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const host = params.get('host');
    const shop = params.get('shop');
    const queryParams = new URLSearchParams();
    if (host) queryParams.set('host', host);
    if (shop) queryParams.set('shop', shop);
    return queryParams.toString() ? `?${queryParams.toString()}` : '';
  }, [location.search]);

  const openEditor = useCallback((id = null) => {
    const baseUrl = getEditorBaseUrl();
    const queryString = getQueryString();
    const path = id
      ? `/${appType}/editor/${id}`
      : `/${appType}/editor`;

    // Open editor in a new browser tab
    window.open(baseUrl + path + queryString, '_blank');
  }, [appType, getEditorBaseUrl, getQueryString]);

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
