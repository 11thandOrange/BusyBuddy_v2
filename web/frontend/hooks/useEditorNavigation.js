import { useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Hook for navigating to/from the editor.
 * Opens the editor in a new browser tab for a clean, standalone experience.
 */
export const useEditorNavigation = () => {
  const location = useLocation();

  // Build the base URL for the editor
  const getEditorBaseUrl = useCallback(() => {
    return window.location.origin;
  }, []);

  // Build query string preserving host param
  const getQueryString = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const host = params.get('host');
    return host ? `?host=${encodeURIComponent(host)}` : '';
  }, [location.search]);

  const openEditor = useCallback((barId = null) => {
    const baseUrl = getEditorBaseUrl();
    const queryString = getQueryString();
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';

    // Open editor in a new browser tab
    window.open(baseUrl + path + queryString, '_blank');
  }, [getEditorBaseUrl, getQueryString]);

  const closeEditor = useCallback(() => {
    // Close the current tab/window
    window.close();

    // Fallback: if window.close() is blocked (not opened via JS),
    // redirect to the list page
    const queryString = getQueryString();
    window.location.href = '/announcement-bar' + queryString;
  }, [getQueryString]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
