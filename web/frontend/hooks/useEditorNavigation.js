import { useNavigate } from 'react-router-dom';
import { useAppBridge } from '@shopify/app-bridge-react';
import { useCallback } from 'react';

/**
 * Hook for navigating to/from the announcement bar editor.
 * Uses App Bridge v4 fullscreen API to cover Shopify sidebar.
 * 
 * @returns {Object} Navigation functions
 * @returns {Function} openEditor - Opens editor in fullscreen (optionally with bar ID for editing)
 * @returns {Function} closeEditor - Exits fullscreen and returns to list
 */
export const useEditorNavigation = () => {
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const openEditor = useCallback((barId = null) => {
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';
    
    // Enter fullscreen mode (App Bridge v4 API)
    shopify.fullscreen.enter();
    navigate(path);
  }, [navigate, shopify]);

  const closeEditor = useCallback(() => {
    // Exit fullscreen mode (App Bridge v4 API)
    shopify.fullscreen.exit();
    navigate('/announcement-bar');
  }, [navigate, shopify]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
