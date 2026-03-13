import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import createApp from '@shopify/app-bridge';
import { Fullscreen, TitleBar, Button } from '@shopify/app-bridge/actions';

// Store instances at module level to persist across renders
let appInstance = null;
let fullscreenInstance = null;
let titleBarInstance = null;
let saveButton = null;
let discardButton = null;

// Callbacks for save/discard actions (set by the editor component)
let onSaveCallback = null;
let onDiscardCallback = null;

/**
 * Hook for navigating to/from the announcement bar editor.
 * Uses App Bridge v3 Fullscreen API to cover Shopify sidebar.
 * Adds Save/Discard buttons to Shopify's header via TitleBar API.
 * 
 * @returns {Object} Navigation functions and setters
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

  // Setup TitleBar with Save/Discard buttons
  const setupTitleBar = useCallback((title = 'Announcement Bar Editor') => {
    const app = getAppBridge();
    
    // Create Save button (primary action)
    saveButton = Button.create(app, { label: 'Save' });
    saveButton.subscribe(Button.Action.CLICK, () => {
      if (onSaveCallback) onSaveCallback();
    });

    // Create Discard button (secondary action)
    discardButton = Button.create(app, { label: 'Discard' });
    discardButton.subscribe(Button.Action.CLICK, () => {
      if (onDiscardCallback) onDiscardCallback();
    });

    // Create TitleBar with buttons
    titleBarInstance = TitleBar.create(app, {
      title: title,
      buttons: {
        primary: saveButton,
        secondary: [discardButton],
      },
    });
  }, [getAppBridge]);

  // Clear TitleBar when leaving editor
  const clearTitleBar = useCallback(() => {
    if (titleBarInstance) {
      const app = getAppBridge();
      // Reset to default title bar
      const defaultTitleBar = TitleBar.create(app, { title: '' });
      defaultTitleBar.dispatch(TitleBar.Action.UPDATE, { title: '' });
    }
    titleBarInstance = null;
    saveButton = null;
    discardButton = null;
  }, [getAppBridge]);

  const openEditor = useCallback((barId = null) => {
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';
    
    try {
      const fullscreen = getFullscreen();
      fullscreen.dispatch(Fullscreen.Action.ENTER);
      setupTitleBar(barId ? 'Edit Announcement Bar' : 'Create Announcement Bar');
    } catch (error) {
      console.error('Fullscreen enter error:', error);
    }
    
    navigate(path);
  }, [navigate, getFullscreen, setupTitleBar]);

  const closeEditor = useCallback(() => {
    clearTitleBar();
    
    try {
      const fullscreen = getFullscreen();
      fullscreen.dispatch(Fullscreen.Action.EXIT);
    } catch (error) {
      console.error('Fullscreen exit error:', error);
    }
    
    navigate('/');
  }, [navigate, getFullscreen, clearTitleBar]);

  // Set callbacks for save/discard buttons
  const setEditorCallbacks = useCallback((onSave, onDiscard) => {
    onSaveCallback = onSave;
    onDiscardCallback = onDiscard;
  }, []);

  return { openEditor, closeEditor, setEditorCallbacks };
};

export default useEditorNavigation;
