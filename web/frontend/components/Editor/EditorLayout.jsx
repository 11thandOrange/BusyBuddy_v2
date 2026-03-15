import React from 'react';
import './EditorLayout.css';

/**
 * EditorLayout - Main layout wrapper for the editor screen
 * Used by all apps that need the Liquid Glass editor interface
 * 
 * @param {React.ReactNode} children - Child components (sidepane and content)
 */
export const EditorLayout = ({ children }) => {
  return (
    <div className="editor-wrapper">
      <div className="gradient-bg" />
      <div className="editor-container">
        <div className="editor-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
