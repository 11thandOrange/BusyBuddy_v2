import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './components/Editor/EditorLayout.css';

// Import Editor components
import {
  EditorLayout,
  EditorSidepane,
  EditorSettingsPane,
  EditorConfigPanel,
  ConfigFormGroup,
  ConfigInput,
  ConfigSelect,
  ConfigToggleRow,
  EditorPreviewPanel,
  EditorHeader,
  EditorRightContent
} from './components/Editor';

// Mock product image
const tshirt = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png';

// Mix and Match settings configuration
const MIXMATCH_SETTINGS = {
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
        { id: 'tier-settings', icon: '📊', label: 'Tier Settings', iconClass: 'icon-tier' },
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
  { value: 'Percentage', label: 'Percentage Discount' },
  { value: 'Fixed Amount', label: 'Fixed Amount' },
];

const TIER_OPTIONS = [
  { value: 2, label: 'Buy 2' },
  { value: 3, label: 'Buy 3' },
  { value: 4, label: 'Buy 4' },
  { value: 5, label: 'Buy 5' },
];

// Mock products for the bundle (available products)
const MOCK_BUNDLE_PRODUCTS = [
  { id: 'gid://shopify/Product/1', productId: 'gid://shopify/Product/1', title: 'Classic T-Shirt', price: '29.99', media: tshirt },
  { id: 'gid://shopify/Product/2', productId: 'gid://shopify/Product/2', title: 'Premium Hoodie', price: '59.99', media: tshirt },
  { id: 'gid://shopify/Product/3', productId: 'gid://shopify/Product/3', title: 'Slim Fit Jeans', price: '49.99', media: tshirt },
  { id: 'gid://shopify/Product/4', productId: 'gid://shopify/Product/4', title: 'Running Sneakers', price: '89.99', media: tshirt },
  { id: 'gid://shopify/Product/5', productId: 'gid://shopify/Product/5', title: 'Baseball Cap', price: '19.99', media: tshirt },
  { id: 'gid://shopify/Product/6', productId: 'gid://shopify/Product/6', title: 'Leather Belt', price: '34.99', media: tshirt },
];

// Mock products for config panel (store inventory)
const MOCK_PRODUCTS = MOCK_BUNDLE_PRODUCTS;

