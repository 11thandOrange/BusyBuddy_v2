import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import createApp from '@shopify/app-bridge';
import { Fullscreen } from '@shopify/app-bridge/actions';

// Store app and fullscreen instances at module level to persist across renders
let appInstance = null;
let fullscreenInstance = null;

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

  // Get or create App Bridge app instance
  const getAppBridge = useCallback(() => {
    if (!appInstance) {
      const config = {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: new URLSearchParams(location.search).get('host') || window.__SHOPIFY_DEV_HOST,
      };
      appInstance = createApp(config);
    }
    return appInstance;
  }, []);

  // Get or create Fullscreen instance
  const getFullscreen = useCallback(() => {
    if (!fullscreenInstance) {
      const app = getAppBridge();
      fullscreenInstance = Fullscreen.create(app);
    }
    return fullscreenInstance;
  }, [getAppBridge]);

  const openEditor = useCallback((barId = null) => {
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';
    
    try {
      const fullscreen = getFullscreen();
      fullscreen.dispatch(Fullscreen.Action.ENTER);
    } catch (error) {
      console.error('Fullscreen enter error:', error);
    }
    
    navigate(path);
  }, [navigate, getFullscreen]);

  const closeEditor = useCallback(() => {
    const fullscreen = getFullscreen();
    
    // Subscribe to EXIT event to navigate after fullscreen exits
    const unsubscribe = fullscreen.subscribe(Fullscreen.Action.EXIT, () => {
      unsubscribe();
      navigate('/');
    });
    
    // Dispatch EXIT action
    fullscreen.dispatch(Fullscreen.Action.EXIT);
  }, [navigate, getFullscreen]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
