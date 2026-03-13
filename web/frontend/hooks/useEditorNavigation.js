import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useRef } from 'react';
import createApp from '@shopify/app-bridge';
import { Fullscreen } from '@shopify/app-bridge/actions';

// Store host param at module level to persist even when URL changes
let storedHost = null;

/**
 * Hook for navigating to/from the announcement bar editor.
 * Uses App Bridge v3 Fullscreen API to cover Shopify sidebar.
 * 
 * @returns {Object} Navigation functions
 * @returns {Function} openEditor - Opens editor in fullscreen (optionally with bar ID for editing)
 * @returns {Function} closeEditor - Exits fullscreen and returns to list
 */
export const useEditorNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store references to app and fullscreen instances
  const appRef = useRef(null);
  const fullscreenRef = useRef(null);
  
  // Capture host from current URL or use stored value
  const getHost = useCallback(() => {
    const urlHost = new URLSearchParams(location.search).get('host');
    if (urlHost) {
      storedHost = urlHost;
    }
    return storedHost || window.__SHOPIFY_DEV_HOST;
  }, [location.search]);

  // Get or create App Bridge app instance
  const getAppBridge = useCallback(() => {
    if (!appRef.current) {
      const host = getHost();
      const config = {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: host,
      };
      appRef.current = createApp(config);
    }
    return appRef.current;
  }, [getHost]);

  // Get or create Fullscreen instance
  const getFullscreen = useCallback(() => {
    if (!fullscreenRef.current) {
      const app = getAppBridge();
      fullscreenRef.current = Fullscreen.create(app);
    }
    return fullscreenRef.current;
  }, [getAppBridge]);

  // Build query string with host param
  const getQueryString = useCallback(() => {
    const host = getHost();
    if (host) {
      return `?host=${encodeURIComponent(host)}`;
    }
    return location.search || '';
  }, [getHost, location.search]);

  const openEditor = useCallback((barId = null) => {
    // Capture current host before navigation
    const queryString = getQueryString();
    
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';
    
    try {
      const fullscreen = getFullscreen();
      fullscreen.dispatch(Fullscreen.Action.ENTER);
    } catch (error) {
      console.error('Fullscreen enter error:', error);
    }
    
    navigate(path + queryString);
  }, [navigate, getFullscreen, getQueryString]);

  const closeEditor = useCallback(() => {
    // Capture host before any navigation
    const queryString = getQueryString();
    
    // Exit fullscreen
    try {
      const fullscreen = getFullscreen();
      fullscreen.dispatch(Fullscreen.Action.EXIT);
    } catch (error) {
      console.error('Fullscreen exit error:', error);
    }
    
    // Navigate back to announcement bar list page
    navigate('/announcement-bar' + queryString);
  }, [navigate, getFullscreen, getQueryString]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
