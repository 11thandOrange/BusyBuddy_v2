import React, { useState } from 'react';
import './AnnouncementBarEditor.css';

const contentSettings = [
  {
    title: 'Bar Type',
    items: [
      { id: 'type', icon: '📝', label: 'Announcement Type', iconClass: 'icon-type' },
    ],
  },
  {
    title: 'Message',
    items: [
      { id: 'message', icon: '💬', label: 'Message Text', iconClass: 'icon-message' },
      { id: 'emoji', icon: '😀', label: 'Emoji & Icons', iconClass: 'icon-emoji' },
    ],
  },
  {
    title: 'Timer',
    items: [
      { id: 'timer', icon: '⏱️', label: 'Countdown Timer', iconClass: 'icon-timer' },
    ],
  },
  {
    title: 'Call to Action',
    items: [
      { id: 'button', icon: '🔘', label: 'Shop Now Button', iconClass: 'icon-button' },
      { id: 'savebox', icon: '🏷️', label: 'Save Badge', iconClass: 'icon-badge' },
    ],
  },
];

export const AnnouncementBarEditor = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [activeSetting, setActiveSetting] = useState('type');
  const [barEnabled, setBarEnabled] = useState(true);
  const [title, setTitle] = useState('Summer Sale Banner');
  const [barType, setBarType] = useState('text');
  const [internalName, setInternalName] = useState('Summer Sale Banner');
  const [device, setDevice] = useState('desktop');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const tabs = [
    { id: 'content', label: 'Content' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'behavior', label: 'Behavior' },
    { id: 'schedule', label: 'Schedule' },
  ];

  const handleTitleFocus = () => setIsEditingTitle(true);
  const handleTitleBlur = () => setIsEditingTitle(false);

  return (
    <div className="editor-wrapper">
      <div className="gradient-bg" />
      
      <div className="editor-container">
        <div className="editor-content">
          {/* Left Sidepane */}
          <div className="sidepane-container">
            {/* Category Tabs */}
            <div className="category-tab-header">
              <div className="category-tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`category-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Panels Row */}
            <div className="panels-row">
              {/* Settings Pane */}
              <div className="settings-pane">
                <div className="settings-list">
                  {activeTab === 'content' && contentSettings.map((group) => (
                    <div key={group.title} className="settings-group">
                      <div className="settings-group-title">{group.title}</div>
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className={`settings-item ${activeSetting === item.id ? 'active' : ''}`}
                          onClick={() => setActiveSetting(item.id)}
                        >
                          <div className={`settings-item-icon ${item.iconClass}`}>
                            {item.icon}
                          </div>
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Config Panel */}
              <div className="config-panel">
                {activeSetting === 'type' && (
                  <div id="config-type">
                    <div className="config-header">
                      <h2>Announcement Type</h2>
                      <p>Choose what type of announcement to display</p>
                    </div>
                    <div className="config-content">
                      <div className="form-group">
                        <label className="form-label">Bar Type</label>
                        <select
                          className="form-select"
                          value={barType}
                          onChange={(e) => setBarType(e.target.value)}
                        >
                          <option value="text">Text Message</option>
                          <option value="countdown">Countdown Timer</option>
                          <option value="freeshipping">Free Shipping Progress</option>
                          <option value="orders">Orders Counter</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Internal Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g., Summer Sale Banner"
                          value={internalName}
                          onChange={(e) => setInternalName(e.target.value)}
                        />
                        <small className="form-hint">Only visible to you</small>
                      </div>

                      <div className="toggle-row">
                        <span className="toggle-label">Enable Bar</span>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={barEnabled}
                            onChange={(e) => setBarEnabled(e.target.checked)}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeSetting === 'message' && (
                  <div id="config-message">
                    <div className="config-header">
                      <h2>Message Text</h2>
                      <p>Configure your announcement message</p>
                    </div>
                    <div className="config-content">
                      <div className="form-group">
                        <label className="form-label">Message</label>
                        <textarea
                          className="form-textarea"
                          placeholder="Enter your announcement message..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="right-content">
            {/* Title Header */}
            <div className="title-header">
              <div className="title-left">
                <div className="editable-title-wrapper">
                  <input
                    type="text"
                    className="editable-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={handleTitleFocus}
                    onBlur={handleTitleBlur}
                  />
                  {!isEditingTitle && (
                    <span className="pencil-icon">✏️</span>
                  )}
                </div>
                <label className="header-toggle" title="Enable Bar">
                  <input
                    type="checkbox"
                    checked={barEnabled}
                    onChange={(e) => setBarEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="header-right">
                <button className="btn-discard">Discard</button>
                <button className="btn-save">Save</button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="preview-panel">
              <div className="preview-content">
                <div className={`device-frame ${device}`}>
                  {/* Announcement Bar */}
                  <div
                    className="announcement-bar-preview"
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    }}
                  >
                    <span className="announcement-message" style={{ color: '#fff' }}>
                      🔥 Summer Sale - Up to 50% OFF!
                    </span>
                  </div>

                  {/* Store Preview */}
                  <div className="store-preview">
                    <div className="store-header">
                      <div className="store-logo">STORE</div>
                      <div className="store-nav">
                        <a href="#">Home</a>
                        <a href="#">Shop</a>
                        <a href="#">About</a>
                        <a href="#">Contact</a>
                      </div>
                    </div>

                    <div className="product-grid">
                      <div className="product-card">
                        <div className="product-image" />
                        <div className="product-info">
                          <div className="product-name">Classic T-Shirt</div>
                          <div className="product-price">$29.99</div>
                        </div>
                      </div>
                      <div className="product-card">
                        <div className="product-image" />
                        <div className="product-info">
                          <div className="product-name">Denim Jacket</div>
                          <div className="product-price">$89.99</div>
                        </div>
                      </div>
                      <div className="product-card">
                        <div className="product-image" />
                        <div className="product-info">
                          <div className="product-name">Sneakers</div>
                          <div className="product-price">$119.99</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Toggle */}
              <div className="preview-footer">
                <div className="device-toggle">
                  <button
                    className={`device-btn ${device === 'desktop' ? 'active' : ''}`}
                    onClick={() => setDevice('desktop')}
                  >
                    <span className="device-icon">🖥</span>
                    Desktop
                  </button>
                  <button
                    className={`device-btn ${device === 'mobile' ? 'active' : ''}`}
                    onClick={() => setDevice('mobile')}
                  >
                    <span className="device-icon">📱</span>
                    Mobile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBarEditor;
