import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './components/Editor/EditorLayout.css';

// Import Editor components - same as preview.jsx
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

// Buy X Get Y settings configuration - same structure as BUNDLE_SETTINGS in preview.jsx
const BXGY_SETTINGS = {
  bundle: [
    {
      title: 'Products',
      items: [
        { id: 'customer-buys', icon: '🛍️', label: 'Customer Buys (X)', iconClass: 'icon-buy' },
        { id: 'customer-gets', icon: '🎁', label: 'Customer Gets (Y)', iconClass: 'icon-get' },
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
  { value: 'Free Gift', label: 'Free Gift (100% Off)' },
];

// Mock products for demo
const MOCK_PRODUCTS = [
  { id: 'gid://shopify/Product/1', productId: 'gid://shopify/Product/1', title: 'Classic T-Shirt', price: '29.99', media: tshirt, quantity: 1, optionSelections: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }, { name: 'Color', values: ['Black', 'White', 'Navy'] }] },
  { id: 'gid://shopify/Product/2', productId: 'gid://shopify/Product/2', title: 'Premium Hoodie', price: '59.99', media: tshirt, quantity: 1, optionSelections: [{ name: 'Size', values: ['S', 'M', 'L'] }] },
  { id: 'gid://shopify/Product/3', productId: 'gid://shopify/Product/3', title: 'Slim Fit Jeans', price: '49.99', media: tshirt, quantity: 1, optionSelections: [{ name: 'Size', values: ['28', '30', '32', '34'] }] },
  { id: 'gid://shopify/Product/4', productId: 'gid://shopify/Product/4', title: 'Running Sneakers', price: '89.99', media: tshirt, quantity: 1, optionSelections: [{ name: 'Size', values: ['8', '9', '10', '11'] }] },
  { id: 'gid://shopify/Product/5', productId: 'gid://shopify/Product/5', title: 'Baseball Cap', price: '19.99', media: tshirt, quantity: 1, optionSelections: [] },
  { id: 'gid://shopify/Product/6', productId: 'gid://shopify/Product/6', title: 'Leather Belt', price: '34.99', media: tshirt, quantity: 1, optionSelections: [{ name: 'Size', values: ['S', 'M', 'L'] }] },
];

const BuyXGetYEditorPreview = () => {
  // Tab and setting state
  const [activeTab, setActiveTab] = useState('bundle');
  const [activeSetting, setActiveSetting] = useState('customer-buys');
  const [device, setDevice] = useState('desktop');

  // Bundle data states - internalName is shown in header, bundleTitle is what customers see
  const [bundleInternalName, setBundleInternalName] = useState('Summer BOGO Campaign');
  const [bundleTitle, setBundleTitle] = useState('Buy X Get Y - Save More! 🎁');
  const [secondaryMessage, setSecondaryMessage] = useState('Get this bundle and save on your purchase');
  const [bundleEnabled, setBundleEnabled] = useState(true);
  const [bundlePriority, setBundlePriority] = useState(0);

  // Products states
  const [selectedXProducts, setSelectedXProducts] = useState([MOCK_PRODUCTS[0]]);
  const [selectedYProducts, setSelectedYProducts] = useState([MOCK_PRODUCTS[4]]);
  const [showXProductPicker, setShowXProductPicker] = useState(false);
  const [showYProductPicker, setShowYProductPicker] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [collectionSearchQuery, setCollectionSearchQuery] = useState('');

  // Discount states
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('50');

  // Widget appearance
  const [colorSettings, setColorSettings] = useState({
    primaryTextColor: '#303030',
    secondaryTextColor: '#616161',
    primaryBackgroundColor: '#FFFFFF',
    secondaryBackgroundColor: '#f1f2f4',
    borderColor: '#e0e0e0',
    buttonColor: '#000000',
    countdownBgColor: '#C4290E',
    countdownTextColor: '#FFFFFF',
    getYBannerColor: '#5169DD',
  });

  // Display settings
  const [showCountdown, setShowCountdown] = useState(true);
  const [showEmoji, setShowEmoji] = useState(true);
  const [margins, setMargins] = useState({ top: 20, bottom: 20 });
  const [cornerRadius, setCornerRadius] = useState(20);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [timeLeft] = useState({ hours: '23', minutes: '45', seconds: '30' });

  // Helper functions
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const firstSetting = BXGY_SETTINGS[tabId]?.[0]?.items?.[0]?.id;
    if (firstSetting) setActiveSetting(firstSetting);
  };

  const getFilteredProducts = () => {
    const selectedIds = [...selectedXProducts, ...selectedYProducts].map(p => p.productId);
    let filtered = MOCK_PRODUCTS.filter(p => !selectedIds.includes(p.productId));
    if (productSearchQuery) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(productSearchQuery.toLowerCase()));
    }
    return filtered;
  };

  const addProductToX = (product) => {
    if (!selectedXProducts.find(p => p.productId === product.productId)) {
      setSelectedXProducts([...selectedXProducts, product]);
    }
  };

  const addProductToY = (product) => {
    if (!selectedYProducts.find(p => p.productId === product.productId)) {
      setSelectedYProducts([...selectedYProducts, product]);
    }
  };

  const handleColorChange = (key, value) => {
    setColorSettings(prev => ({ ...prev, [key]: value }));
  };

  const calculateDiscountedPrice = (originalPrice) => {
    const price = parseFloat(originalPrice) || 0;
    const discount = parseFloat(discountValue) || 0;
    if (discountType === 'Percentage') return (price * (1 - discount / 100)).toFixed(2);
    if (discountType === 'Fixed Amount') return Math.max(0, price - discount).toFixed(2);
    if (discountType === 'Free Gift') return '0.00';
    return price.toFixed(2);
  };

  const handleSave = () => alert('Bundle saved! (Demo mode)');

  // Get current settings based on active tab
  const currentSettings = BXGY_SETTINGS[activeTab] || [];

  // Render config panel content based on active setting
  const renderConfigContent = () => {
    const availableProducts = getFilteredProducts();

    switch (activeSetting) {
      case 'customer-buys':
        return (
          <EditorConfigPanel title="Customer Buys (X)" description="Products customer must purchase">
            {showXProductPicker ? (
              <>
                {/* Product Picker Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Select from Inventory</span>
                  <button onClick={() => setShowXProductPicker(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
                </div>
                {/* Search Products */}
                <ConfigFormGroup label="Search Products">
                  <ConfigInput type="text" placeholder="Search by product name..." value={productSearchQuery} onChange={(e) => setProductSearchQuery(e.target.value)} />
                </ConfigFormGroup>
                {/* Search Collections */}
                <ConfigFormGroup label="Search Collections">
                  <ConfigInput type="text" placeholder="Search by collection name..." value={collectionSearchQuery} onChange={(e) => setCollectionSearchQuery(e.target.value)} />
                </ConfigFormGroup>
                {/* Available Products */}
                <div>
                  {availableProducts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                      All products have been added.
                    </div>
                  ) : (
                    availableProducts.map(product => (
                      <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={product.media} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                          <div>
                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{product.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>${product.price}</div>
                          </div>
                        </div>
                        <button onClick={() => addProductToX(product)} style={{ background: 'rgba(81, 105, 221, 0.2)', border: '1px solid #5169DD', borderRadius: '4px', color: '#5169DD', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' }}>+ Add</button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Add Products Button */}
                <button onClick={() => setShowXProductPicker(true)} style={{ width: '100%', padding: '12px', background: 'rgba(81, 105, 221, 0.1)', border: '1px solid #5169DD', borderRadius: '8px', color: '#5169DD', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' }}>
                  + Add Products
                </button>
                {/* Selected Products */}
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Selected Products ({selectedXProducts.length})
                </div>
                {selectedXProducts.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                    No products selected. Click "Add Products" to select from inventory.
                  </div>
                ) : (
                  selectedXProducts.map(product => (
                    <div key={product.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(81, 105, 221, 0.1)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(81, 105, 221, 0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={product.media} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{product.title}</div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>${product.price}</div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedXProducts(selectedXProducts.filter(p => p.productId !== product.productId))} style={{ background: 'rgba(255,59,48,0.2)', border: 'none', borderRadius: '4px', color: '#ff3b30', padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))
                )}
              </>
            )}
          </EditorConfigPanel>
        );

      case 'customer-gets':
        return (
          <EditorConfigPanel title="Customer Gets (Y)" description="Products customer receives at a discount">
            {showYProductPicker ? (
              <>
                {/* Product Picker Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Select from Inventory</span>
                  <button onClick={() => setShowYProductPicker(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
                </div>
                {/* Search Products */}
                <ConfigFormGroup label="Search Products">
                  <ConfigInput type="text" placeholder="Search by product name..." value={productSearchQuery} onChange={(e) => setProductSearchQuery(e.target.value)} />
                </ConfigFormGroup>
                {/* Search Collections */}
                <ConfigFormGroup label="Search Collections">
                  <ConfigInput type="text" placeholder="Search by collection name..." value={collectionSearchQuery} onChange={(e) => setCollectionSearchQuery(e.target.value)} />
                </ConfigFormGroup>
                {/* Available Products */}
                <div>
                  {availableProducts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                      All products have been added.
                    </div>
                  ) : (
                    availableProducts.map(product => (
                      <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={product.media} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                          <div>
                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{product.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>${product.price}</div>
                          </div>
                        </div>
                        <button onClick={() => addProductToY(product)} style={{ background: 'rgba(76, 175, 80, 0.2)', border: '1px solid #4CAF50', borderRadius: '4px', color: '#4CAF50', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' }}>+ Add</button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Add Products Button */}
                <button onClick={() => setShowYProductPicker(true)} style={{ width: '100%', padding: '12px', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4CAF50', borderRadius: '8px', color: '#4CAF50', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' }}>
                  + Add Products
                </button>
                {/* Selected Products */}
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Selected Products ({selectedYProducts.length})
                </div>
                {selectedYProducts.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                    No products selected. Click "Add Products" to select from inventory.
                  </div>
                ) : (
                  selectedYProducts.map(product => (
                    <div key={product.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={product.media} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{product.title}</div>
                          <div style={{ color: '#4CAF50', fontSize: '11px' }}>${calculateDiscountedPrice(product.price)} <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>${product.price}</span></div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedYProducts(selectedYProducts.filter(p => p.productId !== product.productId))} style={{ background: 'rgba(255,59,48,0.2)', border: 'none', borderRadius: '4px', color: '#ff3b30', padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))
                )}
              </>
            )}
          </EditorConfigPanel>
        );

      case 'discount-settings':
        return (
          <EditorConfigPanel title="Discount Settings" description="Configure discount for Y products">
            <ConfigFormGroup label="Discount Type">
              <ConfigSelect value={discountType} onChange={(e) => setDiscountType(e.target.value)} options={DISCOUNT_TYPE_OPTIONS} />
            </ConfigFormGroup>
            {discountType && discountType !== 'Free Gift' && (
              <ConfigFormGroup label={discountType === 'Percentage' ? 'Discount Percentage' : 'Discount Amount ($)'}>
                <ConfigInput type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="e.g., 20" min="0" max={discountType === 'Percentage' ? '100' : undefined} />
              </ConfigFormGroup>
            )}
            {discountType === 'Free Gift' && (
              <div style={{ padding: '12px', background: 'rgba(76, 175, 80, 0.15)', borderRadius: '8px', marginTop: '10px' }}>
                <span style={{ color: '#4CAF50', fontSize: '13px' }}>🎁 Customer gets the "Y" product(s) for FREE!</span>
              </div>
            )}
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
                💡 <strong>What is Priority?</strong><br/>
                When a product is part of multiple bundles, only the bundle with the highest priority is shown to customers.
              </span>
            </div>
          </EditorConfigPanel>
        );

      case 'message-text':
        return (
          <EditorConfigPanel title="Message Text" description="Configure bundle messages shown to customers">
            <ConfigFormGroup label="Primary Message" hint="Main headline for the bundle">
              <ConfigInput type="text" value={bundleTitle} onChange={(e) => setBundleTitle(e.target.value)} placeholder="Buy X Get Y - Save More!" />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Message" hint="Supporting text below the headline">
              <ConfigInput type="text" value={secondaryMessage} onChange={(e) => setSecondaryMessage(e.target.value)} placeholder="Get this bundle and save" />
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

      case 'primary-colors':
        return (
          <EditorConfigPanel title="Primary Colors" description="Main color scheme">
            <ConfigFormGroup label="Primary Text">
              <input type="color" value={colorSettings.primaryTextColor} onChange={(e) => handleColorChange('primaryTextColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Primary Background">
              <input type="color" value={colorSettings.primaryBackgroundColor} onChange={(e) => handleColorChange('primaryBackgroundColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Get Y Banner">
              <input type="color" value={colorSettings.getYBannerColor} onChange={(e) => handleColorChange('getYBannerColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
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

  // Render BXGY preview widget
  const renderBXGYPreview = () => {
    const xTotal = selectedXProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);
    const yOriginal = selectedYProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);
    const yDiscounted = selectedYProducts.reduce((sum, p) => sum + parseFloat(calculateDiscountedPrice(p.price)), 0);
    const total = xTotal + yDiscounted;
    const originalTotal = xTotal + yOriginal;

    return (
      <div style={{ background: colorSettings.secondaryBackgroundColor, padding: '15px', borderRadius: `${cornerRadius}px`, position: 'relative', marginTop: `${margins.top}px`, marginBottom: `${margins.bottom}px` }}>
        <h3 style={{ color: colorSettings.primaryTextColor, fontSize: '16px', fontWeight: 600, marginBottom: '4px', paddingRight: showCountdown ? '150px' : '0' }}>
          {bundleTitle}
        </h3>
        {secondaryMessage && (
          <p style={{ color: colorSettings.secondaryTextColor, fontSize: '13px', marginBottom: '15px', paddingRight: showCountdown ? '150px' : '0' }}>
            {secondaryMessage}
          </p>
        )}
        {showCountdown && (
          <div style={{ position: 'absolute', top: '15px', right: '15px', background: colorSettings.countdownBgColor, color: colorSettings.countdownTextColor, padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500 }}>
            {showEmoji && '🔥 '}Ends In {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
          </div>
        )}
        {/* X Products */}
        {selectedXProducts.map((product) => (
          <div key={product.productId} style={{ padding: '12px', borderRadius: `${Math.max(0, cornerRadius - 5)}px`, marginBottom: '12px', backgroundColor: colorSettings.primaryBackgroundColor, border: `1px solid ${colorSettings.borderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={product.media} alt={product.title} style={{ width: 60, height: 60, borderRadius: '8px', objectFit: 'cover' }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: colorSettings.primaryTextColor }}>{product.title}</p>
                <p style={{ fontWeight: 600, fontSize: '14px', margin: 0, color: colorSettings.primaryTextColor }}>${product.price}</p>
              </div>
            </div>
          </div>
        ))}
        {/* Y Products Banner */}
        {selectedYProducts.length > 0 && (
          <div style={{ backgroundColor: colorSettings.getYBannerColor, padding: '5px', borderRadius: `${cornerRadius}px` }}>
            <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff', textAlign: 'center', padding: '8px 0', margin: 0 }}>
              {discountType === 'Percentage' ? `YOU GET ${discountValue}% OFF ON` : discountType === 'Free Gift' ? '🎁 GET FREE GIFT!' : `YOU GET $${discountValue} OFF ON`}
            </p>
            {selectedYProducts.map((product) => (
              <div key={product.productId} style={{ padding: '12px', borderRadius: `${Math.max(0, cornerRadius - 5)}px`, marginTop: '5px', backgroundColor: 'rgba(255,255,255,0.9)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={product.media} alt={product.title} style={{ width: 60, height: 60, borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: colorSettings.primaryTextColor }}>{product.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#4CAF50' }}>${calculateDiscountedPrice(product.price)}</span>
                      <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#999' }}>${product.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Total */}
        <div style={{ marginTop: '15px', padding: '12px', backgroundColor: colorSettings.primaryBackgroundColor, borderRadius: `${Math.max(0, cornerRadius - 5)}px`, border: `1px solid ${colorSettings.borderColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600, color: colorSettings.primaryTextColor }}>Total</span>
            <div>
              <span style={{ fontWeight: 700, fontSize: '16px', color: colorSettings.primaryTextColor }}>${total.toFixed(2)}</span>
              {total < originalTotal && <span style={{ marginLeft: '8px', fontSize: '13px', textDecoration: 'line-through', color: '#999' }}>${originalTotal.toFixed(2)}</span>}
            </div>
          </div>
          <button style={{ width: '100%', padding: '12px', backgroundColor: colorSettings.buttonColor, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Add Bundle to Cart
          </button>
        </div>
      </div>
    );
  };

  // Render product page preview (same structure as preview.jsx)
  const renderProductPagePreview = () => (
    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Product Info */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          {'★★★★★'.split('').map((_, i) => <span key={i} style={{ color: '#FFB800', fontSize: '14px' }}>★</span>)}
          <span style={{ color: '#666', fontSize: '12px', marginLeft: '4px' }}>4.8 (2,847 reviews)</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>Premium Wireless Headphones Pro</h1>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a' }}>$1,299.00</span>
          <span style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through' }}>$1,599.00</span>
        </div>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
          Experience premium sound quality with active noise cancellation, 40-hour battery life, comfortable over-ear design.
        </p>
        <button style={{ width: '100%', padding: '14px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginBottom: '8px' }}>
          Add to Cart
        </button>
        <div style={{ textAlign: 'center', color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Bundle Offer</div>
      </div>
      {/* Bundle Widget */}
      <div style={{ padding: '0 20px 20px' }}>
        {renderBXGYPreview()}
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
    <BuyXGetYEditorPreview />
  </React.StrictMode>
);
