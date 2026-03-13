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
    const fullscreen = Fullscreen.create(app);
    fullscreenRef.current = fullscreen;

    // Subscribe to fullscreen entry confirmation
    const unsubscribe = fullscreen.subscribe(Fullscreen.Action.ENTER, () => {
      unsubscribe();
      // Navigate AFTER fullscreen is ready (no flash)
      const path = barId
        ? `/announcement-bar/editor/${barId}`
        : '/announcement-bar/editor';
      navigate(path);
    });

    // Dispatch fullscreen enter
    fullscreen.dispatch(Fullscreen.Action.ENTER);
  }, [app, navigate]);

  const closeEditor = useCallback(() => {
    const fullscreen = fullscreenRef.current || Fullscreen.create(app);
    fullscreen.dispatch(Fullscreen.Action.EXIT);
    navigate('/announcement-bar');
  }, [app, navigate]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