const MixMatchEditorPreview = () => {
  // Tab and setting state
  const [activeTab, setActiveTab] = useState('bundle');
  const [activeSetting, setActiveSetting] = useState('select-products');
  const [device, setDevice] = useState('desktop');

  // Bundle data states
  const [bundleInternalName, setBundleInternalName] = useState('Summer Mix & Match Promo');
  const [bundleTitle, setBundleTitle] = useState('Mix & Match - Save More! 🔥');
  const [secondaryMessage, setSecondaryMessage] = useState('Select any items and save on your purchase');
  const [bundleEnabled, setBundleEnabled] = useState(true);
  const [bundlePriority, setBundlePriority] = useState(0);

  // Products states (for config panel - products in the bundle offer)
  const [selectedProducts, setSelectedProducts] = useState([MOCK_PRODUCTS[0], MOCK_PRODUCTS[1], MOCK_PRODUCTS[2], MOCK_PRODUCTS[3]]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  
  // Widget interaction state - which products user has selected in the widget preview
  const [widgetSelectedProducts, setWidgetSelectedProducts] = useState([]);

  // Discount states
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('15');

  // Tier states
  const [selectedTier, setSelectedTier] = useState(2);
  const [tierDiscounts, setTierDiscounts] = useState({
    2: '10',
    3: '15',
    4: '20',
    5: '25',
  });

  // Widget appearance states
  const [colorSettings, setColorSettings] = useState({
    primaryTextColor: '#303030',
    secondaryTextColor: '#616161',
    primaryBackgroundColor: '#FFFFFF',
    secondaryBackgroundColor: '#f1f2f4',
    borderColor: '#e0e0e0',
    buttonColor: '#000000',
    countdownBgColor: '#C4290E',
    countdownTextColor: '#FFFFFF',
  });

  // Display settings
  const [showCountdown, setShowCountdown] = useState(true);
  const [showEmoji, setShowEmoji] = useState(true);
  const [margins, setMargins] = useState({ top: 20, bottom: 20 });
  const [cornerRadius, setCornerRadius] = useState(20);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Button settings
  const [addToCartText, setAddToCartText] = useState('Add Bundle to Cart');
  const [addToCartBgColor, setAddToCartBgColor] = useState('#000000');
  const [addToCartTextColor, setAddToCartTextColor] = useState('#FFFFFF');
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [skipButtonText, setSkipButtonText] = useState('Skip Offer');
  const [skipButtonBgColor, setSkipButtonBgColor] = useState('#f5f5f5');
  const [skipButtonTextColor, setSkipButtonTextColor] = useState('#666666');

  const [timeLeft] = useState({ hours: '23', minutes: '45', seconds: '30' });

  // Helper functions
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const firstSetting = MIXMATCH_SETTINGS[tabId]?.[0]?.items?.[0]?.id;
    if (firstSetting) setActiveSetting(firstSetting);
  };

  const handleColorChange = (key, value) => {
    setColorSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTierDiscountChange = (tier, value) => {
    setTierDiscounts(prev => ({ ...prev, [tier]: value }));
  };

  const getFilteredProducts = () => {
    const selectedIds = selectedProducts.map(p => p.productId);
    let filtered = MOCK_PRODUCTS.filter(p => !selectedIds.includes(p.productId));
    if (productSearchQuery) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(productSearchQuery.toLowerCase()));
    }
    return filtered;
  };

  const addProduct = (product) => {
    if (!selectedProducts.find(p => p.productId === product.productId)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const calculateDiscountedPrice = (originalPrice) => {
    const price = parseFloat(originalPrice) || 0;
    // Use the discount based on how many products are selected in the widget
    const applicableTier = Math.max(2, Math.min(widgetSelectedProducts.length, 4));
    const discount = parseFloat(tierDiscounts[applicableTier]) || parseFloat(discountValue) || 0;
    if (discountType === 'Percentage') return (price * (1 - discount / 100)).toFixed(2);
    if (discountType === 'Fixed Amount') return Math.max(0, price - discount).toFixed(2);
    return price.toFixed(2);
  };

  // Toggle product selection in widget
  const toggleWidgetProductSelection = (product) => {
    const isSelected = widgetSelectedProducts.some(p => p.productId === product.productId);
    if (isSelected) {
      setWidgetSelectedProducts(widgetSelectedProducts.filter(p => p.productId !== product.productId));
    } else {
      setWidgetSelectedProducts([...widgetSelectedProducts, product]);
    }
  };

  // Check if product is selected in widget
  const isProductSelectedInWidget = (productId) => {
    return widgetSelectedProducts.some(p => p.productId === productId);
  };

  // Get current tier based on widget selection
  const getCurrentTier = () => {
    const count = widgetSelectedProducts.length;
    if (count >= 4) return 4;
    if (count >= 3) return 3;
    if (count >= 2) return 2;
    return 2; // Default
  };

  // Check if can add to cart (minimum 2 products)
  const canAddToCart = widgetSelectedProducts.length >= 2;

  const handleSave = () => alert('Bundle saved! (Demo mode)');
  
  const handleAddToCart = () => {
    if (canAddToCart) {
      alert(`Added ${widgetSelectedProducts.length} products to cart with ${tierDiscounts[getCurrentTier()]}% discount!`);
    }
  };

  // Get current settings
  const currentSettings = MIXMATCH_SETTINGS[activeTab] || [];

  // Render config content
  const renderConfigContent = () => {
    const availableProducts = getFilteredProducts();

    switch (activeSetting) {
      case 'select-products':
        return (
          <EditorConfigPanel title="Select Products" description="Add products to your mix & match bundle">
            {showProductPicker ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Select from Inventory</span>
                  <button onClick={() => setShowProductPicker(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
                </div>
                <ConfigFormGroup label="Search Products">
                  <ConfigInput type="text" placeholder="Search by product name..." value={productSearchQuery} onChange={(e) => setProductSearchQuery(e.target.value)} />
                </ConfigFormGroup>
                <ConfigFormGroup label="Search Collections">
                  <ConfigInput type="text" placeholder="Search by collection name..." />
                </ConfigFormGroup>
                <div>
                  {availableProducts.map(product => (
                    <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={product.media} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{product.title}</div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>${product.price}</div>
                        </div>
                      </div>
                      <button onClick={() => addProduct(product)} style={{ background: 'rgba(81, 105, 221, 0.2)', border: '1px solid #5169DD', borderRadius: '4px', color: '#5169DD', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' }}>+ Add</button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setShowProductPicker(true)} style={{ width: '100%', padding: '12px', background: 'rgba(81, 105, 221, 0.1)', border: '1px solid #5169DD', borderRadius: '8px', color: '#5169DD', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' }}>
                  + Add Products
                </button>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Selected Products ({selectedProducts.length})
                </div>
                {selectedProducts.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                    No products selected.
                  </div>
                ) : (
                  selectedProducts.map(product => (
                    <div key={product.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(81, 105, 221, 0.1)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(81, 105, 221, 0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={product.media} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{product.title}</div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>${product.price}</div>
                        </div>
                      </div>
                      <button onClick={() => removeProduct(product.productId)} style={{ background: 'rgba(255,59,48,0.2)', border: 'none', borderRadius: '4px', color: '#ff3b30', padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))
                )}
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
            <ConfigFormGroup label={discountType === 'Percentage' ? 'Default Discount %' : 'Default Discount $'}>
              <ConfigInput type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="15" min="0" />
            </ConfigFormGroup>
            <div style={{ padding: '12px', background: 'rgba(81, 105, 221, 0.1)', borderRadius: '8px', marginTop: '15px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                💡 Set tier-specific discounts in "Tier Settings"
              </span>
            </div>
          </EditorConfigPanel>
        );

      case 'tier-settings':
        return (
          <EditorConfigPanel title="Tier Settings" description="Configure quantity tiers and discounts">
            <ConfigFormGroup label="Minimum Quantity to Unlock">
              <ConfigSelect value={selectedTier} onChange={(e) => setSelectedTier(parseInt(e.target.value))} options={TIER_OPTIONS} />
            </ConfigFormGroup>
            <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
              Tier Discounts ({discountType === 'Percentage' ? '%' : '$'})
            </div>
            {TIER_OPTIONS.map(tier => (
              <ConfigFormGroup key={tier.value} label={tier.label}>
                <ConfigInput type="number" value={tierDiscounts[tier.value] || ''} onChange={(e) => handleTierDiscountChange(tier.value, e.target.value)} placeholder="10" min="0" />
              </ConfigFormGroup>
            ))}
          </EditorConfigPanel>
        );

      case 'bundle-priority':
        return (
          <EditorConfigPanel title="Priority Settings" description="Control bundle display order">
            <ConfigFormGroup label="Bundle Priority">
              <ConfigInput type="number" value={bundlePriority} onChange={(e) => setBundlePriority(e.target.value)} placeholder="0" min="0" />
            </ConfigFormGroup>
            <div style={{ padding: '12px', background: 'rgba(255, 193, 7, 0.15)', borderRadius: '8px', marginTop: '15px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                💡 Higher priority bundles are shown first when a product is in multiple bundles.
              </span>
            </div>
          </EditorConfigPanel>
        );

      case 'message-text':
        return (
          <EditorConfigPanel title="Message Text" description="Configure bundle messages">
            <ConfigFormGroup label="Primary Message">
              <ConfigInput value={bundleTitle} onChange={(e) => setBundleTitle(e.target.value)} placeholder="Mix & Match - Save More!" />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Message">
              <ConfigInput value={secondaryMessage} onChange={(e) => setSecondaryMessage(e.target.value)} placeholder="Select any items and save" />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'emoji-icons':
        return (
          <EditorConfigPanel title="Emoji & Icons" description="Toggle emoji display">
            <ConfigToggleRow label="Show Emoji in Timer" checked={showEmoji} onChange={(e) => setShowEmoji(e.target.checked)} />
          </EditorConfigPanel>
        );

      case 'countdown-timer':
        return (
          <EditorConfigPanel title="Countdown Timer" description="Urgency timer settings">
            <ConfigToggleRow label="Show Countdown Timer" checked={showCountdown} onChange={(e) => setShowCountdown(e.target.checked)} />
            {showCountdown && (
              <>
                <ConfigFormGroup label="Timer Background">
                  <input type="color" value={colorSettings.countdownBgColor} onChange={(e) => handleColorChange('countdownBgColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                </ConfigFormGroup>
                <ConfigFormGroup label="Timer Text Color">
                  <input type="color" value={colorSettings.countdownTextColor} onChange={(e) => handleColorChange('countdownTextColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'add-to-cart-button':
        return (
          <EditorConfigPanel title="Add to Cart Button" description="Customize the main action button">
            <ConfigFormGroup label="Button Text">
              <ConfigInput value={addToCartText} onChange={(e) => setAddToCartText(e.target.value)} placeholder="Add Bundle to Cart" />
            </ConfigFormGroup>
            <ConfigFormGroup label="Background Color">
              <input type="color" value={addToCartBgColor} onChange={(e) => setAddToCartBgColor(e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Text Color">
              <input type="color" value={addToCartTextColor} onChange={(e) => setAddToCartTextColor(e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'skip-offer-button':
        return (
          <EditorConfigPanel title="Skip Offer Button" description="Optional dismiss button">
            <ConfigToggleRow label="Show Skip Button" checked={showSkipButton} onChange={(e) => setShowSkipButton(e.target.checked)} />
            {showSkipButton && (
              <>
                <ConfigFormGroup label="Button Text">
                  <ConfigInput value={skipButtonText} onChange={(e) => setSkipButtonText(e.target.value)} placeholder="Skip Offer" />
                </ConfigFormGroup>
                <ConfigFormGroup label="Background Color">
                  <input type="color" value={skipButtonBgColor} onChange={(e) => setSkipButtonBgColor(e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                </ConfigFormGroup>
                <ConfigFormGroup label="Text Color">
                  <input type="color" value={skipButtonTextColor} onChange={(e) => setSkipButtonTextColor(e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'primary-colors':
        return (
          <EditorConfigPanel title="Primary Colors" description="Main color scheme">
            <ConfigFormGroup label="Primary Text">
              <input type="color" value={colorSettings.primaryTextColor} onChange={(e) => handleColorChange('primaryTextColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Primary Background">
              <input type="color" value={colorSettings.primaryBackgroundColor} onChange={(e) => handleColorChange('primaryBackgroundColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'secondary-colors':
        return (
          <EditorConfigPanel title="Secondary Colors" description="Accent colors">
            <ConfigFormGroup label="Secondary Text">
              <input type="color" value={colorSettings.secondaryTextColor} onChange={(e) => handleColorChange('secondaryTextColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Background">
              <input type="color" value={colorSettings.secondaryBackgroundColor} onChange={(e) => handleColorChange('secondaryBackgroundColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Border Color">
              <input type="color" value={colorSettings.borderColor} onChange={(e) => handleColorChange('borderColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'margins':
        return (
          <EditorConfigPanel title="Margins" description="Widget spacing">
            <ConfigFormGroup label="Top Margin (px)">
              <ConfigInput type="number" value={margins.top} onChange={(e) => setMargins(prev => ({ ...prev, top: parseInt(e.target.value) || 0 }))} min="0" />
            </ConfigFormGroup>
            <ConfigFormGroup label="Bottom Margin (px)">
              <ConfigInput type="number" value={margins.bottom} onChange={(e) => setMargins(prev => ({ ...prev, bottom: parseInt(e.target.value) || 0 }))} min="0" />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'card-settings':
        return (
          <EditorConfigPanel title="Card Settings" description="Card appearance">
            <ConfigFormGroup label="Corner Radius (px)">
              <ConfigInput type="number" value={cornerRadius} onChange={(e) => setCornerRadius(parseInt(e.target.value) || 0)} min="0" max="50" />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

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
          </EditorConfigPanel>
        );

      default:
        return <EditorConfigPanel title="Settings"><p style={{ color: 'rgba(255,255,255,0.5)' }}>Select a setting</p></EditorConfigPanel>;
    }
  };

  // Tier configurations matching production
  const tiers = {
    2: { label: 'Buy 2', sublabel: `Save ${tierDiscounts[2] || 10}%`, discount: tierDiscounts[2] || 10 },
    3: { label: 'Buy 3', sublabel: `Save ${tierDiscounts[3] || 15}%`, discount: tierDiscounts[3] || 15 },
    4: { label: 'Buy 4', sublabel: `Save ${tierDiscounts[4] || 20}%`, discount: tierDiscounts[4] || 20 },
  };

  // Render Mix & Match widget preview (matching production with interactive selection)
  const renderMixMatchPreview = () => {
    const hasProducts = selectedProducts.length > 0;
    const currentTier = getCurrentTier();
    const currentDiscount = tierDiscounts[currentTier] || discountValue;
    const selectedCount = widgetSelectedProducts.length;

    return (
      <div style={{
        backgroundColor: colorSettings.secondaryBackgroundColor,
        padding: '15px',
        borderRadius: `${cornerRadius}px`,
        position: 'relative',
        marginTop: `${margins.top}px`,
        marginBottom: `${margins.bottom}px`,
      }}>
        {/* Title */}
        <h3 style={{ 
          color: colorSettings.primaryTextColor, 
          fontSize: '16px', 
          fontWeight: 600, 
          marginBottom: '4px', 
          paddingRight: showCountdown ? '150px' : '0' 
        }}>
          {bundleTitle}
        </h3>

        {/* Countdown Timer - Production Style */}
        {showCountdown && (
          <div style={{ 
            position: 'absolute', 
            top: '0.5px', 
            right: '0px', 
            background: colorSettings.countdownBgColor, 
            color: colorSettings.countdownTextColor, 
            padding: '8px 10px', 
            borderRadius: '8px 18px 8px 8px',
            fontSize: '12px', 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: `1px solid ${colorSettings.borderColor}`,
            zIndex: 3,
          }}>
            {showEmoji && '🔥 '}Ends In {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
          </div>
        )}

        {!hasProducts ? (
          <div style={{ padding: '30px 15px', textAlign: 'center', backgroundColor: colorSettings.primaryBackgroundColor, borderRadius: `${Math.max(0, cornerRadius - 5)}px`, border: `1px solid ${colorSettings.borderColor}`, marginTop: '15px' }}>
            <p style={{ fontSize: '14px', color: colorSettings.secondaryTextColor, margin: 0 }}>Select products to see the preview</p>
          </div>
        ) : (
          <>
            {/* Tier Selection Pills - Only one active at a time based on selection */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', marginTop: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
              {Object.entries(tiers).map(([tierKey, tierConfig]) => {
                const tierNum = parseInt(tierKey);
                // Only the current tier (matching selection count) is active
                const isActive = currentTier === tierNum && selectedCount >= 2;
                return (
                  <div
                    key={tierKey}
                    style={{
                      minWidth: '120px',
                      height: '60px',
                      padding: '12px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: isActive ? '#5169DD' : 'white',
                      color: isActive ? 'white' : '#222222',
                      fontSize: '14px',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      opacity: isActive ? 1 : 0.6,
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: !isActive ? '1px solid #ccc' : 'none',
                    }}>
                      {isActive && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5169DD" strokeWidth="3">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </div>
                    {/* Label */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{tierConfig.label}</span>
                      <span style={{ fontSize: '11px', color: isActive ? 'rgba(255,255,255,0.8)' : '#999' }}>{tierConfig.sublabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Info Text - Dynamic based on selection */}
            <div style={{ fontSize: '12px', color: colorSettings.secondaryTextColor, marginBottom: '12px' }}>
              {selectedCount === 0 ? (
                <span>Select at least 2 products to unlock the discount.</span>
              ) : selectedCount === 1 ? (
                <span>Select 1 more product to unlock <strong>{tierDiscounts[2]}% off</strong>!</span>
              ) : (
                <span>
                  You have selected <strong>{selectedCount}</strong> Products.<br />
                  <strong>{currentDiscount}%</strong> Discount is applied on the selected products.
                  {selectedCount < 4 && (
                    <span style={{ color: '#5169DD', marginLeft: '4px' }}>
                      (Select {currentTier + 1 - selectedCount > 0 ? `${4 - selectedCount} more for ${tierDiscounts[Math.min(selectedCount + 1, 4)]}% off` : ''})
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Products List - Clickable cards for selection */}
            {selectedProducts.map((product, index) => {
              const isSelected = isProductSelectedInWidget(product.productId);
              return (
                <div 
                  key={product.productId || index} 
                  onClick={() => toggleWidgetProductSelection(product)}
                  style={{ 
                    padding: '15px', 
                    borderRadius: `${Math.max(0, cornerRadius - 5)}px`, 
                    marginBottom: '12px',
                    backgroundColor: isSelected ? 'rgba(81, 105, 221, 0.08)' : colorSettings.primaryBackgroundColor, 
                    border: isSelected ? '2px solid #5169DD' : `1px solid ${colorSettings.borderColor}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  {/* Selection checkbox */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#5169DD' : 'white',
                    border: isSelected ? 'none' : '2px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: '40px' }}>
                    <img 
                      src={product.media || tshirt} 
                      alt={product.title} 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '10px', 
                        marginRight: '15px',
                        objectFit: 'cover',
                        border: isSelected ? '2px solid #5169DD' : `1px solid ${colorSettings.borderColor}`,
                      }} 
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '5px', color: colorSettings.primaryTextColor }}>
                        {product.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isSelected && selectedCount >= 2 ? (
                          <>
                            <span style={{ fontWeight: 600, fontSize: '14px', color: '#4CAF50' }}>
                              ${calculateDiscountedPrice(product.price)}
                            </span>
                            <span style={{ width: '1.5px', height: '10px', background: colorSettings.primaryTextColor, opacity: 0.3 }}></span>
                            <span style={{ color: colorSettings.secondaryTextColor, fontSize: '12px', textDecoration: 'line-through' }}>
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontWeight: 600, fontSize: '14px', color: colorSettings.primaryTextColor }}>
                            ${product.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Variant Selector (mock) */}
                  <div style={{ marginTop: '10px' }} onClick={(e) => e.stopPropagation()}>
                    <label style={{ fontSize: '11px', fontWeight: 500, color: colorSettings.secondaryTextColor, display: 'block', marginBottom: '4px' }}>Size</label>
                    <select style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      border: `1px solid ${colorSettings.borderColor}`,
                      backgroundColor: colorSettings.primaryBackgroundColor,
                      color: colorSettings.primaryTextColor,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}>
                      <option>Medium</option>
                      <option>Small</option>
                      <option>Large</option>
                      <option>X-Large</option>
                    </select>
                  </div>
                </div>
              );
            })}

            {/* Total Section - Only shows selected products */}
            <div style={{ 
              padding: '15px', 
              backgroundColor: colorSettings.primaryBackgroundColor, 
              borderRadius: `${Math.max(0, cornerRadius - 5)}px`, 
              border: `1px solid ${colorSettings.borderColor}` 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: colorSettings.primaryTextColor }}>
                  Total {selectedCount > 0 && `(${selectedCount} items)`}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedCount === 0 ? (
                    <span style={{ fontWeight: 500, fontSize: '14px', color: '#999' }}>Select products</span>
                  ) : (
                    (() => {
                      const originalTotal = widgetSelectedProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
                      const discountedTotal = selectedCount >= 2 
                        ? widgetSelectedProducts.reduce((sum, p) => sum + parseFloat(calculateDiscountedPrice(p.price)), 0)
                        : originalTotal;
                      return (
                        <>
                          <span style={{ fontWeight: 700, fontSize: '18px', color: colorSettings.primaryTextColor }}>${discountedTotal.toFixed(2)}</span>
                          {selectedCount >= 2 && discountedTotal < originalTotal && (
                            <>
                              <span style={{ width: '1.5px', height: '12px', background: colorSettings.primaryTextColor, opacity: 0.3 }}></span>
                              <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999' }}>${originalTotal.toFixed(2)}</span>
                            </>
                          )}
                        </>
                      );
                    })()
                  )}
                </div>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  backgroundColor: canAddToCart ? addToCartBgColor : '#ccc', 
                  color: canAddToCart ? addToCartTextColor : '#888', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  fontSize: '14px',
                  cursor: canAddToCart ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                }}
              >
                {canAddToCart ? addToCartText : `Select ${2 - selectedCount} more to add`}
              </button>
              {showSkipButton && (
                <button style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: skipButtonBgColor, 
                  color: skipButtonTextColor, 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  marginTop: '8px', 
                  fontSize: '13px' 
                }}>
                  {skipButtonText}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Render product page preview
  const renderProductPagePreview = () => (
    <div className="product-page-preview" style={{ padding: '24px', background: '#fff', minHeight: '100%' }}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 45%', maxWidth: '45%' }}>
          <div style={{ width: '100%', aspectRatio: '1', background: '#f8f8f8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: '1px solid #eee' }}>
            <span style={{ fontSize: '64px', opacity: 0.4 }}>📦</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '50px', height: '50px', background: '#f8f8f8', borderRadius: '8px', border: i === 1 ? '2px solid #1a1a1a' : '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: '16px', opacity: 0.3 }}>📦</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1', minWidth: 0 }}>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px', lineHeight: '1.3' }}>Premium Wireless Headphones Pro</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ color: '#f5a623', fontSize: '12px' }}>★★★★★</span>
            <span style={{ fontSize: '11px', color: '#666' }}>4.8 (2,847 reviews)</span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a' }}>$1,299.00</span>
            <span style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through', marginLeft: '8px' }}>$1,599.00</span>
          </div>
          <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.5', marginBottom: '12px' }}>
            Experience premium sound quality with active noise cancellation. 40-hour battery life, comfortable over-ear design.
          </p>
          <div style={{ marginBottom: '12px', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px' }}>Specifications</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', color: '#666' }}>
              <div>• Battery: 40 hours</div>
              <div>• Bluetooth: 5.2</div>
              <div>• Weight: 250g</div>
              <div>• Driver: 40mm</div>
            </div>
          </div>
          <button style={{ width: '100%', padding: '12px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' }}>Add to Cart</button>
          <div style={{ borderTop: '1px dashed #ddd', paddingTop: '12px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '0 8px', fontSize: '9px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Mix & Match Offer
            </div>
            {renderMixMatchPreview()}
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
          title={bundleInternalName}
          onTitleChange={setBundleInternalName}
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
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MixMatchEditorPreview />
  </React.StrictMode>
);
