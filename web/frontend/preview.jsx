import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './components/Editor/EditorLayout.css';

// Import the editor components directly
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
} from './components/Editor';

// Bundle settings configuration (same as StandardBundleEditor)
const BUNDLE_SETTINGS = {
  bundle: [
    {
      title: 'Products',
      items: [
        { id: 'select-products', icon: '📦', label: 'Select Products', iconClass: 'icon-products' },
      ],
    },
    {
      title: 'Discount',
      items: [
        { id: 'discount-settings', icon: '💰', label: 'Discount Settings', iconClass: 'icon-discount' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { id: 'bundle-priority', icon: '⬆️', label: 'Priority', iconClass: 'icon-priority' },
      ],
    },
  ],
  content: [
    {
      title: 'Message',
      items: [
        { id: 'message-text', icon: '💬', label: 'Message Text', iconClass: 'icon-message' },
        { id: 'emoji-icons', icon: '😀', label: 'Emoji & Icons', iconClass: 'icon-emoji' },
      ],
    },
    {
      title: 'Timer',
      items: [
        { id: 'countdown-timer', icon: '⏱️', label: 'Countdown Timer', iconClass: 'icon-timer' },
      ],
    },
    {
      title: 'Buttons',
      items: [
        { id: 'add-to-cart-button', icon: '🛒', label: 'Add to Cart Button', iconClass: 'icon-cart' },
        { id: 'skip-offer-button', icon: '⏭️', label: 'Skip Offer Button', iconClass: 'icon-skip' },
      ],
    },
  ],
  appearance: [
    {
      title: 'Colors',
      items: [
        { id: 'primary-colors', icon: '🎨', label: 'Primary Colors', iconClass: 'icon-colors' },
        { id: 'secondary-colors', icon: '🖌️', label: 'Secondary Colors', iconClass: 'icon-secondary' },
      ],
    },
    {
      title: 'Layout',
      items: [
        { id: 'margins', icon: '📐', label: 'Margins', iconClass: 'icon-margins' },
        { id: 'card-settings', icon: '🃏', label: 'Card Settings', iconClass: 'icon-card' },
      ],
    },
  ],
  schedule: [
    {
      title: 'Timing',
      items: [
        { id: 'start-date', icon: '🚀', label: 'Start Date', iconClass: 'icon-start' },
        { id: 'end-date', icon: '🏁', label: 'End Date', iconClass: 'icon-end' },
      ],
    },
  ],
};

const TABS = [
  { id: 'bundle', label: 'Bundle' },
  { id: 'content', label: 'Content' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'schedule', label: 'Schedule' },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: '', label: 'Select Discount Type' },
  { value: 'Percentage', label: 'Percentage' },
  { value: 'Fixed Amount', label: 'Fixed Discount' },
];

// Sample products
const sampleProducts = [
  { id: '1', title: 'Classic White T-Shirt', price: '29.99', media: 'https://via.placeholder.com/100x100/e8e8e8/666?text=T-Shirt' },
  { id: '2', title: 'Denim Blue Jeans', price: '59.99', media: 'https://via.placeholder.com/100x100/e8e8e8/666?text=Jeans' },
  { id: '3', title: 'Canvas Sneakers', price: '79.99', media: 'https://via.placeholder.com/100x100/e8e8e8/666?text=Shoes' },
];

