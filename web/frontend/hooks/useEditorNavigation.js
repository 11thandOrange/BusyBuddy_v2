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

  const openEditor = useCallback(async (barId = null) => {
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';
    
    // Enter fullscreen mode (App Bridge v4 API)
    try {
      console.log('Shopify object:', shopify);
      console.log('Fullscreen API:', shopify?.fullscreen);
      
      if (shopify?.fullscreen?.enter) {
        await shopify.fullscreen.enter();
        console.log('Fullscreen entered successfully');
      } else {
        console.warn('Fullscreen API not available');
      }
    } catch (error) {
      console.error('Fullscreen enter error:', error);
    }
    
    navigate(path);
  }, [navigate, shopify]);

  const closeEditor = useCallback(async () => {
    // Exit fullscreen mode (App Bridge v4 API)
    try {
      if (shopify?.fullscreen?.exit) {
        await shopify.fullscreen.exit();
      }
    } catch (error) {
      console.error('Fullscreen exit error:', error);
    }
    
    navigate('/announcement-bar');
  }, [navigate, shopify]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
