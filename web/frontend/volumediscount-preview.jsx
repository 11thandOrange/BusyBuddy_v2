import React, { useState, useEffect } from 'react';
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

// Volume Discount settings configuration
const VOLUME_SETTINGS = {
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
        { id: 'quantity-breaks', icon: '📊', label: 'Quantity Breaks', iconClass: 'icon-quantity' },
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

// Mock products
const MOCK_PRODUCTS = [
  { id: 'gid://shopify/Product/1', productId: 'gid://shopify/Product/1', title: 'Classic T-Shirt', price: '29.99', media: tshirt },
  { id: 'gid://shopify/Product/2', productId: 'gid://shopify/Product/2', title: 'Premium Hoodie', price: '59.99', media: tshirt },
  { id: 'gid://shopify/Product/3', productId: 'gid://shopify/Product/3', title: 'Slim Fit Jeans', price: '49.99', media: tshirt },
  { id: 'gid://shopify/Product/4', productId: 'gid://shopify/Product/4', title: 'Running Sneakers', price: '89.99', media: tshirt },
];

const VolumeDiscountEditorPreview = () => {
  // Tab and setting state
  const [activeTab, setActiveTab] = useState('bundle');
  const [activeSetting, setActiveSetting] = useState('select-products');
  const [device, setDevice] = useState('desktop');

  // Bundle data states
  const [bundleTitle, setBundleTitle] = useState('Buy More & Save More! 🔥');
  const [bundleInternalName, setBundleInternalName] = useState('Summer Volume Promo');
  const [secondaryMessage, setSecondaryMessage] = useState('The more you buy, the more you save');
  const [bundleEnabled, setBundleEnabled] = useState(true);
  const [bundlePriority, setBundlePriority] = useState(0);

  // Products states
  const [selectedProducts, setSelectedProducts] = useState([MOCK_PRODUCTS[0]]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Discount states
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('10');

  // Quantity Breaks
  const [quantityBreaks, setQuantityBreaks] = useState([
    { quantity: 2, discount: 10, name: 'Buy 2, get 10% OFF', banner: '', default: false },
    { quantity: 3, discount: 15, name: 'Buy 3, get 15% OFF', banner: 'MOST POPULAR', default: true },
    { quantity: 4, discount: 20, name: 'Buy 4, get 20% OFF', banner: '', default: false },
  ]);

  // Widget interaction - selected quantity
  const [selectedQuantity, setSelectedQuantity] = useState(3);

  // Appearance states
  const [colorSettings, setColorSettings] = useState({
    primaryTextColor: '#303030',
    secondaryTextColor: '#000000',
    primaryBackgroundColor: '#FFFFFF',
    secondaryBackgroundColor: '#f1f2f4',
    borderColor: '#e0e0e0',
    buttonColor: '#000000',
    countdownBgColor: '#C4290E',
    countdownTextColor: '#FFFFFF',
  });
  const [showCountdown, setShowCountdown] = useState(true);
  const [showEmoji, setShowEmoji] = useState(true);
  const [margins, setMargins] = useState({ top: 20, bottom: 20 });
  const [cornerRadius, setCornerRadius] = useState(20);

  // Button settings
  const [addToCartText, setAddToCartText] = useState('Add to Cart');
  const [addToCartBgColor, setAddToCartBgColor] = useState('#000000');
  const [addToCartTextColor, setAddToCartTextColor] = useState('#FFFFFF');
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [skipButtonText, setSkipButtonText] = useState('Skip Offer');
  const [skipButtonBgColor, setSkipButtonBgColor] = useState('#f5f5f5');
  const [skipButtonTextColor, setSkipButtonTextColor] = useState('#666666');

  // Schedule
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Timer
  const [timeLeft, setTimeLeft] = useState({ hours: '23', minutes: '45', seconds: '30' });

  // Preview mode
  const [previewMode, setPreviewMode] = useState('desktop');

  // Countdown timer effect
  useEffect(() => {
    if (!showCountdown) return;
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay - now;
      if (diff > 0) {
        setTimeLeft({
          hours: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
          minutes: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0'),
          seconds: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [showCountdown]);

  const handleAddProduct = (product) => {
    if (!selectedProducts.find(p => p.productId === product.productId)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setShowProductPicker(false);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  // Get current quantity break
  const getCurrentBreak = () => {
    return quantityBreaks.find(qb => qb.quantity === selectedQuantity) || quantityBreaks.find(qb => qb.default) || quantityBreaks[0];
  };

  const calculateDiscountedPrice = (originalPrice) => {
    const price = parseFloat(originalPrice) || 0;
    const currentBreak = getCurrentBreak();
    const discount = currentBreak?.discount || 0;
    return (price * (1 - discount / 100)).toFixed(2);
  };

  const handleSave = () => alert('Bundle saved! (Demo mode)');

  const currentSettings = VOLUME_SETTINGS[activeTab] || [];

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const firstSetting = VOLUME_SETTINGS[tabId]?.[0]?.items?.[0];
    if (firstSetting) setActiveSetting(firstSetting.id);
  };

  // Render config panel
  const renderConfigContent = () => {
    switch (activeSetting) {
      case 'select-products':
        return (
          <EditorConfigPanel title="Select Products" description="Add products to your volume discount offer">
            {showProductPicker ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Select from Inventory</span>
                  <button onClick={() => setShowProductPicker(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
                </div>
                <ConfigFormGroup label="Search Products">
                  <ConfigInput type="text" placeholder="Search by product name..." value={productSearchQuery} onChange={(e) => setProductSearchQuery(e.target.value)} />
                </ConfigFormGroup>
                <div>
                  {MOCK_PRODUCTS.filter(p => p.title.toLowerCase().includes(productSearchQuery.toLowerCase())).map(product => (
                    <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={product.media} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{product.title}</div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>${product.price}</div>
                        </div>
                      </div>
                      <button onClick={() => handleAddProduct(product)} style={{ background: 'rgba(81, 105, 221, 0.2)', border: '1px solid #5169DD', borderRadius: '4px', color: '#5169DD', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' }}>+ Add</button>
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
                      <button onClick={() => handleRemoveProduct(product.productId)} style={{ background: 'rgba(255,59,48,0.2)', border: 'none', borderRadius: '4px', color: '#ff3b30', padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))
                )}
              </>
            )}
          </EditorConfigPanel>
        );

      case 'quantity-breaks':
        return (
          <EditorConfigPanel title="Quantity Breaks" description="Set different discounts based on quantity purchased">
            {quantityBreaks.map((qb, index) => (
              <div key={index} style={{ padding: '16px', background: qb.default ? 'rgba(81, 105, 221, 0.15)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px', border: qb.default ? '2px solid #5169DD' : '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{qb.default && <span style={{ color: '#5169DD', marginRight: '8px' }}>★</span>}Tier {index + 1}</span>
                  {quantityBreaks.length > 1 && <button onClick={() => { const newBreaks = [...quantityBreaks]; newBreaks.splice(index, 1); setQuantityBreaks(newBreaks); }} style={{ background: 'rgba(255,59,48,0.2)', border: 'none', borderRadius: '4px', color: '#ff3b30', padding: '4px 8px', cursor: 'pointer' }}>✕</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <ConfigFormGroup label="Quantity">
                    <ConfigInput type="number" value={qb.quantity} onChange={(e) => { const newBreaks = [...quantityBreaks]; newBreaks[index].quantity = parseInt(e.target.value) || 1; setQuantityBreaks(newBreaks); }} />
                  </ConfigFormGroup>
                  <ConfigFormGroup label="Discount %">
                    <ConfigInput type="number" value={qb.discount} onChange={(e) => { const newBreaks = [...quantityBreaks]; newBreaks[index].discount = parseInt(e.target.value) || 0; setQuantityBreaks(newBreaks); }} />
                  </ConfigFormGroup>
                </div>
                <ConfigFormGroup label="Display Name">
                  <ConfigInput type="text" value={qb.name} onChange={(e) => { const newBreaks = [...quantityBreaks]; newBreaks[index].name = e.target.value; setQuantityBreaks(newBreaks); }} />
                </ConfigFormGroup>
                <ConfigFormGroup label="Banner Text">
                  <ConfigInput type="text" value={qb.banner} onChange={(e) => { const newBreaks = [...quantityBreaks]; newBreaks[index].banner = e.target.value; setQuantityBreaks(newBreaks); }} placeholder="e.g., MOST POPULAR" />
                </ConfigFormGroup>
                <ConfigToggleRow label="Set as default" checked={qb.default} onChange={(checked) => { const newBreaks = [...quantityBreaks]; newBreaks.forEach((b, i) => b.default = i === index && checked); setQuantityBreaks(newBreaks); }} />
              </div>
            ))}
            <button onClick={() => { const last = quantityBreaks[quantityBreaks.length - 1]; setQuantityBreaks([...quantityBreaks, { quantity: (last?.quantity || 1) + 1, discount: Math.min((last?.discount || 0) + 5, 100), name: `Buy ${(last?.quantity || 1) + 1}, get ${Math.min((last?.discount || 0) + 5, 100)}% OFF`, banner: '', default: false }]); }} style={{ width: '100%', padding: '12px', background: 'rgba(81, 105, 221, 0.1)', border: '1px solid #5169DD', borderRadius: '8px', color: '#5169DD', fontWeight: '600', cursor: 'pointer' }}>+ Add Quantity Break</button>
          </EditorConfigPanel>
        );

      case 'bundle-priority':
        return (
          <EditorConfigPanel title="Priority Settings" description="Control bundle display order">
            <ConfigFormGroup label="Bundle Priority" description="Higher priority bundles are displayed first">
              <ConfigInput type="number" value={bundlePriority} onChange={(e) => setBundlePriority(parseInt(e.target.value) || 0)} placeholder="0" />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'message-text':
        return (
          <EditorConfigPanel title="Message Text" description="Customize the bundle message">
            <ConfigFormGroup label="Primary Message">
              <ConfigInput type="text" value={bundleTitle} onChange={(e) => setBundleTitle(e.target.value)} placeholder="Buy More & Save More!" />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Message">
              <ConfigInput type="text" value={secondaryMessage} onChange={(e) => setSecondaryMessage(e.target.value)} placeholder="The more you buy, the more you save" />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'emoji-icons':
        return (
          <EditorConfigPanel title="Emoji & Icons" description="Add visual elements to your bundle">
            <ConfigToggleRow label="Show Emoji in Title" checked={showEmoji} onChange={setShowEmoji} />
          </EditorConfigPanel>
        );

      case 'countdown-timer':
        return (
          <EditorConfigPanel title="Countdown Timer" description="Create urgency with a countdown">
            <ConfigToggleRow label="Show Countdown Timer" checked={showCountdown} onChange={setShowCountdown} />
            {showCountdown && (
              <>
                <ConfigFormGroup label="Background Color">
                  <input type="color" value={colorSettings.countdownBgColor} onChange={(e) => setColorSettings({ ...colorSettings, countdownBgColor: e.target.value })} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                </ConfigFormGroup>
                <ConfigFormGroup label="Text Color">
                  <input type="color" value={colorSettings.countdownTextColor} onChange={(e) => setColorSettings({ ...colorSettings, countdownTextColor: e.target.value })} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'add-to-cart-button':
        return (
          <EditorConfigPanel title="Add to Cart Button" description="Customize the add to cart button">
            <ConfigFormGroup label="Button Text">
              <ConfigInput type="text" value={addToCartText} onChange={(e) => setAddToCartText(e.target.value)} placeholder="Add to Cart" />
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
          <EditorConfigPanel title="Skip Offer Button" description="Customize the skip offer option">
            <ConfigToggleRow label="Show Skip Button" checked={showSkipButton} onChange={setShowSkipButton} />
            {showSkipButton && (
              <>
                <ConfigFormGroup label="Button Text">
                  <ConfigInput type="text" value={skipButtonText} onChange={(e) => setSkipButtonText(e.target.value)} placeholder="Skip Offer" />
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
          <EditorConfigPanel title="Primary Colors" description="Set the main color scheme">
            <ConfigFormGroup label="Primary Text Color">
              <input type="color" value={colorSettings.primaryTextColor} onChange={(e) => setColorSettings({ ...colorSettings, primaryTextColor: e.target.value })} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Primary Background">
              <input type="color" value={colorSettings.primaryBackgroundColor} onChange={(e) => setColorSettings({ ...colorSettings, primaryBackgroundColor: e.target.value })} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'secondary-colors':
        return (
          <EditorConfigPanel title="Secondary Colors" description="Set the secondary color scheme">
            <ConfigFormGroup label="Secondary Text Color">
              <input type="color" value={colorSettings.secondaryTextColor} onChange={(e) => setColorSettings({ ...colorSettings, secondaryTextColor: e.target.value })} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Background">
              <input type="color" value={colorSettings.secondaryBackgroundColor} onChange={(e) => setColorSettings({ ...colorSettings, secondaryBackgroundColor: e.target.value })} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Border Color">
              <input type="color" value={colorSettings.borderColor} onChange={(e) => setColorSettings({ ...colorSettings, borderColor: e.target.value })} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'margins':
        return (
          <EditorConfigPanel title="Margins" description="Control spacing around the widget">
            <ConfigFormGroup label="Top Margin (px)">
              <ConfigInput type="number" value={margins.top} onChange={(e) => setMargins({ ...margins, top: parseInt(e.target.value) || 0 })} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Bottom Margin (px)">
              <ConfigInput type="number" value={margins.bottom} onChange={(e) => setMargins({ ...margins, bottom: parseInt(e.target.value) || 0 })} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'card-settings':
        return (
          <EditorConfigPanel title="Card Settings" description="Customize the widget card appearance">
            <ConfigFormGroup label="Corner Radius (px)">
              <ConfigInput type="number" value={cornerRadius} onChange={(e) => setCornerRadius(parseInt(e.target.value) || 0)} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'start-date':
        return (
          <EditorConfigPanel title="Start Date" description="When the bundle becomes active">
            <ConfigFormGroup label="Start Date & Time">
              <ConfigInput type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'end-date':
        return (
          <EditorConfigPanel title="End Date" description="When the bundle expires">
            <ConfigFormGroup label="End Date & Time">
              <ConfigInput type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      default:
        return <p>Select a setting</p>;
    }
  };

  // Render Volume Discount widget preview with interactive selection
  const renderVolumePreview = () => {
    const hasProducts = selectedProducts.length > 0;
    const currentBreak = getCurrentBreak();

    return (
      <div style={{ backgroundColor: colorSettings.secondaryBackgroundColor, borderRadius: `${cornerRadius}px`, padding: '20px', marginTop: `${margins.top}px`, marginBottom: `${margins.bottom}px`, maxWidth: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: colorSettings.primaryTextColor, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{bundleTitle}</h3>
          {showCountdown && (
            <div style={{ backgroundColor: colorSettings.countdownBgColor, color: colorSettings.countdownTextColor, padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
              {showEmoji && '⏱️'} Ends in {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
            </div>
          )}
        </div>

        {!hasProducts ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <p>Add products to see preview</p>
          </div>
        ) : (
          <>
            {/* Quantity Break Options - Interactive */}
            <div style={{ marginBottom: '20px' }}>
              {quantityBreaks.map((qb, index) => {
                const isSelected = selectedQuantity === qb.quantity;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedQuantity(qb.quantity)}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
                      backgroundColor: isSelected ? '#5169DD' : colorSettings.primaryBackgroundColor,
                      color: isSelected ? 'white' : colorSettings.primaryTextColor,
                      border: isSelected ? 'none' : `1px solid ${colorSettings.borderColor}`,
                      cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative',
                    }}
                  >
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: isSelected ? '2px solid white' : '2px solid #ccc', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white' }} />}
                    </div>
                    <div style={{ flex: 1 }}><span style={{ fontWeight: 600, fontSize: '14px' }}>{qb.name}</span></div>
                    <div style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#e8f5e9', color: isSelected ? 'white' : '#4CAF50', fontSize: '12px', fontWeight: 600 }}>{qb.discount}% OFF</div>
                    {qb.banner && <div style={{ position: 'absolute', top: '-8px', right: '16px', backgroundColor: '#FF9800', color: 'white', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>{qb.banner}</div>}
                  </div>
                );
              })}
            </div>

            {/* Product Display */}
            <div style={{ padding: '15px', backgroundColor: colorSettings.primaryBackgroundColor, borderRadius: `${Math.max(0, cornerRadius - 5)}px`, border: `1px solid ${colorSettings.borderColor}`, marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={selectedProducts[0]?.media || tshirt} alt={selectedProducts[0]?.title} style={{ width: '80px', height: '80px', borderRadius: '10px', marginRight: '15px', objectFit: 'cover', border: `1px solid ${colorSettings.borderColor}` }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '5px', color: colorSettings.primaryTextColor }}>{selectedProducts[0]?.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#4CAF50' }}>${calculateDiscountedPrice(selectedProducts[0]?.price)}</span>
                    <span style={{ width: '1.5px', height: '10px', background: colorSettings.primaryTextColor, opacity: 0.3 }}></span>
                    <span style={{ color: colorSettings.secondaryTextColor, fontSize: '12px', textDecoration: 'line-through' }}>${selectedProducts[0]?.price}</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 500, color: colorSettings.secondaryTextColor, display: 'block', marginBottom: '4px' }}>Quantity</label>
                <select value={selectedQuantity} onChange={(e) => setSelectedQuantity(parseInt(e.target.value))} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colorSettings.borderColor}`, backgroundColor: colorSettings.primaryBackgroundColor, color: colorSettings.primaryTextColor, fontSize: '13px', cursor: 'pointer' }}>
                  {quantityBreaks.map((qb) => <option key={qb.quantity} value={qb.quantity}>{qb.quantity}</option>)}
                </select>
              </div>
            </div>

            {/* Total Section */}
            <div style={{ padding: '15px', backgroundColor: colorSettings.primaryBackgroundColor, borderRadius: `${Math.max(0, cornerRadius - 5)}px`, border: `1px solid ${colorSettings.borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: colorSettings.primaryTextColor }}>Total ({selectedQuantity} items)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(() => {
                    const originalPrice = parseFloat(selectedProducts[0]?.price || 0) * selectedQuantity;
                    const discountedPrice = parseFloat(calculateDiscountedPrice(selectedProducts[0]?.price)) * selectedQuantity;
                    return (<><span style={{ fontWeight: 700, fontSize: '18px', color: colorSettings.primaryTextColor }}>${discountedPrice.toFixed(2)}</span><span style={{ width: '1.5px', height: '12px', background: colorSettings.primaryTextColor, opacity: 0.3 }}></span><span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999' }}>${originalPrice.toFixed(2)}</span></>);
                  })()}
                </div>
              </div>
              <button style={{ width: '100%', padding: '14px', backgroundColor: addToCartBgColor, color: addToCartTextColor, border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>{addToCartText}</button>
              {showSkipButton && <button style={{ width: '100%', padding: '12px', backgroundColor: skipButtonBgColor, color: skipButtonTextColor, border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', marginTop: '8px', fontSize: '13px' }}>{skipButtonText}</button>}
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
              Volume Discount Offer
            </div>
            {renderVolumePreview()}
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
    <VolumeDiscountEditorPreview />
  </React.StrictMode>
);
