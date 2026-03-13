import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useRef, useEffect } from 'react';
import createApp from '@shopify/app-bridge';
import { Fullscreen } from '@shopify/app-bridge/actions';

// Store host param at module level to persist even when URL changes
let storedHost = null;
// Track if we intentionally exited (Save/Discard) vs X button
let intentionalExit = false;

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
  const unsubscribeRef = useRef(null);
  
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

  // Handle X button click - subscribe to fullscreen changes
  useEffect(() => {
    // Only set up if we're in the editor
    if (!location.pathname.includes('/announcement-bar/editor')) {
      intentionalExit = false;
      return;
    }

    const setupSubscription = () => {
      try {
        const fullscreen = getFullscreen();
        
        // Clean up previous subscription
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
        
        // Subscribe to fullscreen exit
        unsubscribeRef.current = fullscreen.subscribe(Fullscreen.Action.EXIT, () => {
          // Only redirect if this wasn't triggered by our own closeEditor
          if (!intentionalExit) {
            const host = storedHost || window.__SHOPIFY_DEV_HOST;
            const queryString = host ? `?host=${encodeURIComponent(host)}` : '';
            // Use window.location for more reliable navigation after X click
            window.location.href = `/announcement-bar${queryString}`;
          }
          intentionalExit = false;
        });
      } catch (error) {
        console.error('Fullscreen subscription error:', error);
      }
    };

    // Small delay to ensure App Bridge is ready
    const timeoutId = setTimeout(setupSubscription, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [location.pathname, getFullscreen]);

  const openEditor = useCallback((barId = null) => {
    // Capture current host before navigation
    const queryString = getQueryString();
    
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';
    
    intentionalExit = false;
    
    try {
      const fullscreen = getFullscreen();
      fullscreen.dispatch(Fullscreen.Action.ENTER);
    } catch (error) {
      console.error('Fullscreen enter error:', error);
    }
    
    navigate(path + queryString);
  }, [navigate, getFullscreen, getQueryString]);

  const closeEditor = useCallback(() => {
    // Mark this as an intentional exit so subscription doesn't double-navigate
    intentionalExit = true;
    
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
