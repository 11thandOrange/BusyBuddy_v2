import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Hook for navigating to/from the announcement bar editor.
 * 
 * @returns {Object} Navigation functions
 * @returns {Function} openEditor - Opens editor (optionally with bar ID for editing)
 * @returns {Function} closeEditor - Closes editor and returns to list
 */
export const useEditorNavigation = () => {
  const navigate = useNavigate();

  const openEditor = useCallback((barId = null) => {
    const path = barId
      ? `/announcement-bar/editor/${barId}`
      : '/announcement-bar/editor';
    navigate(path);
  }, [navigate]);

  const closeEditor = useCallback(() => {
    navigate('/announcement-bar');
  }, [navigate]);

  return { openEditor, closeEditor };
};

export default useEditorNavigation;
