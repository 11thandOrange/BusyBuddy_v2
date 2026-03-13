import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Fullscreen } from '@shopify/app-bridge/actions';
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
import { useEditorNavigation } from '../../hooks';

// Announcement Bar specific settings configuration
// Settings configuration for AnnouncementBar editor - Animation removed
const ANNOUNCEMENT_BAR_SETTINGS = {
  content: [
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
    {
      title: 'Dimensions',
      items: [
        { id: 'dimensions', icon: '📐', label: 'Bar Size', iconClass: 'icon-timer' },
      ],
    },
  ],
  behavior: [
    {
      title: 'Display',
      items: [
        { id: 'position', icon: '📍', label: 'Position', iconClass: 'icon-type' },
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

const POSITION_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'top-fixed', label: 'Top (Fixed)' },
  { value: 'bottom', label: 'Bottom' },
];

const FONT_FAMILY_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
];

const FONT_WEIGHT_OPTIONS = [
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
];

const THEME_OPTIONS = [
  { value: 'solid', label: 'Solid Color' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'sunshine', label: 'Sunshine' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'abstract', label: 'Abstract' },
];

/**
 * AnnouncementBarEditor - Editor for Announcement Bar app
 * Uses reusable Editor components with app-specific configuration
 * 
 * Rendered as a dedicated route with fullscreen mode.
 * URL: /announcement-bar/editor/:id (edit) or /announcement-bar/editor (create)
 */
export const AnnouncementBarEditor = () => {
  // Get bar ID from URL params (if editing existing bar)
  const { id } = useParams();
  const { closeEditor } = useEditorNavigation();
  const app = useAppBridge();
  
  // Loading state for fetching bar data
  const [isLoading, setIsLoading] = useState(!!id);
  const [editingBar, setEditingBar] = useState(null);

  // Tab and setting navigation state
  const [activeTab, setActiveTab] = useState('content');
  const [activeSetting, setActiveSetting] = useState('message');
  const [device, setDevice] = useState('desktop');
  
  // === CONTENT SETTINGS ===
  // Bar Type
  const [barEnabled, setBarEnabled] = useState(true);
  const [barType, setBarType] = useState('text');
  const [internalName, setInternalName] = useState('Summer Sale Banner');
  const [title, setTitle] = useState('Summer Sale Banner');
  
  // Message
  const [message, setMessage] = useState(editingBar?.message || '🔥 Summer Sale - Up to 50% OFF!');
  const [showMessage, setShowMessage] = useState(true);
  
  // Emoji
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [emojiPosition, setEmojiPosition] = useState('start');
  
  // Timer
  const [showTimer, setShowTimer] = useState(false);
  const [timerEndDate, setTimerEndDate] = useState('');
  const [timerEndTime, setTimerEndTime] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Shop Now Button
  const [showShopNowButton, setShowShopNowButton] = useState(false);
  const [shopNowButtonText, setShopNowButtonText] = useState('Shop Now');
  const [shopNowButtonColor, setShopNowButtonColor] = useState('#ffffff');
  const [shopNowButtonBgColor, setShopNowButtonBgColor] = useState('#000000');
  
  // Save Badge
  const [showSaveBox, setShowSaveBox] = useState(false);
  const [saveBoxText, setSaveBoxText] = useState('SAVE 30%');
  const [saveBoxBgColor, setSaveBoxBgColor] = useState('#ff4444');
  const [saveBoxTextColor, setSaveBoxTextColor] = useState('#ffffff');

  // === APPEARANCE SETTINGS ===
  // Background
  const [backgroundType, setBackgroundType] = useState('gradient');
  const [backgroundColor, setBackgroundColor] = useState('#667eea');
  const [gradientEndColor, setGradientEndColor] = useState('#764ba2');
  
  // Text Color
  const [textColor, setTextColor] = useState('#ffffff');
  
  // Typography
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontWeight, setFontWeight] = useState('600');
  
  // Dimensions
  const [barHeight, setBarHeight] = useState(50);
  const [barPadding, setBarPadding] = useState(12);

  // === BEHAVIOR SETTINGS ===
  // Position
  const [barPosition, setBarPosition] = useState('top');
  
  // Animation
  const [animateMessage] = useState(false); // Animation disabled - not exposed to users
  const [animationSpeed, setAnimationSpeed] = useState(20);

  // === SCHEDULE SETTINGS ===
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch bar data if editing (id from URL params)
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchBar = async () => {
      try {
        const response = await fetch(`/api/announcement-bars/${id}`);
        if (!response.ok) throw new Error('Failed to fetch bar');
        const data = await response.json();
        const bar = data?.data;
        
        if (bar) {
          setEditingBar(bar);
          // Populate form state from fetched data
          setBarEnabled(bar.status === 'active');
          setBarType(bar.barType || 'text');
          setInternalName(bar.name || 'Summer Sale Banner');
          setTitle(bar.name || 'Summer Sale Banner');
          setMessage(bar.message || '🔥 Summer Sale - Up to 50% OFF!');
          setBackgroundColor(bar.backgroundColor || '#667eea');
          setGradientEndColor(bar.gradientEndColor || '#764ba2');
          setBackgroundType(bar.backgroundType || 'gradient');
          setTextColor(bar.textColor || '#ffffff');
          setFontSize(bar.fontSize || '16');
          setFontFamily(bar.fontFamily || 'Inter');
          setFontWeight(bar.fontWeight || '600');
          setBarHeight(bar.barHeight || 50);
          setBarPadding(bar.barPadding || 12);
          setBarPosition(bar.barPosition || 'top');
          setShowTimer(bar.showTimer || false);
          setShowShopNowButton(bar.showShopNowButton || false);
          setShopNowButtonText(bar.shopNowButtonText || 'Shop Now');
          setShowSaveBox(bar.showSaveBox || false);
          setSaveBoxText(bar.saveBoxText || 'SAVE 30%');
        }
      } catch (err) {
        console.error('Error fetching bar:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBar();
  }, [id]);

  // Timer countdown effect
  useEffect(() => {
    if (!showTimer || !timerEndDate || !timerEndTime) return;
    
    const targetDate = new Date(`${timerEndDate}T${timerEndTime}`);
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }
      
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [showTimer, timerEndDate, timerEndTime]);

  // Get settings for current tab
  const currentSettings = ANNOUNCEMENT_BAR_SETTINGS[activeTab] || [];

  // Handle tab change - reset to first setting
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const firstSetting = ANNOUNCEMENT_BAR_SETTINGS[tabId]?.[0]?.items?.[0]?.id;
    if (firstSetting) setActiveSetting(firstSetting);
  };

  // Handle save
  const handleSave = async () => {
    const data = {
      name: internalName,
      status: barEnabled ? 'active' : 'inactive',
      barType,
      message,
      showMessage,
      backgroundColor,
      gradientEndColor,
      backgroundType,
      textColor,
      fontSize,
      fontFamily,
      fontWeight,
      barHeight,
      barPadding,
      barPosition,
      animateMessage,
      animationSpeed,
      showTimer,
      timerEndDate,
      timerEndTime,
      showShopNowButton,
      shopNowButtonText,
      shopNowButtonColor,
      shopNowButtonBgColor,
      showSaveBox,
      saveBoxText,
      saveBoxBgColor,
      saveBoxTextColor,
      startDate,
      endDate,
    };

    try {
      const url = id ? `/api/announcement-bars/${id}` : '/api/announcement-bars';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Save failed');
      
      // Close editor and return to list (exits fullscreen)
      closeEditor();
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save announcement bar');
    }
  };

  const handleDiscard = () => {
    closeEditor();
  };

  // Get background style
  const getBackgroundStyle = () => {
    if (backgroundType === 'gradient') {
      return `linear-gradient(135deg, ${backgroundColor}, ${gradientEndColor})`;
    }
    return backgroundColor;
  };

  // Render config panel content based on active setting
  const renderConfigContent = () => {
    switch (activeSetting) {
      // === CONTENT TAB ===
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
                onChange={(e) => {
                  setInternalName(e.target.value);
                  setTitle(e.target.value);
                }}
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
            <ConfigToggleRow
              label="Show Message"
              checked={showMessage}
              onChange={setShowMessage}
            />
            
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

      case 'emoji':
        return (
          <EditorConfigPanel
            title="Emoji & Icons"
            description="Add emojis to your announcement"
          >
            <ConfigFormGroup label="Quick Emojis">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['🔥', '⭐', '🎉', '💥', '🚀', '💰', '🎁', '⚡', '❤️', '✨'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setMessage(prev => prev + emoji)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '20px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'timer':
        return (
          <EditorConfigPanel
            title="Countdown Timer"
            description="Add urgency with a countdown timer"
          >
            <ConfigToggleRow
              label="Show Timer"
              checked={showTimer}
              onChange={setShowTimer}
            />
            
            {showTimer && (
              <>
                <ConfigFormGroup label="End Date">
                  <ConfigInput
                    type="date"
                    value={timerEndDate}
                    onChange={(e) => setTimerEndDate(e.target.value)}
                  />
                </ConfigFormGroup>
                
                <ConfigFormGroup label="End Time">
                  <ConfigInput
                    type="time"
                    value={timerEndTime}
                    onChange={(e) => setTimerEndTime(e.target.value)}
                  />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'button':
        return (
          <EditorConfigPanel
            title="Shop Now Button"
            description="Add a call-to-action button"
          >
            <ConfigToggleRow
              label="Show Button"
              checked={showShopNowButton}
              onChange={setShowShopNowButton}
            />
            
            {showShopNowButton && (
              <>
                <ConfigFormGroup label="Button Text">
                  <ConfigInput
                    value={shopNowButtonText}
                    onChange={(e) => setShopNowButtonText(e.target.value)}
                    placeholder="Shop Now"
                  />
                </ConfigFormGroup>
                
                <ConfigFormGroup label="Text Color">
                  <ConfigInput
                    type="color"
                    value={shopNowButtonColor}
                    onChange={(e) => setShopNowButtonColor(e.target.value)}
                  />
                </ConfigFormGroup>
                
                <ConfigFormGroup label="Background Color">
                  <ConfigInput
                    type="color"
                    value={shopNowButtonBgColor}
                    onChange={(e) => setShopNowButtonBgColor(e.target.value)}
                  />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'savebox':
        return (
          <EditorConfigPanel
            title="Save Badge"
            description="Highlight your discount with a badge"
          >
            <ConfigToggleRow
              label="Show Save Badge"
              checked={showSaveBox}
              onChange={setShowSaveBox}
            />
            
            {showSaveBox && (
              <>
                <ConfigFormGroup label="Badge Text">
                  <ConfigInput
                    value={saveBoxText}
                    onChange={(e) => setSaveBoxText(e.target.value)}
                    placeholder="SAVE 30%"
                  />
                </ConfigFormGroup>
                
                <ConfigFormGroup label="Badge Color">
                  <ConfigInput
                    type="color"
                    value={saveBoxBgColor}
                    onChange={(e) => setSaveBoxBgColor(e.target.value)}
                  />
                </ConfigFormGroup>
                
                <ConfigFormGroup label="Text Color">
                  <ConfigInput
                    type="color"
                    value={saveBoxTextColor}
                    onChange={(e) => setSaveBoxTextColor(e.target.value)}
                  />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      // === APPEARANCE TAB ===
      case 'background':
        return (
          <EditorConfigPanel
            title="Background"
            description="Customize the bar background"
          >
            <ConfigFormGroup label="Background Type">
              <ConfigSelect
                value={backgroundType}
                onChange={(e) => setBackgroundType(e.target.value)}
                options={THEME_OPTIONS}
              />
            </ConfigFormGroup>
            
            <ConfigFormGroup label="Primary Color">
              <ConfigInput
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </ConfigFormGroup>
            
            {backgroundType === 'gradient' && (
              <ConfigFormGroup label="Gradient End Color">
                <ConfigInput
                  type="color"
                  value={gradientEndColor}
                  onChange={(e) => setGradientEndColor(e.target.value)}
                />
              </ConfigFormGroup>
            )}
          </EditorConfigPanel>
        );

      case 'text-color':
        return (
          <EditorConfigPanel
            title="Text Color"
            description="Customize the text color"
          >
            <ConfigFormGroup label="Message Text Color">
              <ConfigInput
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'font':
        return (
          <EditorConfigPanel
            title="Font Settings"
            description="Customize typography"
          >
            <ConfigFormGroup label="Font Family">
              <ConfigSelect
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                options={FONT_FAMILY_OPTIONS}
              />
            </ConfigFormGroup>
            
            <ConfigFormGroup label="Font Size (px)">
              <ConfigInput
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                min="10"
                max="32"
              />
            </ConfigFormGroup>
            
            <ConfigFormGroup label="Font Weight">
              <ConfigSelect
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                options={FONT_WEIGHT_OPTIONS}
              />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'dimensions':
        return (
          <EditorConfigPanel
            title="Bar Size"
            description="Adjust bar dimensions"
          >
            <ConfigFormGroup label="Bar Height (px)">
              <ConfigInput
                type="number"
                value={barHeight}
                onChange={(e) => setBarHeight(Number(e.target.value))}
                min="30"
                max="200"
              />
            </ConfigFormGroup>
            
            <ConfigFormGroup label="Padding (px)">
              <ConfigInput
                type="number"
                value={barPadding}
                onChange={(e) => setBarPadding(Number(e.target.value))}
                min="0"
                max="40"
              />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      // === BEHAVIOR TAB ===
      case 'position':
        return (
          <EditorConfigPanel
            title="Position"
            description="Where should the bar appear?"
          >
            <ConfigFormGroup label="Bar Position">
              <ConfigSelect
                value={barPosition}
                onChange={(e) => setBarPosition(e.target.value)}
                options={POSITION_OPTIONS}
              />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      // === SCHEDULE TAB ===
      case 'start-date':
        return (
          <EditorConfigPanel
            title="Start Date"
            description="When should the bar start showing?"
          >
            <ConfigFormGroup label="Date">
              <ConfigInput
                type="date"
                value={startDate.split('T')[0] || ''}
                onChange={(e) => {
                  const time = startDate.split('T')[1] || '00:00';
                  setStartDate(e.target.value ? `${e.target.value}T${time}` : '');
                }}
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Time">
              <ConfigInput
                type="time"
                value={startDate.split('T')[1] || ''}
                onChange={(e) => {
                  const date = startDate.split('T')[0] || new Date().toISOString().split('T')[0];
                  setStartDate(`${date}T${e.target.value}`);
                }}
              />
            </ConfigFormGroup>
            {startDate && (
              <div style={{ 
                marginTop: '12px', 
                padding: '10px', 
                background: 'rgba(52, 199, 89, 0.1)', 
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '13px'
              }}>
                📅 Starts: {new Date(startDate).toLocaleString()}
              </div>
            )}
          </EditorConfigPanel>
        );

      case 'end-date':
        return (
          <EditorConfigPanel
            title="End Date"
            description="When should the bar stop showing?"
          >
            <ConfigFormGroup label="Date">
              <ConfigInput
                type="date"
                value={endDate.split('T')[0] || ''}
                onChange={(e) => {
                  const time = endDate.split('T')[1] || '23:59';
                  setEndDate(e.target.value ? `${e.target.value}T${time}` : '');
                }}
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Time">
              <ConfigInput
                type="time"
                value={endDate.split('T')[1] || ''}
                onChange={(e) => {
                  const date = endDate.split('T')[0] || new Date().toISOString().split('T')[0];
                  setEndDate(`${date}T${e.target.value}`);
                }}
              />
            </ConfigFormGroup>
            {endDate && (
              <div style={{ 
                marginTop: '12px', 
                padding: '10px', 
                background: 'rgba(255, 59, 48, 0.1)', 
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '13px'
              }}>
                🏁 Ends: {new Date(endDate).toLocaleString()}
              </div>
            )}
          </EditorConfigPanel>
        );

      default:
        return (
          <EditorConfigPanel
            title="Settings"
            description="Configure this setting"
          >
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              Select a setting from the left panel.
            </p>
          </EditorConfigPanel>
        );
    }
  };

  // Render timer display
  const renderTimer = () => {
    if (!showTimer) return null;
    
    return (
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        marginLeft: '12px',
      }}>
        {[
          { value: countdown.days, label: 'D' },
          { value: countdown.hours, label: 'H' },
          { value: countdown.minutes, label: 'M' },
          { value: countdown.seconds, label: 'S' },
        ].map((item, idx) => (
          <div key={idx} style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '4px 8px',
            borderRadius: '4px',
            textAlign: 'center',
            minWidth: '36px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: textColor }}>
              {String(item.value).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '9px', color: textColor, opacity: 0.8 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render announcement bar preview
  const renderAnnouncementBar = () => {
    if (!barEnabled) return null;
    
    return (
      <div
        className="announcement-bar-preview"
        style={{
          background: getBackgroundStyle(),
          height: `${barHeight}px`,
          padding: `${barPadding}px 16px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          position: barPosition === 'bottom' ? 'absolute' : 'relative',
          bottom: barPosition === 'bottom' ? 0 : 'auto',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Save Badge */}
        {showSaveBox && (
          <div style={{
            background: saveBoxBgColor,
            color: saveBoxTextColor,
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '700',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {saveBoxText}
          </div>
        )}
        
        {/* Message */}
        {showMessage && (
          animateMessage ? (
            <div className="scrolling-text-container">
              <div 
                className="scrolling-text"
                style={{ 
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  fontFamily: fontFamily,
                  fontWeight: fontWeight,
                  '--scroll-duration': `${animationSpeed}s`,
                }}
              >
                <span>{message}</span>
              </div>
            </div>
          ) : (
            <span 
              style={{ 
                color: textColor,
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                fontWeight: fontWeight,
              }}
            >
              {message}
            </span>
          )
        )}
        
        {/* Timer */}
        {renderTimer()}
        
        {/* Shop Now Button */}
        {showShopNowButton && (
          <button style={{
            background: shopNowButtonBgColor,
            color: shopNowButtonColor,
            border: 'none',
            padding: '6px 14px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {shopNowButtonText}
          </button>
        )}
      </div>
    );
  };

  // Show loading state while fetching bar data
  if (isLoading) {
    return (
      <EditorLayout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          color: '#fff',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading...</div>
            <div style={{ color: '#888' }}>Fetching announcement bar data</div>
          </div>
        </div>
      </EditorLayout>
    );
  }

  return (
    <EditorLayout>
      {/* Left Sidepane */}
      <EditorSidepane
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
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
          onDiscard={handleDiscard}
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