const BundleEditorPreview = () => {
  const [activeTab, setActiveTab] = useState('bundle');
  const [activeSetting, setActiveSetting] = useState('select-products');
  const [device, setDevice] = useState('desktop');
  
  // Bundle settings state
  const [bundleEnabled, setBundleEnabled] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState(sampleProducts);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('15');
  const [bundleTitle, setBundleTitle] = useState('Buy Together & Save More!');
  const [bundleInternalName, setBundleInternalName] = useState('Summer Bundle 2024');
  const [bundlePriority, setBundlePriority] = useState(1);
  
  // Content settings
  const [primaryMessage, setPrimaryMessage] = useState('Buy Together & Save More!');
  const [secondaryMessage, setSecondaryMessage] = useState('Get this bundle and save on your purchase');
  const [showEmoji, setShowEmoji] = useState(true);
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [emojiPosition, setEmojiPosition] = useState('end');
  const [countdownLabel, setCountdownLabel] = useState('Ends in:');
  const [addToCartText, setAddToCartText] = useState('Add To Cart');
  const [skipOfferText, setSkipOfferText] = useState('Skip Offer');
  const [showSkipButton, setShowSkipButton] = useState(true);
  
  const [colorSettings, setColorSettings] = useState({
    primaryTextColor: '#303030',
    secondaryTextColor: '#616161',
    primaryBackgroundColor: '#ffffff',
    secondaryBackgroundColor: '#f1f2f4',
    borderColor: '#e0e0e0',
    buttonColor: '#000000',
    countdownBgColor: '#C4290E',
    countdownTextColor: '#ffffff',
  });
  
  const [showCountdown, setShowCountdown] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: '23', minutes: '59', seconds: '59' });
  const [margins, setMargins] = useState({ top: 20, bottom: 20 });
  const [cornerRadius, setCornerRadius] = useState('16');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Countdown timer effect
  useEffect(() => {
    if (!showCountdown) return;
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay - now;
      if (diff <= 0) return;
      setTimeLeft({
        hours: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
        minutes: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0'),
        seconds: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showCountdown]);

  const currentSettings = BUNDLE_SETTINGS[activeTab] || [];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const firstSetting = BUNDLE_SETTINGS[tabId]?.[0]?.items?.[0]?.id;
    if (firstSetting) setActiveSetting(firstSetting);
  };

  const handleColorChange = (key, value) => {
    setColorSettings(prev => ({ ...prev, [key]: value }));
  };

  const removeProduct = (product) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
  };

  const calculatePricing = () => {
    const total = selectedProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);
    let discounted = total;
    if (discountType === 'Percentage' && discountValue) {
      discounted = total * (1 - parseFloat(discountValue) / 100);
    } else if (discountType === 'Fixed Amount' && discountValue) {
      discounted = total - parseFloat(discountValue);
    }
    const saved = total - discounted;
    return { 
      total: total.toFixed(2), 
      discounted: discounted.toFixed(2), 
      saved: saved.toFixed(2),
      percent: total > 0 ? Math.round((saved / total) * 100) : 0
    };
  };

  const handleSave = () => {
    console.log('Saved bundle data:', {
      bundleTitle, bundleInternalName, bundlePriority, bundleEnabled,
      discountType, discountValue, selectedProducts, colorSettings,
      showCountdown, margins, cornerRadius, startDate, endDate,
      primaryMessage, secondaryMessage, showEmoji, selectedEmoji, emojiPosition,
      countdownLabel, addToCartText, skipOfferText, showSkipButton
    });
    alert('Bundle saved! Check console for data.');
  };

  // Get formatted title with emoji
  const getFormattedTitle = () => {
    if (!showEmoji) return primaryMessage;
    if (emojiPosition === 'start') return `${selectedEmoji} ${primaryMessage}`;
    if (emojiPosition === 'end') return `${primaryMessage} ${selectedEmoji}`;
    if (emojiPosition === 'both') return `${selectedEmoji} ${primaryMessage} ${selectedEmoji}`;
    return primaryMessage;
  };

  // Render config panel based on active setting
  const renderConfigContent = () => {
    switch (activeSetting) {
      case 'select-products':
        // Available products from inventory (mock data)
        const availableProducts = [
          { id: '4', title: 'Leather Wallet', price: '49.99', media: 'https://via.placeholder.com/100x100/d4a574/fff?text=Wallet' },
          { id: '5', title: 'Sunglasses', price: '89.99', media: 'https://via.placeholder.com/100x100/333/fff?text=Shades' },
          { id: '6', title: 'Watch', price: '199.99', media: 'https://via.placeholder.com/100x100/c0c0c0/333?text=Watch' },
          { id: '7', title: 'Belt', price: '39.99', media: 'https://via.placeholder.com/100x100/8B4513/fff?text=Belt' },
          { id: '8', title: 'Backpack', price: '79.99', media: 'https://via.placeholder.com/100x100/2F4F4F/fff?text=Bag' },
        ].filter(p => !selectedProducts.find(sp => sp.id === p.id));

        return (
          <EditorConfigPanel title="Select Products" description="Add products to your bundle">
            {showProductPicker ? (
              <>
                {/* Product Picker Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Select from Inventory</span>
                  <button
                    onClick={() => setShowProductPicker(false)}
                    style={{
                      background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px',
                      color: 'rgba(255,255,255,0.7)', padding: '6px 12px', cursor: 'pointer', fontSize: '12px'
                    }}>✕ Close</button>
                </div>

                {/* Search Products */}
                <ConfigFormGroup label="Search Products">
                  <ConfigInput type="text" placeholder="Search by product name..." />
                </ConfigFormGroup>

                {/* Search Collections */}
                <ConfigFormGroup label="Search Collections">
                  <ConfigInput type="text" placeholder="Search by collection name..." />
                </ConfigFormGroup>

                {/* Available Products from Inventory */}
                <div>
                  {availableProducts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                      All products have been added to the bundle.
                    </div>
                  ) : (
                    availableProducts.map((product, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={product.media} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                          <div>
                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{product.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>${product.price}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedProducts(prev => [...prev, product])}
                          style={{
                            background: 'rgba(81, 105, 221, 0.2)', border: '1px solid #5169DD', borderRadius: '4px',
                            color: '#5169DD', padding: '4px 12px', cursor: 'pointer', fontSize: '12px'
                          }}>+ Add</button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Add Products Button */}
                <button
                  onClick={() => setShowProductPicker(true)}
                  style={{
                    width: '100%', padding: '12px', background: 'rgba(81, 105, 221, 0.1)',
                    border: '1px solid #5169DD', borderRadius: '8px', color: '#5169DD',
                    fontWeight: '600', cursor: 'pointer', marginBottom: '16px',
                  }}
                >
                  + Add Products
                </button>

                {/* Selected Products */}
                <div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Selected Products ({selectedProducts.length})
                  </div>
                  {selectedProducts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                      No products selected. Click "Add Products" to select from inventory.
                    </div>
                  ) : (
                    selectedProducts.map((product, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px', background: 'rgba(81, 105, 221, 0.1)', borderRadius: '8px', marginBottom: '8px',
                        border: '1px solid rgba(81, 105, 221, 0.3)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={product.media} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                          <div>
                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{product.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>${product.price}</div>
                          </div>
                        </div>
                        <button onClick={() => removeProduct(product)} style={{
                          background: 'rgba(255,59,48,0.2)', border: 'none', borderRadius: '4px',
                          color: '#ff3b30', padding: '4px 8px', cursor: 'pointer'
                        }}>✕</button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'discount-settings':
        return (
          <EditorConfigPanel title="Discount Settings" description="Configure the bundle discount">
            <ConfigFormGroup label="Discount Type">
              <ConfigSelect value={discountType} onChange={(e) => setDiscountType(e.target.value)} options={DISCOUNT_TYPE_OPTIONS} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Discount Value">
              <ConfigInput type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="15" />
            </ConfigFormGroup>
            {discountType && discountValue && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(52, 199, 89, 0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                💰 {discountType === 'Percentage' ? `${discountValue}% off` : `$${discountValue} off`} bundle total
              </div>
            )}
          </EditorConfigPanel>
        );

      case 'bundle-priority':
        return (
          <EditorConfigPanel title="Bundle Priority" description="Set display priority">
            <ConfigFormGroup label="Priority" hint="Higher number = shown first">
              <ConfigInput type="number" value={bundlePriority} onChange={(e) => setBundlePriority(e.target.value)} min="0" />
            </ConfigFormGroup>
            {/* Priority explanation note */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '12px',
              background: 'rgba(81, 105, 221, 0.1)',
              borderRadius: '8px',
              marginTop: '16px',
              border: '1px solid rgba(81, 105, 221, 0.2)'
            }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                <strong style={{ color: 'rgba(255,255,255,0.9)' }}>What is Priority?</strong>
                <p style={{ margin: '6px 0 0 0' }}>
                  When a product is part of multiple bundles, only the bundle with the <strong>highest priority</strong> is shown to customers.
                </p>
                <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.5)' }}>
                  Example: Priority 10 beats Priority 5. Use higher values for promotions you want to feature.
                </p>
              </div>
            </div>
          </EditorConfigPanel>
        );

      case 'primary-colors':
        return (
          <EditorConfigPanel title="Primary Colors" description="Main colors">
            <ConfigFormGroup label="Primary Text Color">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={colorSettings.primaryTextColor} onChange={(e) => handleColorChange('primaryTextColor', e.target.value)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px' }} />
                <ConfigInput type="text" value={colorSettings.primaryTextColor} onChange={(e) => handleColorChange('primaryTextColor', e.target.value)} />
              </div>
            </ConfigFormGroup>
            <ConfigFormGroup label="Primary Background">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={colorSettings.primaryBackgroundColor} onChange={(e) => handleColorChange('primaryBackgroundColor', e.target.value)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px' }} />
                <ConfigInput type="text" value={colorSettings.primaryBackgroundColor} onChange={(e) => handleColorChange('primaryBackgroundColor', e.target.value)} />
              </div>
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'secondary-colors':
        return (
          <EditorConfigPanel title="Secondary Colors" description="Secondary colors">
            <ConfigFormGroup label="Secondary Text">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={colorSettings.secondaryTextColor} onChange={(e) => handleColorChange('secondaryTextColor', e.target.value)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px' }} />
                <ConfigInput type="text" value={colorSettings.secondaryTextColor} onChange={(e) => handleColorChange('secondaryTextColor', e.target.value)} />
              </div>
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Background">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={colorSettings.secondaryBackgroundColor} onChange={(e) => handleColorChange('secondaryBackgroundColor', e.target.value)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px' }} />
                <ConfigInput type="text" value={colorSettings.secondaryBackgroundColor} onChange={(e) => handleColorChange('secondaryBackgroundColor', e.target.value)} />
              </div>
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      // === CONTENT TAB ===
      case 'message-text':
        return (
          <EditorConfigPanel title="Message Text" description="Configure bundle messages">
            <ConfigFormGroup label="Primary Message" hint="Main headline for the bundle">
              <ConfigInput type="text" value={primaryMessage} onChange={(e) => setPrimaryMessage(e.target.value)} placeholder="Buy Together & Save More!" />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Message" hint="Supporting text below the headline">
              <ConfigTextarea value={secondaryMessage} onChange={(e) => setSecondaryMessage(e.target.value)} placeholder="Get this bundle and save" rows={2} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'emoji-icons':
        return (
          <EditorConfigPanel title="Emoji & Icons" description="Add emoji to make your bundle stand out">
            <ConfigToggleRow label="Show Emoji" checked={showEmoji} onChange={setShowEmoji} />
            {showEmoji && (
              <>
                <ConfigFormGroup label="Select Emoji">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {['🔥', '⭐', '💎', '🎁', '💰', '🏷️', '✨', '🛒', '❤️', '👍'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedEmoji(emoji)}
                        style={{
                          width: '40px', height: '40px', fontSize: '20px',
                          border: selectedEmoji === emoji ? '2px solid #5169DD' : '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          background: selectedEmoji === emoji ? 'rgba(81, 105, 221, 0.2)' : 'rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                        }}
                      >{emoji}</button>
                    ))}
                  </div>
                </ConfigFormGroup>
                <ConfigFormGroup label="Emoji Position">
                  <ConfigSelect value={emojiPosition} onChange={(e) => setEmojiPosition(e.target.value)}
                    options={[{ value: 'start', label: 'Before text' }, { value: 'end', label: 'After text' }, { value: 'both', label: 'Both sides' }]} />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'countdown-timer':
        return (
          <EditorConfigPanel title="Countdown Timer" description="Show urgency timer">
            <ConfigToggleRow label="Show Countdown Timer" checked={showCountdown} onChange={setShowCountdown} />
            {showCountdown && (
              <>
                <ConfigFormGroup label="Timer Label" hint="Text shown before the countdown">
                  <ConfigInput type="text" value={countdownLabel} onChange={(e) => setCountdownLabel(e.target.value)} placeholder="Ends in:" />
                </ConfigFormGroup>
                <ConfigFormGroup label="Timer Background">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="color" value={colorSettings.countdownBgColor} onChange={(e) => handleColorChange('countdownBgColor', e.target.value)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px' }} />
                    <ConfigInput type="text" value={colorSettings.countdownBgColor} onChange={(e) => handleColorChange('countdownBgColor', e.target.value)} />
                  </div>
                </ConfigFormGroup>
                <ConfigFormGroup label="Timer Text Color">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="color" value={colorSettings.countdownTextColor} onChange={(e) => handleColorChange('countdownTextColor', e.target.value)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px' }} />
                    <ConfigInput type="text" value={colorSettings.countdownTextColor} onChange={(e) => handleColorChange('countdownTextColor', e.target.value)} />
                  </div>
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'add-to-cart-button':
        return (
          <EditorConfigPanel title="Add to Cart Button" description="Configure the main call-to-action button">
            <ConfigFormGroup label="Button Text">
              <ConfigInput type="text" value={addToCartText} onChange={(e) => setAddToCartText(e.target.value)} placeholder="Add To Cart" />
            </ConfigFormGroup>
            <ConfigFormGroup label="Button Color">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={colorSettings.buttonColor} onChange={(e) => handleColorChange('buttonColor', e.target.value)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
                <ConfigInput type="text" value={colorSettings.buttonColor} onChange={(e) => handleColorChange('buttonColor', e.target.value)} />
              </div>
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'skip-offer-button':
        return (
          <EditorConfigPanel title="Skip Offer Button" description="Optional secondary button">
            <ConfigToggleRow label="Show Skip Offer Button" checked={showSkipButton} onChange={setShowSkipButton} />
            {showSkipButton && (
              <>
                <ConfigFormGroup label="Button Text">
                  <ConfigInput type="text" value={skipOfferText} onChange={(e) => setSkipOfferText(e.target.value)} placeholder="Skip Offer" />
                </ConfigFormGroup>
                <ConfigFormGroup label="Border Color">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="color" value={colorSettings.borderColor} onChange={(e) => handleColorChange('borderColor', e.target.value)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
                    <ConfigInput type="text" value={colorSettings.borderColor} onChange={(e) => handleColorChange('borderColor', e.target.value)} />
                  </div>
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      // === APPEARANCE TAB ===
      case 'margins':
        return (
          <EditorConfigPanel title="Margins" description="Widget spacing">
            <ConfigFormGroup label="Top Margin (px)">
              <ConfigInput type="number" value={margins.top} onChange={(e) => setMargins(prev => ({ ...prev, top: parseInt(e.target.value) || 0 }))} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Bottom Margin (px)">
              <ConfigInput type="number" value={margins.bottom} onChange={(e) => setMargins(prev => ({ ...prev, bottom: parseInt(e.target.value) || 0 }))} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'card-settings':
        return (
          <EditorConfigPanel title="Card Settings" description="Card appearance">
            <ConfigFormGroup label="Corner Radius (px)">
              <ConfigInput type="text" value={cornerRadius} onChange={(e) => setCornerRadius(e.target.value)} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      // === SCHEDULE TAB ===
      case 'start-date':
        return (
          <EditorConfigPanel title="Start Date" description="When to start showing">
            <ConfigFormGroup label="Date">
              <ConfigInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'end-date':
        return (
          <EditorConfigPanel title="End Date" description="When to stop showing">
            <ConfigFormGroup label="Date">
              <ConfigInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </ConfigFormGroup>
            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
              💡 Leave empty for evergreen bundles that run indefinitely
            </div>
          </EditorConfigPanel>
        );

      default:
        return <EditorConfigPanel title="Settings"><p style={{ color: 'rgba(255,255,255,0.5)' }}>Select a setting</p></EditorConfigPanel>;
    }
  };

  // Calculate pricing for preview
  const pricing = calculatePricing();

  // Render bundle widget
  const renderBundleWidget = () => (
    <div style={{
      margin: `${margins.top}px 0 ${margins.bottom}px 0`,
      padding: '16px',
      background: colorSettings.primaryBackgroundColor,
      borderRadius: `${cornerRadius}px`,
      border: `1px solid ${colorSettings.borderColor}`,
    }}>
      <h3 style={{ color: colorSettings.primaryTextColor, fontSize: '16px', fontWeight: '600', marginBottom: '4px', textAlign: 'center' }}>
        {getFormattedTitle()}
      </h3>
      
      {secondaryMessage && (
        <p style={{ color: colorSettings.secondaryTextColor, fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>
          {secondaryMessage}
        </p>
      )}

      {showCountdown && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
          padding: '8px 12px', background: colorSettings.countdownBgColor, borderRadius: '8px', marginBottom: '12px'
        }}>
          <span style={{ color: colorSettings.countdownTextColor, fontSize: '12px', fontWeight: '600' }}>{countdownLabel}</span>
          {[{ v: timeLeft.hours, l: 'HRS' }, { v: timeLeft.minutes, l: 'MIN' }, { v: timeLeft.seconds, l: 'SEC' }].map((t, i) => (
            <React.Fragment key={i}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: colorSettings.countdownTextColor }}>{t.v}</div>
                <div style={{ fontSize: '8px', color: colorSettings.countdownTextColor, opacity: 0.8 }}>{t.l}</div>
              </div>
              {i < 2 && <span style={{ color: colorSettings.countdownTextColor, fontWeight: 'bold' }}>:</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {selectedProducts.map((product, idx) => (
        <React.Fragment key={idx}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
            background: colorSettings.secondaryBackgroundColor, borderRadius: '12px',
            border: `1px solid ${colorSettings.borderColor}`, marginBottom: '8px'
          }}>
            <img src={product.media} alt={product.title} style={{ width: '50px', height: '50px', borderRadius: '8px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: colorSettings.primaryTextColor, fontSize: '13px', fontWeight: '500' }}>{product.title}</div>
              <div style={{ color: colorSettings.secondaryTextColor, fontSize: '12px' }}>${product.price}</div>
            </div>
          </div>
          {idx < selectedProducts.length - 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0 4px' }}>
              <div style={{
                width: '30px', height: '30px', background: colorSettings.buttonColor, color: 'white',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 'bold', border: `2px solid ${colorSettings.secondaryBackgroundColor}`
              }}>+</div>
            </div>
          )}
        </React.Fragment>
      ))}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px',
        background: colorSettings.primaryBackgroundColor, borderRadius: '12px',
        border: `1px solid ${colorSettings.borderColor}`, marginTop: '12px'
      }}>
        <div>
          <div style={{ color: colorSettings.primaryTextColor, fontSize: '15px', fontWeight: '600' }}>Total</div>
          {pricing.percent > 0 && <div style={{ color: colorSettings.countdownBgColor, fontSize: '11px' }}>Save {pricing.percent}% (${pricing.saved})</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: colorSettings.primaryTextColor, fontSize: '15px', fontWeight: '600' }}>${pricing.discounted}</div>
          {pricing.percent > 0 && <div style={{ color: colorSettings.secondaryTextColor, fontSize: '11px', textDecoration: 'line-through' }}>${pricing.total}</div>}
        </div>
      </div>

      <button style={{
        width: '100%', padding: '15px', marginTop: '8px', background: colorSettings.buttonColor,
        color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
      }}>{addToCartText}</button>
      
      {showSkipButton && (
        <button style={{
          width: '100%', padding: '15px', marginTop: '8px', background: colorSettings.secondaryBackgroundColor,
          color: colorSettings.primaryTextColor, border: `1px solid ${colorSettings.borderColor}`,
          borderRadius: '12px', fontSize: '15px', fontWeight: '500', cursor: 'pointer'
        }}>{skipOfferText}</button>
      )}
    </div>
  );

  // Render product page preview with bundle widget embedded
  const renderProductPagePreview = () => (
    <div className="product-page-preview" style={{ padding: '24px', background: '#fff', minHeight: '100%' }}>
      {/* Product Page Layout - Two Column */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column - Product Image */}
        <div style={{ flex: '0 0 45%', maxWidth: '45%' }}>
          {/* Main Product Image */}
          <div style={{
            width: '100%', aspectRatio: '1', background: '#f8f8f8', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
            border: '1px solid #eee'
          }}>
            <span style={{ fontSize: '64px', opacity: 0.4 }}>📦</span>
          </div>
          
          {/* Thumbnail Images */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: '50px', height: '50px', background: '#f8f8f8', borderRadius: '8px',
                border: i === 1 ? '2px solid #1a1a1a' : '1px solid #eee',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}>
                <span style={{ fontSize: '16px', opacity: 0.3 }}>📦</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Product Info + Bundle Widget */}
        <div style={{ flex: '1', minWidth: 0 }}>
          {/* Product Title */}
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px', lineHeight: '1.3' }}>
            Premium Wireless Headphones Pro
          </h1>
          
          {/* Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ color: '#f5a623', fontSize: '12px' }}>★★★★★</span>
            <span style={{ fontSize: '11px', color: '#666' }}>4.8 (2,847 reviews)</span>
          </div>
          
          {/* Price */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a' }}>$1,299.00</span>
            <span style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through', marginLeft: '8px' }}>$1,599.00</span>
          </div>
          
          {/* Description */}
          <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.5', marginBottom: '12px' }}>
            Experience premium sound quality with active noise cancellation. 
            40-hour battery life, comfortable over-ear design.
          </p>
          
          {/* Product Specifications */}
          <div style={{ marginBottom: '12px', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px' }}>Specifications</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', color: '#666' }}>
              <div>• Battery: 40 hours</div>
              <div>• Bluetooth: 5.2</div>
              <div>• Weight: 250g</div>
              <div>• Driver: 40mm</div>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <button style={{
            width: '100%', padding: '12px', background: '#1a1a1a', color: 'white', border: 'none',
            borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px'
          }}>Add to Cart</button>

          {/* Bundle Widget */}
          <div style={{ 
            borderTop: '1px dashed #ddd', 
            paddingTop: '12px',
            position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '-8px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              background: '#fff',
              padding: '0 8px',
              fontSize: '9px', 
              color: '#999', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px'
            }}>
              Bundle Offer
            </div>
            {renderBundleWidget()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <EditorLayout>
      <EditorSidepane tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange}>
        <EditorSettingsPane groups={currentSettings} activeSetting={activeSetting} onSettingChange={setActiveSetting} />
        {renderConfigContent()}
      </EditorSidepane>

      <EditorRightContent>
        <EditorHeader
          title={bundleTitle}
          onTitleChange={setBundleTitle}
          enabled={bundleEnabled}
          onEnabledChange={setBundleEnabled}
          onSave={handleSave}
          onDiscard={() => alert('Discard clicked')}
        />
        <EditorPreviewPanel device={device} onDeviceChange={setDevice}>
          {renderProductPagePreview()}
        </EditorPreviewPanel>
      </EditorRightContent>
    </EditorLayout>
  );
};

// Mount the preview
const root = ReactDOM.createRoot(document.getElementById('preview-root'));
root.render(<BundleEditorPreview />);
