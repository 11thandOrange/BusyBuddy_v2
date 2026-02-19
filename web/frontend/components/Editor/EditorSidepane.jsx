import React from 'react';

/**
 * EditorSidepane - Left sidepane with Liquid Glass styling
 * Contains category tabs, settings navigation, and config panel
 * 
 * @param {Array} tabs - Array of {id, label} for category tabs
 * @param {string} activeTab - Currently active tab id
 * @param {function} onTabChange - Callback when tab changes
 * @param {React.ReactNode} children - Settings pane and config panel
 */
export const EditorSidepane = ({ 
  tabs = [], 
  activeTab, 
  onTabChange, 
  children 
}) => {
  return (
    <div className="sidepane-container">
      {/* Category Tabs */}
      <div className="category-tab-header">
        <div className="category-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`category-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panels Row - Settings + Config */}
      <div className="panels-row">
        {children}
      </div>
    </div>
  );
};

export default EditorSidepane;
