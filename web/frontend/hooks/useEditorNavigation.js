import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useRef, useEffect } from 'react';
import createApp from '@shopify/app-bridge';
import { Fullscreen } from '@shopify/app-bridge/actions';

// Store host param at module level to persist even when URL changes
let storedHost = null;
// Track if we're currently in editor to handle X button clicks
let isInEditor = false;
// Store unsubscribe function
let fullscreenUnsubscribe = null;

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

  // Subscribe to fullscreen exit events (handles X button clicks)
  useEffect(() => {
    // Only set up subscription if we're in the editor
    if (!location.pathname.includes('/announcement-bar/editor')) {
      return;
    }

    try {
      const fullscreen = getFullscreen();
      
      // Unsubscribe from previous subscription if exists
      if (fullscreenUnsubscribe) {
        fullscreenUnsubscribe();
      }
      
      // Subscribe to fullscreen state changes
      fullscreenUnsubscribe = fullscreen.subscribe(Fullscreen.Action.EXIT, () => {
        // When X button is clicked, Shopify exits fullscreen
        // We need to navigate back to the list page
        if (isInEditor) {
          const queryString = getQueryString();
          navigate('/announcement-bar' + queryString);
        }
      });
      
      isInEditor = true;
      
      return () => {
        if (fullscreenUnsubscribe) {
          fullscreenUnsubscribe();
          fullscreenUnsubscribe = null;
        }
      };
    } catch (error) {
      console.error('Fullscreen subscription error:', error);
    }
  }, [location.pathname, getFullscreen, getQueryString, navigate]);

  const openEditor = useCallback((barId = null) => {
    // Capture current host before navigation
    const queryString = getQueryString();
    
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';
    
    isInEditor = true;
    
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
    
    isInEditor = false;
    
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
