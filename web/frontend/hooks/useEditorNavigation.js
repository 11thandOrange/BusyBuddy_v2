import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useRef } from 'react';
import createApp from '@shopify/app-bridge';
import { Fullscreen } from '@shopify/app-bridge/actions';

// Store host param at module level to persist even when URL changes
let storedHost = null;

/**
 * Hook for navigating to/from the announcement bar editor.
 * Uses App Bridge Fullscreen to cover Shopify sidebar.
 * The Shopify fullscreen header is hidden via CSS in the editor component.
 */
export const useEditorNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Get or create App Bridge instance
  const getAppBridge = useCallback(() => {
    if (!appRef.current) {
      const host = getHost();
      if (!host) return null;
      appRef.current = createApp({
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: host,
      });
    }
    return appRef.current;
  }, [getHost]);

  // Get or create Fullscreen instance
  const getFullscreen = useCallback(() => {
    if (!fullscreenRef.current) {
      const app = getAppBridge();
      if (!app) return null;
      fullscreenRef.current = Fullscreen.create(app);
    }
    return fullscreenRef.current;
  }, [getAppBridge]);

  // Build query string with host param
  const getQueryString = useCallback(() => {
    const host = getHost();
    return host ? `?host=${encodeURIComponent(host)}` : (location.search || '');
  }, [getHost, location.search]);

  const openEditor = useCallback((barId = null) => {
    const queryString = getQueryString();
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';
    
    // Enter fullscreen to cover Shopify sidebar
    try {
      const fullscreen = getFullscreen();
      if (fullscreen) {
        fullscreen.dispatch(Fullscreen.Action.ENTER);
      }
    } catch (error) {
      console.error('Fullscreen enter error:', error);
    }
    
    navigate(path + queryString);
  }, [navigate, getFullscreen, getQueryString]);

  const closeEditor = useCallback(() => {
    const queryString = getQueryString();
    
    // Exit fullscreen
    try {
      const fullscreen = getFullscreen();
      if (fullscreen) {
        fullscreen.dispatch(Fullscreen.Action.EXIT);
      }
    } catch (error) {
      console.error('Fullscreen exit error:', error);
    }
    
    navigate('/announcement-bar' + queryString);
  }, [navigate, getFullscreen, getQueryString]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
