import React, { useState, useEffect } from 'react';

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
import tshirt from "./tshirt.png";

// Buy X Get Y specific settings configuration
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
  { value: 'Free Gift', label: 'Free Gift (100% Off)' },
];

export default function BuyXGetYEditor({ editingBundle, onSave }) {
  
  
  // Active states
  const [activeTab, setActiveTab] = useState('bundle');
  const [activeSettingId, setActiveSettingId] = useState('customer-buys');
  
  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const markAsChanged = () => {
    if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  };
  
  // Bundle data states
  const [bundleTitle, setBundleTitle] = useState('Buy X Get Y - Save More! 🎁');
  const [bundleInternalName, setBundleInternalName] = useState('');
  const [secondaryMessage, setSecondaryMessage] = useState('Get this bundle and save on your purchase');
  const [bundleEnabled, setBundleEnabled] = useState(true);
  const [bundlePriority, setBundlePriority] = useState(0);
  
  // Products states - X (Customer Buys) and Y (Customer Gets)
  const [selectedXProducts, setSelectedXProducts] = useState([]);
  const [selectedYProducts, setSelectedYProducts] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [activeProductSection, setActiveProductSection] = useState('X'); // 'X' or 'Y'
  
  // Discount states
  const [discountType, setDiscountType] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  
  // Widget appearance states
  const [colorSettings, setColorSettings] = useState({
    primaryTextColor: '#303030',
    secondaryTextColor: '#000000',
    primaryBackgroundColor: '#FFFFFF',
    secondaryBackgroundColor: '#f1f2f4',
    borderColor: '#FFFFFF',
    buttonColor: '#000000',
    countdownBgColor: '#C4290E',
    countdownTextColor: '#FFFFFF',
    getYBannerColor: '#5169DD',
    getYBannerTextColor: '#FFFFFF',
  });
  
  // Display settings
  const [showCountdown, setShowCountdown] = useState(false);
  const [showEmoji, setShowEmoji] = useState(true);
  const [margins, setMargins] = useState({ top: 20, bottom: 20 });
  const [cornerRadius, setCornerRadius] = useState(20);
  
  // Schedule states
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

  // Product picker modals
  const [showXProductPicker, setShowXProductPicker] = useState(false);
  const [showYProductPicker, setShowYProductPicker] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: '23', minutes: '59', seconds: '59' });

  // Initialize form with edit data
  useEffect(() => {
    if (editingBundle) {
      setBundleTitle(editingBundle.title || 'Buy X Get Y - Save More! 🎁');
      setBundleInternalName(editingBundle.internalName || '');
      setSecondaryMessage(editingBundle.secondaryMessage || 'Get this bundle and save on your purchase');
      setBundleEnabled(editingBundle.status ?? true);
      setBundlePriority(editingBundle.bundlePriority || editingBundle.priority || 0);
      setDiscountType(editingBundle.discountType || '');
      setDiscountValue(editingBundle.discountValue?.toString() || '');
      
      // Set X and Y products
      if (editingBundle.productsX) {
        setSelectedXProducts(editingBundle.productsX);
      }
      if (editingBundle.productsY) {
        setSelectedYProducts(editingBundle.productsY);
      }
      
      // Set widget appearance
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
          getYBannerColor: editingBundle.widgetAppearance.getYBannerColor || '#5169DD',
          getYBannerTextColor: editingBundle.widgetAppearance.getYBannerTextColor || '#FFFFFF',
        });
        setShowCountdown(editingBundle.widgetAppearance.isShowCountDownTimer || false);
        setShowEmoji(editingBundle.widgetAppearance.addEmoji ?? true);
        setMargins({
          top: editingBundle.widgetAppearance.topMargin || 20,
          bottom: editingBundle.widgetAppearance.bottomMargin || 20,
        });
        setCornerRadius(editingBundle.widgetAppearance.cardCornerRadius || 20);
        
        // Button settings
        setAddToCartText(editingBundle.widgetAppearance.addToCartText || 'Add Bundle to Cart');
        setAddToCartBgColor(editingBundle.widgetAppearance.addToCartBgColor || '#000000');
        setAddToCartTextColor(editingBundle.widgetAppearance.addToCartTextColor || '#FFFFFF');
        setShowSkipButton(editingBundle.widgetAppearance.showSkipButton ?? true);
        setSkipButtonText(editingBundle.widgetAppearance.skipButtonText || 'Skip Offer');
        setSkipButtonBgColor(editingBundle.widgetAppearance.skipButtonBgColor || '#f5f5f5');
        setSkipButtonTextColor(editingBundle.widgetAppearance.skipButtonTextColor || '#666666');
      }
      
      // Set dates
      if (editingBundle.startDate) {
        setStartDate(new Date(editingBundle.startDate).toISOString().split('T')[0]);
      }
      if (editingBundle.endDate) {
        setEndDate(new Date(editingBundle.endDate).toISOString().split('T')[0]);
      }
    }
  }, [editingBundle]);

  // Fetch products from store inventory
  useEffect(() => {
    fetchStoreProducts();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!showCountdown) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const difference = endOfDay - now;
      
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [showCountdown]);

  const fetchStoreProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await fetch("/api/products", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      
      const data = await response.json();
      const edges = data.data?.products?.edges || [];
      
      // Transform products to match production bundle format
      const transformedProducts = edges.map(edge => {
        const product = edge.node;
        const optionSelections = product.options?.map(opt => ({
          componentOptionId: opt.id,
          name: opt.name,
          uniqueName: `${product.title} ${opt.name}`,
          values: opt.values
        })) || [];
        
        return {
          id: product.id,
          productId: product.id,
          title: product.title,
          price: product.variants?.edges?.[0]?.node?.price || product.variants?.nodes?.[0]?.price || '0.00',
          media: product.images?.edges?.[0]?.node?.url || product.featuredMedia?.image?.url || tshirt,
          handle: product.handle,
          quantity: 1,
          variants: product.variants?.edges?.map(v => v.node) || product.variants?.nodes || [],
          optionSelections: optionSelections
        };
      });
      setStoreProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      shopify?.toast?.show("Failed to load products", { duration: 3000 });
    } finally {
      setProductsLoading(false);
    }
  };

  // Filter products for X or Y selection (exclude already selected)
  const getFilteredProducts = () => {
    const selectedIds = [...selectedXProducts, ...selectedYProducts].map(p => p.productId || p.id);
    let filtered = storeProducts.filter(p => !selectedIds.includes(p.id) && !selectedIds.includes(p.productId));
    
    if (productSearchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(productSearchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const addProductToX = (product) => {
    if (!selectedXProducts.find(p => p.productId === product.productId)) {
      setSelectedXProducts([...selectedXProducts, { ...product, quantity: 1 }]);
    }
  };

  const addProductToY = (product) => {
    if (!selectedYProducts.find(p => p.productId === product.productId)) {
      setSelectedYProducts([...selectedYProducts, { ...product, quantity: 1 }]);
    }
  };

  const removeProductFromX = (productId) => {
    setSelectedXProducts(selectedXProducts.filter(p => (p.productId || p.id) !== productId));
  };

  const removeProductFromY = (productId) => {
    setSelectedYProducts(selectedYProducts.filter(p => (p.productId || p.id) !== productId));
  };

  const clearAllXProducts = () => setSelectedXProducts([]);
  const clearAllYProducts = () => setSelectedYProducts([]);

  const handleSettingClick = (settingId) => {
    setActiveSettingId(settingId);
    if (settingId === 'customer-buys') {
      setActiveProductSection('X');
      setShowXProductPicker(false);
    } else if (settingId === 'customer-gets') {
      setActiveProductSection('Y');
      setShowYProductPicker(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const firstSetting = BXGY_SETTINGS[tabId]?.[0]?.items?.[0]?.id;
    if (firstSetting) setActiveSettingId(firstSetting);
  };

  const handleColorChange = (colorKey, value) => {
    setColorSettings(prev => ({ ...prev, [colorKey]: value }));
  };

  // Calculate discounted price for Y products
  const calculateDiscountedPrice = (originalPrice) => {
    const price = parseFloat(originalPrice) || 0;
    const discount = parseFloat(discountValue) || 0;
    
    if (discountType === 'Percentage') {
      return (price * (1 - discount / 100)).toFixed(2);
    } else if (discountType === 'Fixed Amount') {
      return Math.max(0, price - discount).toFixed(2);
    } else if (discountType === 'Free Gift') {
      return '0.00';
    }
    return price.toFixed(2);
  };

  // Save bundle to database
  const handleSave = async () => {
    // Validation
    if (!bundleTitle.trim()) {
      shopify?.toast?.show("Please enter a bundle title", { duration: 3000 });
      return;
    }
    if (selectedXProducts.length === 0) {
      shopify?.toast?.show("Please select at least one product for 'Customer Buys (X)'", { duration: 3000 });
      return;
    }
    if (selectedYProducts.length === 0) {
      shopify?.toast?.show("Please select at least one product for 'Customer Gets (Y)'", { duration: 3000 });
      return;
    }
    if (!discountType) {
      shopify?.toast?.show("Please select a discount type", { duration: 3000 });
      return;
    }
    if (discountType !== 'Free Gift' && (!discountValue || parseFloat(discountValue) <= 0)) {
      shopify?.toast?.show("Please enter a valid discount value", { duration: 3000 });
      return;
    }

    const bundleData = {
      title: bundleTitle,
      secondaryMessage: secondaryMessage,
      productsX: selectedXProducts,
      productsY: selectedYProducts,
      discountType: discountType,
      discountValue: discountType === 'Free Gift' ? 100 : parseFloat(discountValue) || 0,
      status: bundleEnabled,
      internalName: bundleInternalName,
      type: "Buy One Get One",
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
        getYBannerColor: colorSettings.getYBannerColor,
        getYBannerTextColor: colorSettings.getYBannerTextColor,
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
    switch (activeSettingId) {
      case 'customer-buys':
        return (
          <div className="config-section">
            <ConfigFormGroup label="Customer Buys (X)" helpText="Products that customer must purchase">
              <div style={{ marginBottom: '15px' }}>
                <ConfigInput
                  placeholder="Search products..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Selected X Products */}
              {selectedXProducts.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Selected ({selectedXProducts.length})</span>
                    <button onClick={clearAllXProducts} style={{ color: '#C4290E', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                      Clear All
                    </button>
                  </div>
                  {selectedXProducts.map(product => (
                    <div key={product.productId || product.id} style={{
                      display: 'flex', alignItems: 'center', padding: '8px', marginBottom: '8px',
                      background: '#f5f5f5', borderRadius: '8px', gap: '10px'
                    }}>
                      <img src={product.media || tshirt} alt={product.title} style={{ width: 40, height: 40, borderRadius: '6px', objectFit: 'cover' }} />
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{product.title}</span>
                      <button onClick={() => removeProductFromX(product.productId || product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '18px' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Available Products */}
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {productsLoading ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>Loading products...</p>
                ) : getFilteredProducts().length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', fontSize: '13px' }}>No products available</p>
                ) : (
                  getFilteredProducts().map(product => (
                    <div key={product.id} onClick={() => addProductToX(product)} style={{
                      display: 'flex', alignItems: 'center', padding: '10px', marginBottom: '8px',
                      background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', cursor: 'pointer', gap: '10px'
                    }}>
                      <img src={product.media || tshirt} alt={product.title} style={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{product.title}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>${product.price}</div>
                      </div>
                      <span style={{ color: '#5169DD', fontSize: '20px' }}>+</span>
                    </div>
                  ))
                )}
              </div>
            </ConfigFormGroup>
          </div>
        );

      case 'customer-gets':
        return (
          <div className="config-section">
            <ConfigFormGroup label="Customer Gets (Y)" helpText="Products customer receives at a discount">
              <div style={{ marginBottom: '15px' }}>
                <ConfigInput
                  placeholder="Search products..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Selected Y Products */}
              {selectedYProducts.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Selected ({selectedYProducts.length})</span>
                    <button onClick={clearAllYProducts} style={{ color: '#C4290E', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                      Clear All
                    </button>
                  </div>
                  {selectedYProducts.map(product => (
                    <div key={product.productId || product.id} style={{
                      display: 'flex', alignItems: 'center', padding: '8px', marginBottom: '8px',
                      background: '#E8F5E9', borderRadius: '8px', gap: '10px'
                    }}>
                      <img src={product.media || tshirt} alt={product.title} style={{ width: 40, height: 40, borderRadius: '6px', objectFit: 'cover' }} />
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{product.title}</span>
                      <button onClick={() => removeProductFromY(product.productId || product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '18px' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Available Products */}
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {productsLoading ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>Loading products...</p>
                ) : getFilteredProducts().length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', fontSize: '13px' }}>No products available</p>
                ) : (
                  getFilteredProducts().map(product => (
                    <div key={product.id} onClick={() => addProductToY(product)} style={{
                      display: 'flex', alignItems: 'center', padding: '10px', marginBottom: '8px',
                      background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', cursor: 'pointer', gap: '10px'
                    }}>
                      <img src={product.media || tshirt} alt={product.title} style={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{product.title}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>${product.price}</div>
                      </div>
                      <span style={{ color: '#4CAF50', fontSize: '20px' }}>+</span>
                    </div>
                  ))
                )}
              </div>
            </ConfigFormGroup>
          </div>
        );

      case 'discount-settings':
        return (
          <div className="config-section">
            <ConfigFormGroup label="Discount Type">
              <ConfigSelect
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                options={DISCOUNT_TYPE_OPTIONS}
              />
            </ConfigFormGroup>
            {discountType && discountType !== 'Free Gift' && (
              <ConfigFormGroup label={discountType === 'Percentage' ? 'Discount Percentage' : 'Discount Amount ($)'}>
                <ConfigInput
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'Percentage' ? 'e.g., 20' : 'e.g., 10.00'}
                  min="0"
                  max={discountType === 'Percentage' ? '100' : undefined}
                />
              </ConfigFormGroup>
            )}
            {discountType === 'Free Gift' && (
              <div style={{ padding: '12px', background: '#E8F5E9', borderRadius: '8px', marginTop: '10px' }}>
                <span style={{ color: '#2E7D32', fontSize: '13px' }}>🎁 Customer gets the "Y" product(s) for FREE!</span>
              </div>
            )}
          </div>
        );

      case 'bundle-priority':
        return (
          <div className="config-section">
            <ConfigFormGroup label="Bundle Priority" helpText="Higher number = shown first when product is in multiple bundles">
              <ConfigInput
                type="number"
                value={bundlePriority}
                onChange={(e) => setBundlePriority(e.target.value)}
                placeholder="0"
                min="0"
              />
            </ConfigFormGroup>
            <div style={{ 
              padding: '12px', 
              background: '#FFF8E1', 
              borderRadius: '8px', 
              marginTop: '15px',
              border: '1px solid #FFE082'
            }}>
              <span style={{ fontSize: '13px', color: '#5D4037' }}>
                💡 <strong>What is Priority?</strong><br/>
                When a product is part of multiple bundles, only the bundle with the highest priority is shown to customers.
              </span>
            </div>
          </div>
        );

      case 'message-text':
        return (
          <EditorConfigPanel title="Message Text" description="Configure bundle messages shown to customers">
            <ConfigFormGroup label="Primary Message" hint="Main headline for the bundle">
              <ConfigInput
                value={bundleTitle}
                onChange={(e) => setBundleTitle(e.target.value)}
                placeholder="Buy X Get Y - Save More!"
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Message" hint="Supporting text below the headline">
              <ConfigInput
                value={secondaryMessage}
                onChange={(e) => setSecondaryMessage(e.target.value)}
                placeholder="Get this bundle and save on your purchase"
              />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'emoji-icons':
        return (
          <div className="config-section">
            <ConfigToggleRow
              label="Show Emoji in Title"
              checked={showEmoji}
              onChange={(e) => setShowEmoji(e.target.checked)}
            />
          </div>
        );

      case 'countdown-timer':
        return (
          <div className="config-section">
            <ConfigToggleRow
              label="Show Countdown Timer"
              checked={showCountdown}
              onChange={(e) => setShowCountdown(e.target.checked)}
            />
            {showCountdown && (
              <>
                <ConfigFormGroup label="Timer Background">
                  <input
                    type="color"
                    value={colorSettings.countdownBgColor}
                    onChange={(e) => handleColorChange('countdownBgColor', e.target.value)}
                    style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </ConfigFormGroup>
                <ConfigFormGroup label="Timer Text Color">
                  <input
                    type="color"
                    value={colorSettings.countdownTextColor}
                    onChange={(e) => handleColorChange('countdownTextColor', e.target.value)}
                    style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </ConfigFormGroup>
              </>
            )}
          </div>
        );

      case 'add-to-cart-button':
        return (
          <EditorConfigPanel title="Add to Cart Button" description="Customize the main action button">
            <ConfigFormGroup label="Button Text">
              <ConfigInput
                value={addToCartText}
                onChange={(e) => setAddToCartText(e.target.value)}
                placeholder="Add Bundle to Cart"
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Background Color">
              <input
                type="color"
                value={addToCartBgColor}
                onChange={(e) => setAddToCartBgColor(e.target.value)}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Text Color">
              <input
                type="color"
                value={addToCartTextColor}
                onChange={(e) => setAddToCartTextColor(e.target.value)}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'skip-offer-button':
        return (
          <EditorConfigPanel title="Skip Offer Button" description="Optional button to dismiss the offer">
            <ConfigToggleRow
              label="Show Skip Button"
              checked={showSkipButton}
              onChange={(e) => setShowSkipButton(e.target.checked)}
            />
            {showSkipButton && (
              <>
                <ConfigFormGroup label="Button Text">
                  <ConfigInput
                    value={skipButtonText}
                    onChange={(e) => setSkipButtonText(e.target.value)}
                    placeholder="Skip Offer"
                  />
                </ConfigFormGroup>
                <ConfigFormGroup label="Background Color">
                  <input
                    type="color"
                    value={skipButtonBgColor}
                    onChange={(e) => setSkipButtonBgColor(e.target.value)}
                    style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </ConfigFormGroup>
                <ConfigFormGroup label="Text Color">
                  <input
                    type="color"
                    value={skipButtonTextColor}
                    onChange={(e) => setSkipButtonTextColor(e.target.value)}
                    style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'primary-colors':
        return (
          <div className="config-section">
            <ConfigFormGroup label="Primary Text Color">
              <input
                type="color"
                value={colorSettings.primaryTextColor}
                onChange={(e) => handleColorChange('primaryTextColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Primary Background">
              <input
                type="color"
                value={colorSettings.primaryBackgroundColor}
                onChange={(e) => handleColorChange('primaryBackgroundColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Get Y Banner Color">
              <input
                type="color"
                value={colorSettings.getYBannerColor}
                onChange={(e) => handleColorChange('getYBannerColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </ConfigFormGroup>
          </div>
        );

      case 'secondary-colors':
        return (
          <div className="config-section">
            <ConfigFormGroup label="Secondary Text Color">
              <input
                type="color"
                value={colorSettings.secondaryTextColor}
                onChange={(e) => handleColorChange('secondaryTextColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Background">
              <input
                type="color"
                value={colorSettings.secondaryBackgroundColor}
                onChange={(e) => handleColorChange('secondaryBackgroundColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Border Color">
              <input
                type="color"
                value={colorSettings.borderColor}
                onChange={(e) => handleColorChange('borderColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </ConfigFormGroup>
          </div>
        );

      case 'margins':
        return (
          <div className="config-section">
            <ConfigFormGroup label="Top Margin (px)">
              <ConfigInput
                type="number"
                value={margins.top}
                onChange={(e) => setMargins(prev => ({ ...prev, top: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Bottom Margin (px)">
              <ConfigInput
                type="number"
                value={margins.bottom}
                onChange={(e) => setMargins(prev => ({ ...prev, bottom: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </ConfigFormGroup>
          </div>
        );

      case 'card-settings':
        return (
          <div className="config-section">
            <ConfigFormGroup label="Corner Radius (px)">
              <ConfigInput
                type="number"
                value={cornerRadius}
                onChange={(e) => setCornerRadius(parseInt(e.target.value) || 0)}
                min="0"
                max="50"
              />
            </ConfigFormGroup>
          </div>
        );

      case 'start-date':
        return (
          <div className="config-section">
            <ConfigFormGroup label="Start Date">
              <ConfigInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </ConfigFormGroup>
          </div>
        );

      case 'end-date':
        return (
          <div className="config-section">
            <ConfigFormGroup label="End Date">
              <ConfigInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </ConfigFormGroup>
          </div>
        );

      default:
        return <div className="config-section"><p>Select a setting to configure</p></div>;
    }
  };

  // Render the BOGO preview
  const renderBXGYPreview = () => {
    const hasProducts = selectedXProducts.length > 0 || selectedYProducts.length > 0;
    
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
          paddingRight: showCountdown ? '150px' : '0',
        }}>
          {bundleTitle || 'Buy X Get Y - Save More! 🎁'}
        </h3>
        {secondaryMessage && (
          <p style={{
            color: colorSettings.secondaryTextColor,
            fontSize: '13px',
            marginBottom: '15px',
            paddingRight: showCountdown ? '150px' : '0',
          }}>
            {secondaryMessage}
          </p>
        )}

        {/* Countdown Timer */}
        {showCountdown && (
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: colorSettings.countdownBgColor,
            color: colorSettings.countdownTextColor,
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
          }}>
            {showEmoji && '🔥 '}Ends In {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
          </div>
        )}

        {!hasProducts ? (
          <div style={{
            padding: '30px 15px',
            textAlign: 'center',
            backgroundColor: colorSettings.primaryBackgroundColor,
            borderRadius: `${Math.max(0, cornerRadius - 5)}px`,
            border: `1px solid ${colorSettings.borderColor}`,
          }}>
            <p style={{ fontSize: '14px', color: colorSettings.secondaryTextColor, margin: 0 }}>
              Select products to see the preview
            </p>
          </div>
        ) : (
          <>
            {/* X Products (Customer Buys) */}
            {selectedXProducts.map((product, index) => (
              <div key={`x-${product.productId || index}`} style={{
                padding: '12px',
                borderRadius: `${Math.max(0, cornerRadius - 5)}px`,
                marginBottom: '12px',
                backgroundColor: colorSettings.primaryBackgroundColor,
                border: `1px solid ${colorSettings.borderColor}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={product.media || tshirt}
                    alt={product.title}
                    style={{ width: 70, height: 70, borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: colorSettings.primaryTextColor }}>
                      {product.title}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: '14px', margin: 0, color: colorSettings.primaryTextColor }}>
                      ${product.price}
                    </p>
                  </div>
                </div>
                {/* Product Options Preview */}
                {product.optionSelections?.length > 0 && product.optionSelections[0].values.length > 1 && (
                  <div style={{ marginTop: '10px' }}>
                    {product.optionSelections.map((option, optIdx) => (
                      option.values.length > 1 && (
                        <div key={optIdx} style={{ marginBottom: '8px' }}>
                          <label style={{ fontSize: '11px', color: colorSettings.secondaryTextColor, display: 'block', marginBottom: '4px' }}>
                            {option.name}
                          </label>
                          <select style={{
                            width: '100%',
                            padding: '6px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            border: `1px solid ${colorSettings.borderColor}`,
                            background: colorSettings.secondaryBackgroundColor,
                            color: colorSettings.primaryTextColor,
                          }}>
                            {option.values.map((value, vIdx) => (
                              <option key={vIdx}>{value}</option>
                            ))}
                          </select>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Y Products Banner & Cards (Customer Gets) */}
            {selectedYProducts.length > 0 && (
              <div style={{
                backgroundColor: colorSettings.getYBannerColor,
                padding: '5px',
                borderRadius: `${cornerRadius}px`,
                marginTop: '5px',
              }}>
                <p style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: colorSettings.getYBannerTextColor,
                  textAlign: 'center',
                  padding: '8px 0',
                  margin: 0,
                }}>
                  {discountType === 'Percentage'
                    ? `YOU GET ${discountValue || 0}% OFF ON`
                    : discountType === 'Free Gift'
                      ? `🎁 GET FREE GIFT!`
                      : `YOU GET $${discountValue || 0} OFF ON`}
                </p>
                {selectedYProducts.map((product, index) => {
                  const originalPrice = parseFloat(product.price) || 0;
                  const discountedPrice = calculateDiscountedPrice(originalPrice);
                  const hasDiscount = discountedPrice !== originalPrice.toFixed(2);
                  
                  return (
                    <div key={`y-${product.productId || index}`} style={{
                      padding: '12px',
                      borderRadius: `${Math.max(0, cornerRadius - 5)}px`,
                      marginTop: '5px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={product.media || tshirt}
                          alt={product.title}
                          style={{ width: 70, height: 70, borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: colorSettings.primaryTextColor }}>
                            {product.title}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, fontSize: '14px', color: '#4CAF50' }}>
                              ${discountedPrice}
                            </span>
                            {hasDiscount && (
                              <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#999' }}>
                                ${originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Price & Add to Cart */}
            <div style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: colorSettings.primaryBackgroundColor,
              borderRadius: `${Math.max(0, cornerRadius - 5)}px`,
              border: `1px solid ${colorSettings.borderColor}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 600, color: colorSettings.primaryTextColor }}>Total</span>
                <div>
                  {(() => {
                    const xTotal = selectedXProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
                    const yOriginal = selectedYProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
                    const yDiscounted = selectedYProducts.reduce((sum, p) => sum + parseFloat(calculateDiscountedPrice(p.price)), 0);
                    const total = xTotal + yDiscounted;
                    const originalTotal = xTotal + yOriginal;
                    const hasSavings = total < originalTotal;
                    
                    return (
                      <>
                        <span style={{ fontWeight: 700, fontSize: '16px', color: colorSettings.primaryTextColor }}>
                          ${total.toFixed(2)}
                        </span>
                        {hasSavings && (
                          <span style={{ marginLeft: '8px', fontSize: '13px', textDecoration: 'line-through', color: '#999' }}>
                            ${originalTotal.toFixed(2)}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <button style={{
                width: '100%',
                padding: '12px',
                backgroundColor: addToCartBgColor,
                color: addToCartTextColor,
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                {addToCartText}
              </button>
              {showSkipButton && (
                <button style={{
                  width: '100%',
                  padding: '10px',
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

  // Render product page preview (same two-column layout as StandardBundleEditor)
  const renderProductPagePreview = () => (
    <div className="product-page-preview" style={{ padding: '24px', background: '#fff', minHeight: '100%' }}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left Column - Product Image */}
        <div style={{ flex: '0 0 45%', maxWidth: '45%' }}>
          <div style={{
            width: '100%', aspectRatio: '1', background: '#f8f8f8', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
            border: '1px solid #eee'
          }}>
            <span style={{ fontSize: '64px', opacity: 0.4 }}>📦</span>
          </div>
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
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px', lineHeight: '1.3' }}>
            Premium Wireless Headphones Pro
          </h1>
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
          <button style={{
            width: '100%', padding: '12px', background: '#1a1a1a', color: 'white', border: 'none',
            borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px'
          }}>Add to Cart</button>
          <div style={{ borderTop: '1px dashed #ddd', paddingTop: '12px', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
              background: '#fff', padding: '0 8px', fontSize: '9px', color: '#999',
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              Bundle Offer
            </div>
            {renderBXGYPreview()}
          </div>
        </div>
      </div>
    </div>
  );

  // Get current settings based on active tab
  const currentSettings = BXGY_SETTINGS[activeTab] || [];

  return (
    <EditorLayout>
      <EditorSidepane tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange}>
        <EditorSettingsPane 
          groups={currentSettings} 
          activeSetting={activeSettingId} 
          onSettingChange={handleSettingClick} 
        />
        <EditorConfigPanel>
          {renderConfigContent()}
        </EditorConfigPanel>
      </EditorSidepane>

      <EditorRightContent>
        <EditorHeader
          title={bundleInternalName || 'New BXGY Bundle'}
          onTitleChange={(value) => { setBundleInternalName(value); markAsChanged(); }}
          enabled={bundleEnabled}
          onEnabledChange={(value) => { setBundleEnabled(value); markAsChanged(); }}
          onSave={handleSave}
          isLoading={isSaving}
        />
        <EditorPreviewPanel device="desktop" onDeviceChange={() => {}}>
          {renderProductPagePreview()}
        </EditorPreviewPanel>
      </EditorRightContent>
    </EditorLayout>
  );
}
