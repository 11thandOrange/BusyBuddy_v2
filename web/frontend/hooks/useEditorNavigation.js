import { useNavigate } from 'react-router-dom';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Fullscreen } from '@shopify/app-bridge/actions';
import { useCallback, useRef } from 'react';

/**
 * Hook for navigating to/from the editor with fullscreen support.
 * Enters fullscreen BEFORE navigation to avoid layout flash.
 * 
 * @returns {Object} Navigation functions
 * @returns {Function} openEditor - Opens editor (optionally with bar ID for editing)
 * @returns {Function} closeEditor - Closes editor and exits fullscreen
 */
export const useEditorNavigation = () => {
  const navigate = useNavigate();
  const app = useAppBridge();
  const fullscreenRef = useRef(null);

  const openEditor = useCallback((barId = null) => {
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';

    try {
      const fullscreen = Fullscreen.create(app);
      fullscreenRef.current = fullscreen;

      let hasNavigated = false;

      // Subscribe to fullscreen entry confirmation
      const unsubscribe = fullscreen.subscribe(Fullscreen.Action.ENTER, () => {
        if (!hasNavigated) {
          hasNavigated = true;
          unsubscribe();
          navigate(path);
        }
      });

      // Dispatch fullscreen enter
      fullscreen.dispatch(Fullscreen.Action.ENTER);

      // Fallback: If fullscreen doesn't respond within 500ms, navigate anyway
      // This handles cases where the app isn't embedded in Shopify admin
      setTimeout(() => {
        if (!hasNavigated) {
          hasNavigated = true;
          console.log('Fullscreen timeout - navigating without fullscreen');
          navigate(path);
        }
      }, 500);
    } catch (error) {
      // If App Bridge fails entirely, just navigate
      console.error('App Bridge error:', error);
      navigate(path);
    }
  }, [app, navigate]);

  const closeEditor = useCallback(() => {
    try {
      const fullscreen = fullscreenRef.current || Fullscreen.create(app);
      fullscreen.dispatch(Fullscreen.Action.EXIT);
    } catch (error) {
      console.error('Fullscreen exit error:', error);
    }
    navigate('/announcement-bar');
  }, [app, navigate]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
