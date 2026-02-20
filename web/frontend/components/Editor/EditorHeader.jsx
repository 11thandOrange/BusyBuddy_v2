import React, { useState, useRef } from 'react';

/**
 * EditorHeader - Header with title, enable toggle, and action buttons
 * 
 * @param {string} title - Editable title
 * @param {function} onTitleChange - Callback when title changes
 * @param {boolean} enabled - Whether the feature is enabled
 * @param {function} onEnabledChange - Callback when enabled state changes
 * @param {function} onSave - Save button callback
 * @param {function} onDiscard - Discard button callback
 * @param {boolean} isLoading - Show loading state on save button
 * @param {string} saveText - Custom save button text (default: 'Save')
 * @param {string} discardText - Custom discard button text (default: 'Discard')
 */
export const EditorHeader = ({ 
  title,
  onTitleChange,
  enabled = true,
  onEnabledChange,
  onSave,
  onDiscard,
  isLoading = false,
  saveText = 'Save',
  discardText = 'Discard'
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef(null);

  const handlePencilClick = () => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  };

  return (
    <div className="title-header">
      <div className="title-left">
        <div className="editable-title-wrapper">
          <input
            ref={titleInputRef}
            type="text"
            className="editable-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onFocus={() => setIsEditingTitle(true)}
            onBlur={() => setIsEditingTitle(false)}
          />
          {!isEditingTitle && (
            <span className="pencil-icon" onClick={handlePencilClick} style={{ cursor: 'pointer' }}>✏️</span>
          )}
        </div>
        
        {onEnabledChange && (
          <label className="header-toggle" title="Enable/Disable">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        )}
      </div>
      
      <div className="header-right">
        {onDiscard && (
          <button 
            className="btn-discard" 
            onClick={onDiscard}
            disabled={isLoading}
          >
            {discardText}
          </button>
        )}
        {onSave && (
          <button 
            className="btn-save" 
            onClick={onSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : saveText}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * EditorRightContent - Container for header and preview panel
 */
export const EditorRightContent = ({ children }) => {
  return (
    <div className="right-content">
      {children}
    </div>
  );
};

export default EditorHeader;
