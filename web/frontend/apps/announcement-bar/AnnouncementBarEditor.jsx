import React, { useState } from 'react';
import {
  EditorLayout,
  EditorSidepane,
  EditorSettingsPane,
  EditorConfigPanel,
  ConfigFormGroup,
  ConfigInput,
  ConfigSelect,
  ConfigTextarea,
  ConfigToggleRow,
  EditorPreviewPanel,
  StorePreview,
  EditorHeader,
  EditorRightContent
} from '../../components/Editor';

// Announcement Bar specific settings configuration
const ANNOUNCEMENT_BAR_SETTINGS = {
  content: [
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
  ],
  appearance: [
    {
      title: 'Colors',
      items: [
        { id: 'background', icon: '🎨', label: 'Background', iconClass: 'icon-type' },
        { id: 'text-color', icon: '✏️', label: 'Text Color', iconClass: 'icon-message' },
      ],
    },
    {
      title: 'Typography',
      items: [
        { id: 'font', icon: '🔤', label: 'Font Settings', iconClass: 'icon-emoji' },
      ],
    },
  ],
  behavior: [
    {
      title: 'Display',
      items: [
        { id: 'position', icon: '📍', label: 'Position', iconClass: 'icon-type' },
        { id: 'animation', icon: '✨', label: 'Animation', iconClass: 'icon-button' },
      ],
    },
  ],
  schedule: [
    {
      title: 'Timing',
      items: [
        { id: 'start-date', icon: '📅', label: 'Start Date', iconClass: 'icon-timer' },
        { id: 'end-date', icon: '🏁', label: 'End Date', iconClass: 'icon-badge' },
      ],
    },
  ],
};

const TABS = [
  { id: 'content', label: 'Content' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'behavior', label: 'Behavior' },
  { id: 'schedule', label: 'Schedule' },
];

const BAR_TYPE_OPTIONS = [
  { value: 'text', label: 'Text Message' },
  { value: 'countdown', label: 'Countdown Timer' },
  { value: 'freeshipping', label: 'Free Shipping Progress' },
  { value: 'orders', label: 'Orders Counter' },
];

/**
 * AnnouncementBarEditor - Editor for Announcement Bar app
 * Uses reusable Editor components with app-specific configuration
 */
export const AnnouncementBarEditor = ({ 
  editingBar,
  onSave,
  onDiscard 
}) => {
  // Tab and setting navigation state
  const [activeTab, setActiveTab] = useState('content');
  const [activeSetting, setActiveSetting] = useState('type');
  const [device, setDevice] = useState('desktop');
  
  // Form state
  const [title, setTitle] = useState(editingBar?.name || 'Summer Sale Banner');
  const [barEnabled, setBarEnabled] = useState(editingBar?.status === 'active' ?? true);
  const [barType, setBarType] = useState(editingBar?.barType || 'text');
  const [internalName, setInternalName] = useState(editingBar?.name || 'Summer Sale Banner');
  const [message, setMessage] = useState(editingBar?.message || '🔥 Summer Sale - Up to 50% OFF!');
  const [backgroundColor, setBackgroundColor] = useState(editingBar?.backgroundColor || '#667eea');

  // Get settings for current tab
  const currentSettings = ANNOUNCEMENT_BAR_SETTINGS[activeTab] || [];

  // Handle save
  const handleSave = () => {
    const data = {
      name: internalName,
      status: barEnabled ? 'active' : 'inactive',
      barType,
      message,
      backgroundColor,
    };
    onSave?.(data);
  };

  // Render config panel content based on active setting
  const renderConfigContent = () => {
    switch (activeSetting) {
      case 'type':
        return (
          <EditorConfigPanel
            title="Announcement Type"
            description="Choose what type of announcement to display"
          >
            <ConfigFormGroup label="Bar Type">
              <ConfigSelect
                value={barType}
                onChange={(e) => setBarType(e.target.value)}
                options={BAR_TYPE_OPTIONS}
              />
            </ConfigFormGroup>

            <ConfigFormGroup label="Internal Name" hint="Only visible to you">
              <ConfigInput
                value={internalName}
                onChange={(e) => setInternalName(e.target.value)}
                placeholder="e.g., Summer Sale Banner"
              />
            </ConfigFormGroup>

            <ConfigToggleRow
              label="Enable Bar"
              checked={barEnabled}
              onChange={setBarEnabled}
            />
          </EditorConfigPanel>
        );

      case 'message':
        return (
          <EditorConfigPanel
            title="Message Text"
            description="Configure your announcement message"
          >
            <ConfigFormGroup label="Message">
              <ConfigTextarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your announcement message..."
                rows={3}
              />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      default:
        return (
          <EditorConfigPanel
            title="Coming Soon"
            description="This setting panel is under development"
          >
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              Configure {activeSetting} settings here.
            </p>
          </EditorConfigPanel>
        );
    }
  };

  // Render announcement bar preview
  const renderAnnouncementBar = () => (
    <div
      className="announcement-bar-preview"
      style={{
        background: `linear-gradient(135deg, ${backgroundColor}, #764ba2)`,
      }}
    >
      <span className="announcement-message" style={{ color: '#fff' }}>
        {message}
      </span>
    </div>
  );

  return (
    <EditorLayout>
      {/* Left Sidepane */}
      <EditorSidepane
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <EditorSettingsPane
          groups={currentSettings}
          activeSetting={activeSetting}
          onSettingChange={setActiveSetting}
        />
        {renderConfigContent()}
      </EditorSidepane>

      {/* Right Content Area */}
      <EditorRightContent>
        <EditorHeader
          title={title}
          onTitleChange={setTitle}
          enabled={barEnabled}
          onEnabledChange={setBarEnabled}
          onSave={handleSave}
          onDiscard={onDiscard}
        />
        
        <EditorPreviewPanel
          device={device}
          onDeviceChange={setDevice}
        >
          <StorePreview
            announcementBar={renderAnnouncementBar()}
          />
        </EditorPreviewPanel>
      </EditorRightContent>
    </EditorLayout>
  );
};

export default AnnouncementBarEditor;
