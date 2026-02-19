import React from 'react';

/**
 * EditorSettingsPane - Left navigation panel with setting categories
 * 
 * @param {Array} groups - Array of setting groups with structure:
 *   { title: string, items: [{ id, icon, label, iconClass }] }
 * @param {string} activeSetting - Currently selected setting id
 * @param {function} onSettingChange - Callback when setting is selected
 */
export const EditorSettingsPane = ({ 
  groups = [], 
  activeSetting, 
  onSettingChange 
}) => {
  return (
    <div className="settings-pane">
      <div className="settings-list">
        {groups.map((group) => (
          <div key={group.title} className="settings-group">
            <div className="settings-group-title">{group.title}</div>
            {group.items.map((item) => (
              <div
                key={item.id}
                className={`settings-item ${activeSetting === item.id ? 'active' : ''}`}
                onClick={() => onSettingChange(item.id)}
              >
                <div className={`settings-item-icon ${item.iconClass || ''}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorSettingsPane;
