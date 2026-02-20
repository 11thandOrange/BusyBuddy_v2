import React, { useState, useEffect } from 'react';
import { useAppBridge } from "@shopify/app-bridge-react";
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
} from '../../components/Editor';
import tshirt from "./tshirt.png";

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

const DISCOUNT_TYPE_OPTIONS = [
  { value: '', label: 'Select Discount Type' },
  { value: 'Percentage', label: 'Percentage Discount' },
  { value: 'Fixed Amount', label: 'Fixed Amount' },
];

export default function VolumeDiscountEditor({ editingBundle, onSave, onCancel }) {
  const shopify = useAppBridge();

  // Tab and setting state
  const [activeTab, setActiveTab] = useState('bundle');
  const [activeSettingId, setActiveSettingId] = useState('select-products');

  // Bundle data states
  const [bundleTitle, setBundleTitle] = useState('Buy More & Save More! 🔥');
  const [bundleInternalName, setBundleInternalName] = useState('');
  const [secondaryMessage, setSecondaryMessage] = useState('The more you buy, the more you save');
  const [bundleEnabled, setBundleEnabled] = useState(true);
  const [bundlePriority, setBundlePriority] = useState(0);

  // Products states
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Discount states
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('10');

  // Quantity Breaks state
  const [quantityBreaks, setQuantityBreaks] = useState([
    { quantity: 2, discount: 10, name: 'Buy 2, get 10% OFF', banner: '', default: true },
    { quantity: 3, discount: 15, name: 'Buy 3, get 15% OFF', banner: '', default: false },
    { quantity: 4, discount: 20, name: 'Buy 4, get 20% OFF', banner: '', default: false },
  ]);

  // Appearance states
  const [colorSettings, setColorSettings] = useState({
    primaryTextColor: '#303030',
    secondaryTextColor: '#000000',
    primaryBackgroundColor: '#FFFFFF',
    secondaryBackgroundColor: '#f1f2f4',
    borderColor: '#FFFFFF',
    buttonColor: '#000000',
    countdownBgColor: '#C4290E',
    countdownTextColor: '#FFFFFF',
  });
  const [showCountdown, setShowCountdown] = useState(false);
  const [showEmoji, setShowEmoji] = useState(true);
  const [margins, setMargins] = useState({ top: 20, bottom: 20 });
  const [cornerRadius, setCornerRadius] = useState(20);

  // Schedule states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Button settings
  const [addToCartText, setAddToCartText] = useState('Add to Cart');
  const [addToCartBgColor, setAddToCartBgColor] = useState('#000000');
  const [addToCartTextColor, setAddToCartTextColor] = useState('#FFFFFF');
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [skipButtonText, setSkipButtonText] = useState('Skip Offer');
  const [skipButtonBgColor, setSkipButtonBgColor] = useState('#f5f5f5');
  const [skipButtonTextColor, setSkipButtonTextColor] = useState('#666666');

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Timer display
  const [timeLeft, setTimeLeft] = useState({ hours: '23', minutes: '59', seconds: '59' });

  // Load editing bundle data
  useEffect(() => {
    if (editingBundle) {
      setBundleTitle(editingBundle.title || 'Buy More & Save More! 🔥');
      setBundleInternalName(editingBundle.internalName || '');
      setSecondaryMessage(editingBundle.secondaryMessage || '');
      setBundleEnabled(editingBundle.status ?? true);
      setBundlePriority(editingBundle.bundlePriority || 0);
      setSelectedProducts(editingBundle.products || []);
      setDiscountType(editingBundle.discountType || 'Percentage');
      setDiscountValue(editingBundle.discountValue?.toString() || '10');
      
      // Load quantity breaks
      if (editingBundle.quantityBreaks && editingBundle.quantityBreaks.length > 0) {
        setQuantityBreaks(editingBundle.quantityBreaks);
      }

      // Widget appearance
      if (editingBundle.widgetAppearance) {
        setColorSettings({
          primaryTextColor: editingBundle.widgetAppearance.primaryTextColor || '#303030',
          secondaryTextColor: editingBundle.widgetAppearance.secondaryTextColor || '#000000',
          primaryBackgroundColor: editingBundle.widgetAppearance.PrimaryBackgroundColor || '#FFFFFF',
          secondaryBackgroundColor: editingBundle.widgetAppearance.secondaryBackgroundColor || '#f1f2f4',
          borderColor: editingBundle.widgetAppearance.borderColor || '#FFFFFF',
          buttonColor: editingBundle.widgetAppearance.buttonColor || '#000000',
          countdownBgColor: editingBundle.widgetAppearance.offerTagBackgroundColor || '#C4290E',
          countdownTextColor: editingBundle.widgetAppearance.offerTagTextColor || '#FFFFFF',
        });
        setShowCountdown(editingBundle.widgetAppearance.isShowCountDownTimer || false);
        setShowEmoji(editingBundle.widgetAppearance.addEmoji ?? true);
        setMargins({
          top: editingBundle.widgetAppearance.topMargin || 20,
          bottom: editingBundle.widgetAppearance.bottomMargin || 20,
        });
        setCornerRadius(editingBundle.widgetAppearance.cardCornerRadius || 20);

        // Button settings
        setAddToCartText(editingBundle.widgetAppearance.addToCartText || 'Add to Cart');
        setAddToCartBgColor(editingBundle.widgetAppearance.addToCartBgColor || '#000000');
        setAddToCartTextColor(editingBundle.widgetAppearance.addToCartTextColor || '#FFFFFF');
        setShowSkipButton(editingBundle.widgetAppearance.showSkipButton ?? true);
        setSkipButtonText(editingBundle.widgetAppearance.skipButtonText || 'Skip Offer');
        setSkipButtonBgColor(editingBundle.widgetAppearance.skipButtonBgColor || '#f5f5f5');
        setSkipButtonTextColor(editingBundle.widgetAppearance.skipButtonTextColor || '#666666');
      }

      // Schedule
      if (editingBundle.startDate) setStartDate(new Date(editingBundle.startDate).toISOString().slice(0, 16));
      if (editingBundle.endDate) setEndDate(new Date(editingBundle.endDate).toISOString().slice(0, 16));
    }
  }, [editingBundle]);

  // Fetch store products
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await fetch("/api/products", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          const products = data.data?.products?.edges?.map(edge => ({
            productId: edge.node.id,
            title: edge.node.title,
            price: edge.node.variants?.nodes?.[0]?.price || '0',
            media: edge.node.images?.edges?.[0]?.node?.url || tshirt,
            variants: edge.node.variants?.nodes || [],
          })) || [];
          setStoreProducts(products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  // Filtered products for search
  const getFilteredProducts = () => {
    if (!productSearchQuery) return storeProducts;
    return storeProducts.filter(p => p.title.toLowerCase().includes(productSearchQuery.toLowerCase()));
  };

  // Add product to bundle
  const handleAddProduct = (product) => {
    if (!selectedProducts.find(p => p.productId === product.productId)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setShowProductPicker(false);
    setProductSearchQuery('');
  };

  // Remove product from bundle
  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (originalPrice, breakDiscount = null) => {
    const price = parseFloat(originalPrice) || 0;
    const discount = breakDiscount !== null ? parseFloat(breakDiscount) : parseFloat(discountValue) || 0;
    if (discountType === 'Percentage') return (price * (1 - discount / 100)).toFixed(2);
    if (discountType === 'Fixed Amount') return Math.max(0, price - discount).toFixed(2);
    return price.toFixed(2);
  };

  // Quantity Break handlers
  const handleAddQuantityBreak = () => {
    const lastBreak = quantityBreaks[quantityBreaks.length - 1];
    const newQuantity = (lastBreak?.quantity || 1) + 1;
    const newDiscount = Math.min((lastBreak?.discount || 0) + 5, 100);
    setQuantityBreaks([
      ...quantityBreaks,
      {
        quantity: newQuantity,
        discount: newDiscount,
        name: `Buy ${newQuantity}, get ${newDiscount}% OFF`,
        banner: '',
        default: false,
      },
    ]);
  };

  const handleRemoveQuantityBreak = (index) => {
    if (quantityBreaks.length > 1) {
      const newBreaks = [...quantityBreaks];
      newBreaks.splice(index, 1);
      // Ensure at least one is default
      if (!newBreaks.some(b => b.default) && newBreaks.length > 0) {
        newBreaks[0].default = true;
      }
      setQuantityBreaks(newBreaks);
    }
  };

  const handleQuantityBreakChange = (index, field, value) => {
    const newBreaks = [...quantityBreaks];
    newBreaks[index][field] = value;
    
    // Auto-update name if quantity or discount changes
    if (field === 'quantity' || field === 'discount') {
      newBreaks[index].name = `Buy ${newBreaks[index].quantity}, get ${newBreaks[index].discount}% OFF`;
    }
    
    // Handle default toggle
    if (field === 'default' && value === true) {
      newBreaks.forEach((b, i) => {
        b.default = i === index;
      });
    }
    
    setQuantityBreaks(newBreaks);
  };

  // Get default quantity break
  const getDefaultBreak = () => {
    return quantityBreaks.find(b => b.default) || quantityBreaks[0];
  };

  // Save handler
  const handleSave = async () => {
    // Validation
    if (!bundleTitle.trim()) {
      shopify?.toast?.show("Please enter a bundle title", { duration: 3000 });
      return;
    }
    if (selectedProducts.length < 1) {
      shopify?.toast?.show("Please select at least 1 product", { duration: 3000 });
      return;
    }
    if (!discountType) {
      shopify?.toast?.show("Please select a discount type", { duration: 3000 });
      return;
    }
    if (quantityBreaks.length < 1) {
      shopify?.toast?.show("Please add at least one quantity break", { duration: 3000 });
      return;
    }

    const bundleData = {
      title: bundleTitle,
      secondaryMessage: secondaryMessage,
      products: selectedProducts,
      quantityBreaks: quantityBreaks,
      discountType: discountType,
      discountValue: parseFloat(discountValue) || 0,
      status: bundleEnabled,
      internalName: bundleInternalName,
      type: "Volume Discount",
      bundlePriority: parseInt(bundlePriority) || 0,
      widgetAppearance: {
        primaryTextColor: colorSettings.primaryTextColor,
        secondaryTextColor: colorSettings.secondaryTextColor,
        PrimaryBackgroundColor: colorSettings.primaryBackgroundColor,
        secondaryBackgroundColor: colorSettings.secondaryBackgroundColor,
        borderColor: colorSettings.borderColor,
        buttonColor: colorSettings.buttonColor,
        offerTagBackgroundColor: colorSettings.countdownBgColor,
        offerTagTextColor: colorSettings.countdownTextColor,
        isShowCountDownTimer: showCountdown,
        addEmoji: showEmoji,
        topMargin: margins.top,
        bottomMargin: margins.bottom,
        cardCornerRadius: cornerRadius,
        // Button settings
        addToCartText: addToCartText,
        addToCartBgColor: addToCartBgColor,
        addToCartTextColor: addToCartTextColor,
        showSkipButton: showSkipButton,
        skipButtonText: skipButtonText,
        skipButtonBgColor: skipButtonBgColor,
        skipButtonTextColor: skipButtonTextColor,
      },
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setIsSaving(true);

    try {
      const isEditing = !!editingBundle?._id;
      const url = isEditing ? `/api/bundles/${editingBundle._id}` : "/api/bundles";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundleData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Bundle " + (isEditing ? "updated" : "created") + " successfully:", data);
        shopify?.toast?.show(`Bundle ${isEditing ? "updated" : "created"} successfully!`, { duration: 5000 });
        onSave?.(bundleData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error saving bundle:", errorData);
        shopify?.toast?.show(errorData.message || "Failed to save bundle", { duration: 5000 });
      }
    } catch (error) {
      console.error("Error saving bundle:", error);
      shopify?.toast?.show("An error occurred while saving the bundle", { duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  // Render config panel content based on active setting
  const renderConfigContent = () => {
    const availableProducts = getFilteredProducts();

    switch (activeSettingId) {
      case 'select-products':
        return (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Select Products</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Add products to your volume discount offer</p>
            
            <button
              onClick={() => setShowProductPicker(true)}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#f8f9fa', border: '1px dashed #ccc',
                borderRadius: '8px', cursor: 'pointer', marginBottom: '16px', fontSize: '14px', fontWeight: 500,
              }}
            >
              + Add Products
            </button>

            {showProductPicker && (
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '8px' }}
                />
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {productsLoading ? (
                    <p style={{ textAlign: 'center', padding: '12px', color: '#666' }}>Loading products...</p>
                  ) : availableProducts.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '12px', color: '#666' }}>No products found</p>
                  ) : (
                    availableProducts.map(product => (
                      <div
                        key={product.productId}
                        onClick={() => handleAddProduct(product)}
                        style={{
                          display: 'flex', alignItems: 'center', padding: '8px', cursor: 'pointer',
                          borderRadius: '6px', marginBottom: '4px', backgroundColor: '#fff', border: '1px solid #eee',
                        }}
                      >
                        <img src={product.media || tshirt} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px', marginRight: '10px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{product.title}</p>
                          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>${product.price}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>SELECTED PRODUCTS ({selectedProducts.length})</p>
              {selectedProducts.map((product, index) => (
                <div key={product.productId || index} style={{
                  display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: '#f8f9fa',
                  borderRadius: '8px', marginBottom: '8px',
                }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#e9ecef', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
                    <span style={{ fontSize: '18px' }}>📦</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{product.title}</p>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>${product.price}</p>
                  </div>
                  <button onClick={() => handleRemoveProduct(product.productId)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'quantity-breaks':
        return (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Quantity Breaks</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Set different discounts based on quantity purchased</p>
            
            {quantityBreaks.map((qb, index) => (
              <div key={index} style={{
                padding: '16px', backgroundColor: qb.default ? '#f0f4ff' : '#f8f9fa',
                borderRadius: '8px', marginBottom: '12px', border: qb.default ? '2px solid #5169DD' : '1px solid #eee',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>
                    {qb.default && <span style={{ color: '#5169DD', marginRight: '8px' }}>★</span>}
                    Tier {index + 1}
                  </span>
                  {quantityBreaks.length > 1 && (
                    <button onClick={() => handleRemoveQuantityBreak(index)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}>✕</button>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#666', display: 'block', marginBottom: '4px' }}>Quantity</label>
                    <input
                      type="number"
                      value={qb.quantity}
                      onChange={(e) => handleQuantityBreakChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#666', display: 'block', marginBottom: '4px' }}>Discount %</label>
                    <input
                      type="number"
                      value={qb.discount}
                      onChange={(e) => handleQuantityBreakChange(index, 'discount', parseInt(e.target.value) || 0)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#666', display: 'block', marginBottom: '4px' }}>Display Name</label>
                  <input
                    type="text"
                    value={qb.name}
                    onChange={(e) => handleQuantityBreakChange(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#666', display: 'block', marginBottom: '4px' }}>Banner Text (optional)</label>
                  <input
                    type="text"
                    value={qb.banner}
                    onChange={(e) => handleQuantityBreakChange(index, 'banner', e.target.value)}
                    placeholder="e.g., MOST POPULAR"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={qb.default}
                    onChange={(e) => handleQuantityBreakChange(index, 'default', e.target.checked)}
                  />
                  <span style={{ fontSize: '13px' }}>Set as default selection</span>
                </label>
              </div>
            ))}
            
            <button
              onClick={handleAddQuantityBreak}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#f8f9fa', border: '1px dashed #ccc',
                borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
              }}
            >
              + Add Another Quantity Break
            </button>
          </div>
        );

      case 'bundle-priority':
        return (
          <ConfigFormGroup title="Priority" description="Set bundle display priority (higher = shown first)">
            <ConfigInput
              label="Priority Order"
              type="number"
              value={bundlePriority}
              onChange={(val) => setBundlePriority(parseInt(val) || 0)}
              placeholder="0"
            />
          </ConfigFormGroup>
        );

      case 'message-text':
        return (
          <ConfigFormGroup title="Message Text" description="Customize the offer messages">
            <ConfigInput label="Primary Message" value={bundleTitle} onChange={setBundleTitle} placeholder="Buy More & Save More!" />
            <ConfigInput label="Secondary Message" value={secondaryMessage} onChange={setSecondaryMessage} placeholder="The more you buy, the more you save" />
          </ConfigFormGroup>
        );

      case 'emoji-icons':
        return (
          <ConfigFormGroup title="Emoji & Icons" description="Toggle emoji and icon display">
            <ConfigToggleRow label="Show Emoji in Timer" checked={showEmoji} onChange={setShowEmoji} />
          </ConfigFormGroup>
        );

      case 'countdown-timer':
        return (
          <ConfigFormGroup title="Countdown Timer" description="Configure the countdown timer">
            <ConfigToggleRow label="Show Countdown Timer" checked={showCountdown} onChange={setShowCountdown} />
            {showCountdown && (
              <>
                <ConfigInput label="Timer Background Color" type="color" value={colorSettings.countdownBgColor} onChange={(val) => setColorSettings({ ...colorSettings, countdownBgColor: val })} />
                <ConfigInput label="Timer Text Color" type="color" value={colorSettings.countdownTextColor} onChange={(val) => setColorSettings({ ...colorSettings, countdownTextColor: val })} />
              </>
            )}
          </ConfigFormGroup>
        );

      case 'add-to-cart-button':
        return (
          <ConfigFormGroup title="Add to Cart Button" description="Customize the add to cart button">
            <ConfigInput label="Button Text" value={addToCartText} onChange={setAddToCartText} placeholder="Add to Cart" />
            <ConfigInput label="Background Color" type="color" value={addToCartBgColor} onChange={setAddToCartBgColor} />
            <ConfigInput label="Text Color" type="color" value={addToCartTextColor} onChange={setAddToCartTextColor} />
          </ConfigFormGroup>
        );

      case 'skip-offer-button':
        return (
          <ConfigFormGroup title="Skip Offer Button" description="Customize the skip offer button">
            <ConfigToggleRow label="Show Skip Button" checked={showSkipButton} onChange={setShowSkipButton} />
            {showSkipButton && (
              <>
                <ConfigInput label="Button Text" value={skipButtonText} onChange={setSkipButtonText} placeholder="Skip Offer" />
                <ConfigInput label="Background Color" type="color" value={skipButtonBgColor} onChange={setSkipButtonBgColor} />
                <ConfigInput label="Text Color" type="color" value={skipButtonTextColor} onChange={setSkipButtonTextColor} />
              </>
            )}
          </ConfigFormGroup>
        );

      case 'primary-colors':
        return (
          <ConfigFormGroup title="Primary Colors" description="Set primary colors">
            <ConfigInput label="Primary Text Color" type="color" value={colorSettings.primaryTextColor} onChange={(val) => setColorSettings({ ...colorSettings, primaryTextColor: val })} />
            <ConfigInput label="Primary Background Color" type="color" value={colorSettings.primaryBackgroundColor} onChange={(val) => setColorSettings({ ...colorSettings, primaryBackgroundColor: val })} />
          </ConfigFormGroup>
        );

      case 'secondary-colors':
        return (
          <ConfigFormGroup title="Secondary Colors" description="Set secondary colors">
            <ConfigInput label="Secondary Text Color" type="color" value={colorSettings.secondaryTextColor} onChange={(val) => setColorSettings({ ...colorSettings, secondaryTextColor: val })} />
            <ConfigInput label="Secondary Background Color" type="color" value={colorSettings.secondaryBackgroundColor} onChange={(val) => setColorSettings({ ...colorSettings, secondaryBackgroundColor: val })} />
            <ConfigInput label="Border Color" type="color" value={colorSettings.borderColor} onChange={(val) => setColorSettings({ ...colorSettings, borderColor: val })} />
          </ConfigFormGroup>
        );

      case 'margins':
        return (
          <ConfigFormGroup title="Margins" description="Set widget margins">
            <ConfigInput label="Top Margin (px)" type="number" value={margins.top} onChange={(val) => setMargins({ ...margins, top: parseInt(val) || 0 })} />
            <ConfigInput label="Bottom Margin (px)" type="number" value={margins.bottom} onChange={(val) => setMargins({ ...margins, bottom: parseInt(val) || 0 })} />
          </ConfigFormGroup>
        );

      case 'card-settings':
        return (
          <ConfigFormGroup title="Card Settings" description="Configure card appearance">
            <ConfigInput label="Corner Radius (px)" type="number" value={cornerRadius} onChange={(val) => setCornerRadius(parseInt(val) || 0)} />
          </ConfigFormGroup>
        );

      case 'start-date':
        return (
          <ConfigFormGroup title="Start Date" description="When should this offer start?">
            <ConfigInput label="Start Date & Time" type="datetime-local" value={startDate} onChange={setStartDate} />
          </ConfigFormGroup>
        );

      case 'end-date':
        return (
          <ConfigFormGroup title="End Date" description="When should this offer end?">
            <ConfigInput label="End Date & Time" type="datetime-local" value={endDate} onChange={setEndDate} />
          </ConfigFormGroup>
        );

      default:
        return <p>Select a setting to configure</p>;
    }
  };

  // Render Volume Discount widget preview
  const renderVolumePreview = () => {
    const defaultBreak = getDefaultBreak();
    const hasProducts = selectedProducts.length > 0;

    return (
      <div style={{
        backgroundColor: colorSettings.secondaryBackgroundColor,
        borderRadius: `${cornerRadius}px`,
        padding: '20px',
        marginTop: `${margins.top}px`,
        marginBottom: `${margins.bottom}px`,
        maxWidth: '100%',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: colorSettings.primaryTextColor, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            {bundleTitle}
          </h3>
          {showCountdown && (
            <div style={{
              backgroundColor: colorSettings.countdownBgColor,
              color: colorSettings.countdownTextColor,
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
            }}>
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
            {/* Quantity Break Options */}
            <div style={{ marginBottom: '20px' }}>
              {quantityBreaks.map((qb, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    marginBottom: '8px',
                    backgroundColor: qb.default ? '#5169DD' : colorSettings.primaryBackgroundColor,
                    color: qb.default ? 'white' : colorSettings.primaryTextColor,
                    border: qb.default ? 'none' : `1px solid ${colorSettings.borderColor}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  {/* Radio button */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: qb.default ? '2px solid white' : '2px solid #ccc',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {qb.default && (
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white' }} />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{qb.name}</span>
                  </div>
                  
                  {/* Discount badge */}
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: qb.default ? 'rgba(255,255,255,0.2)' : '#e8f5e9',
                    color: qb.default ? 'white' : '#4CAF50',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}>
                    {qb.discount}% OFF
                  </div>

                  {/* Banner */}
                  {qb.banner && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '16px',
                      backgroundColor: '#FF9800',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      {qb.banner}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Product Display */}
            <div style={{
              padding: '15px',
              backgroundColor: colorSettings.primaryBackgroundColor,
              borderRadius: `${Math.max(0, cornerRadius - 5)}px`,
              border: `1px solid ${colorSettings.borderColor}`,
              marginBottom: '15px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={selectedProducts[0]?.media || tshirt}
                  alt={selectedProducts[0]?.title}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '10px',
                    marginRight: '15px',
                    objectFit: 'cover',
                    border: `1px solid ${colorSettings.borderColor}`,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '5px', color: colorSettings.primaryTextColor }}>
                    {selectedProducts[0]?.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#4CAF50' }}>
                      ${calculateDiscountedPrice(selectedProducts[0]?.price, defaultBreak?.discount)}
                    </span>
                    <span style={{ width: '1.5px', height: '10px', background: colorSettings.primaryTextColor, opacity: 0.3 }}></span>
                    <span style={{ color: colorSettings.secondaryTextColor, fontSize: '12px', textDecoration: 'line-through' }}>
                      ${selectedProducts[0]?.price}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quantity selector */}
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 500, color: colorSettings.secondaryTextColor, display: 'block', marginBottom: '4px' }}>Quantity</label>
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
                  {quantityBreaks.map((qb) => (
                    <option key={qb.quantity} value={qb.quantity}>{qb.quantity}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Total Section */}
            <div style={{
              padding: '15px',
              backgroundColor: colorSettings.primaryBackgroundColor,
              borderRadius: `${Math.max(0, cornerRadius - 5)}px`,
              border: `1px solid ${colorSettings.borderColor}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: colorSettings.primaryTextColor }}>
                  Total ({defaultBreak?.quantity || 1} items)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(() => {
                    const originalPrice = parseFloat(selectedProducts[0]?.price || 0) * (defaultBreak?.quantity || 1);
                    const discountedPrice = calculateDiscountedPrice(selectedProducts[0]?.price, defaultBreak?.discount) * (defaultBreak?.quantity || 1);
                    return (
                      <>
                        <span style={{ fontWeight: 700, fontSize: '18px', color: colorSettings.primaryTextColor }}>${discountedPrice.toFixed(2)}</span>
                        <span style={{ width: '1.5px', height: '12px', background: colorSettings.primaryTextColor, opacity: 0.3 }}></span>
                        <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999' }}>${originalPrice.toFixed(2)}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              <button style={{
                width: '100%',
                padding: '14px',
                backgroundColor: addToCartBgColor,
                color: addToCartTextColor,
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                {addToCartText}
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
                  fontSize: '13px',
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

  // Get current settings
  const currentSettings = VOLUME_SETTINGS[activeTab] || [];

  return (
    <EditorLayout>
      <EditorSidepane>
        <EditorSettingsPane
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            const firstSetting = VOLUME_SETTINGS[tabId]?.[0]?.items?.[0];
            if (firstSetting) setActiveSettingId(firstSetting.id);
          }}
          settings={currentSettings}
          activeSettingId={activeSettingId}
          onSettingClick={setActiveSettingId}
        />
        <EditorConfigPanel title={currentSettings.flatMap(g => g.items).find(i => i.id === activeSettingId)?.label || 'Settings'}>
          {renderConfigContent()}
        </EditorConfigPanel>
      </EditorSidepane>

      <EditorRightContent>
        <EditorHeader
          bundleName={bundleInternalName}
          onBundleNameChange={setBundleInternalName}
          isEnabled={bundleEnabled}
          onToggleEnabled={setBundleEnabled}
          onDiscard={onCancel}
          onSave={handleSave}
          isSaving={isSaving}
        />

        <EditorPreviewPanel
          productTitle="Premium Wireless Headphones Pro"
          productRating={4.8}
          productReviews={2847}
          productPrice="$1,299.00"
          productComparePrice="$1,599.00"
          productDescription="Experience premium sound quality with active noise cancellation, 40-hour battery life, comfortable over-ear design."
          productFeatures={['Battery: 40 hours', 'Bluetooth: 5.2', 'Weight: 250g', 'Driver: 40mm']}
        >
          {renderVolumePreview()}
        </EditorPreviewPanel>
      </EditorRightContent>
    </EditorLayout>
  );
}
