import { useNavigate } from 'react-router-dom';
import { useCallback, useRef } from 'react';
import createApp from '@shopify/app-bridge';
import { Fullscreen } from '@shopify/app-bridge/actions';

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
  const fullscreenRef = useRef(null);

  // Create App Bridge app instance (v3 pattern - same as Plan.jsx)
  const getAppBridge = useCallback(() => {
    const config = {
      apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
      host: new URLSearchParams(location.search).get('host') || window.__SHOPIFY_DEV_HOST,
    };
    return createApp(config);
  }, []);

  const openEditor = useCallback((barId = null) => {
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';
    
    try {
      const app = getAppBridge();
      const fullscreen = Fullscreen.create(app);
      fullscreenRef.current = fullscreen;
      
      // Enter fullscreen mode
      fullscreen.dispatch(Fullscreen.Action.ENTER);
      console.log('Fullscreen ENTER dispatched');
    } catch (error) {
      console.error('Fullscreen enter error:', error);
    }
    
    navigate(path);
  }, [navigate, getAppBridge]);

  const closeEditor = useCallback(() => {
    try {
      if (fullscreenRef.current) {
        fullscreenRef.current.dispatch(Fullscreen.Action.EXIT);
        console.log('Fullscreen EXIT dispatched');
      } else {
        // Create new instance if ref not available
        const app = getAppBridge();
        const fullscreen = Fullscreen.create(app);
        fullscreen.dispatch(Fullscreen.Action.EXIT);
      }
    } catch (error) {
      console.error('Fullscreen exit error:', error);
    }
    
    navigate('/announcement-bar');
  }, [navigate, getAppBridge]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
