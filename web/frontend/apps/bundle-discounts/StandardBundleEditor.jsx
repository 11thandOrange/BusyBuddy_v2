import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
  ProductPagePreview,
  EditorHeader,
  EditorRightContent
} from '../../components/Editor';
import { useEditorNavigation } from '../../hooks';
import tshirt from "./tshirt.png";

// Bundle Discounts specific settings configuration
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

const TIMEZONE_OPTIONS = [
  { value: 'GMT', label: 'GMT' },
  { value: 'EST', label: 'EST' },
  { value: 'PST', label: 'PST' },
  { value: 'UTC', label: 'UTC' },
];

/**
 * StandardBundleEditor - Editor for Bundle Discounts app
 * Uses reusable Editor components with app-specific configuration
 * 
 * Opens in a new browser tab for a clean, standalone experience.
 * URL: /bundle-discount/editor/:id (edit) or /bundle-discount/editor (create)
 */
export const StandardBundleEditor = () => {
  // Get bundle ID from URL params (if editing existing bundle)
  const { id } = useParams();
  const { closeEditor } = useEditorNavigation();

  // Loading state for fetching bundle data
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);

  // Tab and setting navigation state
  const [activeTab, setActiveTab] = useState('bundle');
  const [activeSetting, setActiveSetting] = useState('select-products');
  const [device, setDevice] = useState('desktop');
  
  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Warn user before closing tab with unsaved changes
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
  
  // === STORE PRODUCTS (from inventory) ===
  const [storeProducts, setStoreProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [collectionSearchQuery, setCollectionSearchQuery] = useState('');
  
  // === BUNDLE STATUS ===
  const [bundleEnabled, setBundleEnabled] = useState(true);
  
  // === PRODUCTS SETTINGS ===
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  
  // === DISCOUNT SETTINGS ===
  const [discountType, setDiscountType] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  
  // === BUNDLE INFO SETTINGS ===
  const [bundleTitle, setBundleTitle] = useState('Buy Together & Save More!🔥');
  const [bundleInternalName, setBundleInternalName] = useState('');
  const [bundlePriority, setBundlePriority] = useState(0);

  // === COLOR SETTINGS ===
  const [colorSettings, setColorSettings] = useState({
    primaryTextColor: '#303030',
    secondaryTextColor: '#000000',
    primaryBackgroundColor: '#ffffff',
    secondaryBackgroundColor: '#f1f2f4',
    borderColor: '#FFFFFF',
    buttonColor: '#000000',
    countdownBgColor: '#C4290E',
    countdownTextColor: '#FFFFFF',
  });

  // === CONTENT SETTINGS ===
  // Message Text
  const [primaryMessage, setPrimaryMessage] = useState('Buy Together & Save More!');
  const [secondaryMessage, setSecondaryMessage] = useState('Get this bundle and save on your purchase');
  
  // Emoji & Icons
  const [showEmoji, setShowEmoji] = useState(true);
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [emojiPosition, setEmojiPosition] = useState('end');
  
  // Countdown Timer
  const [showCountdown, setShowCountdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: '23', minutes: '59', seconds: '59' });
  const [countdownLabel, setCountdownLabel] = useState('Ends in:');
  
  // Call to Action Buttons
  const [addToCartText, setAddToCartText] = useState('Add To Cart');
  const [skipOfferText, setSkipOfferText] = useState('Skip Offer');
  const [showSkipButton, setShowSkipButton] = useState(true);

  // === LAYOUT SETTINGS ===
  const [margins, setMargins] = useState({
    top: 20,
    bottom: 20,
  });
  const [cornerRadius, setCornerRadius] = useState('20');

  // === SCHEDULE SETTINGS ===
  const [isLongTerm, setIsLongTerm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timezone, setTimezone] = useState('GMT');

  // Fetch bundle data if editing (id from URL params)
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchBundle = async () => {
      try {
        const response = await fetch(`/api/bundles/${id}`);
        if (!response.ok) throw new Error('Failed to fetch bundle');
        const data = await response.json();
        const bundle = data?.data || data;

        if (bundle) {
          setEditingBundle(bundle);
          // Populate form state from fetched data
          setBundleEnabled(bundle.status ?? true);
          setSelectedProducts(bundle.products || []);
          setDiscountType(bundle.discountType || '');
          setDiscountValue(bundle.discountValue || '');
          setBundleTitle(bundle.title || 'Buy Together & Save More!🔥');
          setBundleInternalName(bundle.internalName || '');
          setBundlePriority(bundle.bundlePriority || 0);
          setColorSettings({
            primaryTextColor: bundle.widgetAppearance?.primaryTextColor || '#303030',
            secondaryTextColor: bundle.widgetAppearance?.secondaryTextColor || '#000000',
            primaryBackgroundColor: bundle.widgetAppearance?.PrimaryBackgroundColor || '#ffffff',
            secondaryBackgroundColor: bundle.widgetAppearance?.secondaryBackgroundColor || '#f1f2f4',
            borderColor: bundle.widgetAppearance?.borderColor || '#FFFFFF',
            buttonColor: bundle.widgetAppearance?.buttonColor || '#000000',
            countdownBgColor: bundle.widgetAppearance?.offerTagBackgroundColor || '#C4290E',
            countdownTextColor: bundle.widgetAppearance?.offerTagTextColor || '#FFFFFF',
          });
          setPrimaryMessage(bundle.primaryMessage || 'Buy Together & Save More!');
          setSecondaryMessage(bundle.secondaryMessage || 'Get this bundle and save on your purchase');
          setShowEmoji(bundle.showEmoji ?? true);
          setSelectedEmoji(bundle.selectedEmoji || '🔥');
          setEmojiPosition(bundle.emojiPosition || 'end');
          setShowCountdown(bundle.widgetAppearance?.isShowCountDownTimer || false);
          setCountdownLabel(bundle.countdownLabel || 'Ends in:');
          setAddToCartText(bundle.addToCartText || 'Add To Cart');
          setSkipOfferText(bundle.skipOfferText || 'Skip Offer');
          setShowSkipButton(bundle.showSkipButton ?? true);
          setMargins({
            top: bundle.widgetAppearance?.topMargin || 20,
            bottom: bundle.widgetAppearance?.bottomMargin || 20,
          });
          setCornerRadius(bundle.widgetAppearance?.cardCornerRadius || '20');
          setStartDate(bundle.startDate || '');
          setEndDate(bundle.endDate || '');
        }
      } catch (err) {
        console.error('Error fetching bundle:', err);
        shopify?.toast?.show('Failed to load bundle data', { duration: 3000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBundle();
  }, [id]);

  // Fetch products from store inventory on mount
  useEffect(() => {
    fetchStoreProducts();
  }, []);

  const fetchStoreProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      const edges = data.data?.products?.edges || [];
      // Transform products to match production bundle format
      const transformedProducts = edges.map(edge => {
        const product = edge.node;
        // Build optionSelections in the same format as production editor
        const optionSelections = product.options?.map(opt => ({
          componentOptionId: opt.id,
          name: opt.name,
          uniqueName: `${product.title} ${opt.name}`,
          values: opt.values
        })) || [];
        
        return {
          id: product.id,
          productId: product.id,  // GID format: gid://shopify/Product/ID
          title: product.title,
          price: product.variants?.edges?.[0]?.node?.price || '0.00',
          media: product.images?.edges?.[0]?.node?.url || product.featuredMedia?.image?.url || tshirt,
          handle: product.handle,
          quantity: 1,  // Default quantity (required for storefront)
          variants: product.variants?.edges?.map(v => v.node) || [],
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

  // Filter products based on search queries
  const getFilteredProducts = () => {
    let filtered = storeProducts.filter(p => !selectedProducts.find(sp => sp.id === p.id || sp.productId === p.productId));
    
    if (productSearchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(productSearchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Countdown timer effect
  useEffect(() => {
    if (!showCountdown) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay - now;
      if (diff <= 0) return { hours: '00', minutes: '00', seconds: '00' };
      
      return {
        hours: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
        minutes: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0'),
        seconds: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [showCountdown]);

  // Get settings for current tab
  const currentSettings = BUNDLE_SETTINGS[activeTab] || [];

  // Handle tab change - reset to first setting
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const firstSetting = BUNDLE_SETTINGS[tabId]?.[0]?.items?.[0]?.id;
    if (firstSetting) setActiveSetting(firstSetting);
  };

  // Handle color setting change
  const handleColorChange = (key, value) => {
    setColorSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle margin change
  const handleMarginChange = (key, value) => {
    setMargins(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  // Remove product
  const removeProduct = (productToRemove) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productToRemove.id));
  };

  // Calculate bundle pricing
  const calculateBundlePricing = () => {
    if (!selectedProducts.length) return { totalPrice: 0, discountedPrice: 0, saved: 0, discountPercentage: 0 };
    
    const totalPrice = selectedProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
    let discountedPrice = totalPrice;
    
    if (discountType === 'Percentage' && discountValue) {
      discountedPrice = totalPrice * (1 - parseFloat(discountValue) / 100);
    } else if (discountType === 'Fixed Amount' && discountValue) {
      discountedPrice = totalPrice - parseFloat(discountValue);
    }
    
    const saved = totalPrice - discountedPrice;
    const discountPercentage = totalPrice > 0 ? Math.round((saved / totalPrice) * 100) : 0;
    
    return { totalPrice: totalPrice.toFixed(2), discountedPrice: discountedPrice.toFixed(2), saved: saved.toFixed(2), discountPercentage };
  };

  // Handle save - saves to database
  const handleSave = async () => {
    // Validation
    if (selectedProducts.length < 2) {
      shopify?.toast?.show("Please select at least 2 products for the bundle.", {
        duration: 4000,
      });
      return;
    }
    if (!bundleTitle || bundleTitle.trim() === "") {
      shopify?.toast?.show("Please enter a bundle title.", {
        duration: 4000,
      });
      return;
    }
    if (!discountType) {
      shopify?.toast?.show("Please select a discount type.", {
        duration: 4000,
      });
      return;
    }
    if (!discountValue || isNaN(discountValue) || discountValue <= 0) {
      shopify?.toast?.show("Please enter a valid discount value.", {
        duration: 4000,
      });
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      shopify?.toast?.show("End date must be after start date.", {
        duration: 4000,
      });
      return;
    }

    const bundleData = {
      title: bundleTitle,
      products: selectedProducts,
      discountType: discountType,
      discountValue: parseFloat(discountValue) || 0,
      status: bundleEnabled,
      internalName: bundleInternalName,
      type: "Bundle Discount",
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
      },
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setIsSaving(true);
    
    try {
      const isEditing = !!id;
      const url = isEditing ? `/api/bundles/${id}` : "/api/bundles";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bundleData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Bundle " + (isEditing ? "updated" : "created") + " successfully:", data);
        shopify?.toast?.show(`Bundle ${isEditing ? "updated" : "created"} successfully!`, {
          duration: 5000,
        });
        // Clear unsaved changes flag and close editor
        setHasUnsavedChanges(false);
        closeEditor();
      } else {
        console.error("Error " + (isEditing ? "updating" : "creating") + " bundle");
        shopify?.toast?.show(
          `Oops! Something went wrong while ${isEditing ? "updating" : "creating"} the bundle.`,
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error("Save error:", error);
      shopify?.toast?.show("Failed to save bundle. Please try again.", {
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Render configuration content based on active setting
  const renderConfigContent = () => {
    switch (activeSetting) {
      // === PRODUCTS TAB ===
      case 'select-products':
        // Get filtered products from store inventory
        const availableProducts = getFilteredProducts();

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
                  <ConfigInput 
                    type="text" 
                    placeholder="Search by product name..." 
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                  />
                </ConfigFormGroup>

                {/* Search Collections */}
                <ConfigFormGroup label="Search Collections">
                  <ConfigInput 
                    type="text" 
                    placeholder="Search by collection name..." 
                    value={collectionSearchQuery}
                    onChange={(e) => setCollectionSearchQuery(e.target.value)}
                  />
                </ConfigFormGroup>

                {/* Available Products from Store Inventory */}
                <div>
                  {productsLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                      Loading products...
                    </div>
                  ) : availableProducts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                      {storeProducts.length === 0 ? 'No products found in your store.' : 'All products have been added to the bundle.'}
                    </div>
                  ) : (
                    availableProducts.map((product, idx) => (
                      <div key={product.id || idx} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={product.media || tshirt} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
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
                          <img src={product.media || tshirt} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
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
          <EditorConfigPanel
            title="Discount Settings"
            description="Configure the bundle discount"
          >
            <ConfigFormGroup label="Discount Type">
              <ConfigSelect
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                options={DISCOUNT_TYPE_OPTIONS}
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Discount Value" hint={discountType === 'Percentage' ? 'Enter percentage (e.g., 10 for 10%)' : 'Enter fixed amount'}>
              <ConfigInput
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'Percentage' ? '10' : '5.00'}
              />
            </ConfigFormGroup>
            {discountType && discountValue && (
              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                background: 'rgba(52, 199, 89, 0.1)', 
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '13px'
              }}>
                {discountType === 'Percentage' 
                  ? `💰 ${discountValue}% off bundle total`
                  : `💰 $${discountValue} off bundle total`
                }
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

      // === APPEARANCE TAB ===
      case 'primary-colors':
        return (
          <EditorConfigPanel
            title="Primary Colors"
            description="Set main text and background colors"
          >
            <ConfigFormGroup label="Primary Text Color">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={colorSettings.primaryTextColor}
                  onChange={(e) => handleColorChange('primaryTextColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <ConfigInput
                  type="text"
                  value={colorSettings.primaryTextColor}
                  onChange={(e) => handleColorChange('primaryTextColor', e.target.value)}
                />
              </div>
            </ConfigFormGroup>
            <ConfigFormGroup label="Primary Background Color">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={colorSettings.primaryBackgroundColor}
                  onChange={(e) => handleColorChange('primaryBackgroundColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <ConfigInput
                  type="text"
                  value={colorSettings.primaryBackgroundColor}
                  onChange={(e) => handleColorChange('primaryBackgroundColor', e.target.value)}
                />
              </div>
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'secondary-colors':
        return (
          <EditorConfigPanel
            title="Secondary Colors"
            description="Set secondary text and background colors"
          >
            <ConfigFormGroup label="Secondary Text Color">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={colorSettings.secondaryTextColor}
                  onChange={(e) => handleColorChange('secondaryTextColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <ConfigInput
                  type="text"
                  value={colorSettings.secondaryTextColor}
                  onChange={(e) => handleColorChange('secondaryTextColor', e.target.value)}
                />
              </div>
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Background Color">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={colorSettings.secondaryBackgroundColor}
                  onChange={(e) => handleColorChange('secondaryBackgroundColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <ConfigInput
                  type="text"
                  value={colorSettings.secondaryBackgroundColor}
                  onChange={(e) => handleColorChange('secondaryBackgroundColor', e.target.value)}
                />
              </div>
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      // === CONTENT TAB ===
      case 'message-text':
        return (
          <EditorConfigPanel
            title="Message Text"
            description="Configure the bundle messages"
          >
            <ConfigFormGroup label="Primary Message" hint="Main headline for the bundle">
              <ConfigInput
                type="text"
                value={primaryMessage}
                onChange={(e) => setPrimaryMessage(e.target.value)}
                placeholder="Buy Together & Save More!"
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Message" hint="Supporting text below the headline">
              <ConfigTextarea
                value={secondaryMessage}
                onChange={(e) => setSecondaryMessage(e.target.value)}
                placeholder="Get this bundle and save on your purchase"
                rows={2}
              />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'emoji-icons':
        return (
          <EditorConfigPanel
            title="Emoji & Icons"
            description="Add emoji to make your bundle stand out"
          >
            <ConfigToggleRow
              label="Show Emoji"
              checked={showEmoji}
              onChange={setShowEmoji}
            />
            {showEmoji && (
              <>
                <ConfigFormGroup label="Select Emoji">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {['🔥', '⭐', '💎', '🎁', '💰', '🏷️', '✨', '🛒', '❤️', '👍'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedEmoji(emoji)}
                        style={{
                          width: '40px',
                          height: '40px',
                          fontSize: '20px',
                          border: selectedEmoji === emoji ? '2px solid #5169DD' : '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          background: selectedEmoji === emoji ? 'rgba(81, 105, 221, 0.2)' : 'rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </ConfigFormGroup>
                <ConfigFormGroup label="Emoji Position">
                  <ConfigSelect
                    value={emojiPosition}
                    onChange={(e) => setEmojiPosition(e.target.value)}
                    options={[
                      { value: 'start', label: 'Before text' },
                      { value: 'end', label: 'After text' },
                      { value: 'both', label: 'Both sides' },
                    ]}
                  />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'countdown-timer':
        return (
          <EditorConfigPanel
            title="Countdown Timer"
            description="Show a countdown timer to create urgency"
          >
            <ConfigToggleRow
              label="Show Countdown Timer"
              checked={showCountdown}
              onChange={setShowCountdown}
            />
            {showCountdown && (
              <>
                <ConfigFormGroup label="Timer Label" hint="Text shown before the countdown">
                  <ConfigInput
                    type="text"
                    value={countdownLabel}
                    onChange={(e) => setCountdownLabel(e.target.value)}
                    placeholder="Ends in:"
                  />
                </ConfigFormGroup>
                <ConfigFormGroup label="Timer Background Color">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={colorSettings.countdownBgColor}
                      onChange={(e) => handleColorChange('countdownBgColor', e.target.value)}
                      style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <ConfigInput
                      type="text"
                      value={colorSettings.countdownBgColor}
                      onChange={(e) => handleColorChange('countdownBgColor', e.target.value)}
                    />
                  </div>
                </ConfigFormGroup>
                <ConfigFormGroup label="Timer Text Color">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={colorSettings.countdownTextColor}
                      onChange={(e) => handleColorChange('countdownTextColor', e.target.value)}
                      style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <ConfigInput
                      type="text"
                      value={colorSettings.countdownTextColor}
                      onChange={(e) => handleColorChange('countdownTextColor', e.target.value)}
                    />
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
          <EditorConfigPanel
            title="Margins"
            description="Set top and bottom margins for the bundle widget"
          >
            <ConfigFormGroup label="Top Margin (px)">
              <ConfigInput
                type="number"
                value={margins.top}
                onChange={(e) => handleMarginChange('top', e.target.value)}
                placeholder="20"
              />
            </ConfigFormGroup>
            <ConfigFormGroup label="Bottom Margin (px)">
              <ConfigInput
                type="number"
                value={margins.bottom}
                onChange={(e) => handleMarginChange('bottom', e.target.value)}
                placeholder="20"
              />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'card-settings':
        return (
          <EditorConfigPanel
            title="Card Settings"
            description="Configure card appearance"
          >
            <ConfigFormGroup label="Corner Radius (px)">
              <ConfigInput
                type="text"
                value={cornerRadius}
                onChange={(e) => setCornerRadius(e.target.value)}
                placeholder="20"
              />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      // === SCHEDULE TAB ===
      case 'start-date':
        return (
          <EditorConfigPanel
            title="Start Date"
            description="When should the bundle start showing?"
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
            <ConfigFormGroup label="Timezone">
              <ConfigSelect
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                options={TIMEZONE_OPTIONS}
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
                🚀 Starts: {new Date(startDate).toLocaleString()}
              </div>
            )}
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

  // Render countdown timer
  // Get formatted title with emoji
  const getFormattedTitle = () => {
    if (!showEmoji) return primaryMessage;
    if (emojiPosition === 'start') return `${selectedEmoji} ${primaryMessage}`;
    if (emojiPosition === 'end') return `${primaryMessage}${selectedEmoji}`;
    if (emojiPosition === 'both') return `${selectedEmoji} ${primaryMessage} ${selectedEmoji}`;
    return primaryMessage;
  };

  const renderCountdownTimer = () => {
    if (!showCountdown) return null;
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        background: colorSettings.countdownBgColor,
        borderRadius: '8px',
        marginBottom: '12px',
      }}>
        <span style={{ color: colorSettings.countdownTextColor, fontSize: '12px', fontWeight: '600' }}>
          {countdownLabel}
        </span>
        {[
          { value: timeLeft.hours, label: 'HRS' },
          { value: timeLeft.minutes, label: 'MIN' },
          { value: timeLeft.seconds, label: 'SEC' },
        ].map((item, idx) => (
          <React.Fragment key={idx}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 8px',
              borderRadius: '4px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: colorSettings.countdownTextColor }}>
                {item.value}
              </div>
              <div style={{ fontSize: '8px', color: colorSettings.countdownTextColor, opacity: 0.8 }}>
                {item.label}
              </div>
            </div>
            {idx < 2 && <span style={{ color: colorSettings.countdownTextColor, fontWeight: 'bold' }}>:</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render bundle preview
  const renderBundlePreview = () => {
    const pricing = calculateBundlePricing();
    
    return (
      <div
        className="bundle-preview"
        style={{
          margin: `${margins.top}px 16px ${margins.bottom}px 16px`,
          padding: '16px',
          background: colorSettings.primaryBackgroundColor,
          borderRadius: `${cornerRadius}px`,
          border: `1px solid ${colorSettings.borderColor}`,
        }}
      >
        {/* Bundle Title with Emoji */}
        <h3 style={{
          color: colorSettings.primaryTextColor,
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '4px',
          textAlign: 'center',
        }}>
          {getFormattedTitle()}
        </h3>

        {/* Secondary Message */}
        {secondaryMessage && (
          <p style={{
            color: colorSettings.secondaryTextColor,
            fontSize: '12px',
            marginBottom: '12px',
            textAlign: 'center',
          }}>
            {secondaryMessage}
          </p>
        )}

        {/* Countdown Timer */}
        {renderCountdownTimer()}

        {/* Products */}
        {selectedProducts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedProducts.map((product, idx) => (
              <React.Fragment key={idx}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: colorSettings.secondaryBackgroundColor,
                  borderRadius: '12px',
                  border: `1px solid ${colorSettings.borderColor}`,
                }}>
                  <img
                    src={product.media || tshirt}
                    alt={product.title}
                    style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: colorSettings.primaryTextColor, fontSize: '13px', fontWeight: '500' }}>
                      {product.title || 'Product Name'}
                    </div>
                    <div style={{ color: colorSettings.secondaryTextColor, fontSize: '12px' }}>
                      ${product.price || '0.00'}
                    </div>
                  </div>
                </div>
                {idx < selectedProducts.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      background: colorSettings.buttonColor,
                      color: 'white',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      border: `2px solid ${colorSettings.secondaryBackgroundColor}`,
                    }}>
                      +
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '30px',
            textAlign: 'center',
            background: colorSettings.secondaryBackgroundColor,
            borderRadius: '12px',
            border: `1px solid ${colorSettings.borderColor}`,
          }}>
            <p style={{ color: colorSettings.secondaryTextColor, fontSize: '14px' }}>
              No products selected. Add products to see the preview.
            </p>
          </div>
        )}

        {/* Total & Buttons */}
        <div style={{ marginTop: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: colorSettings.primaryBackgroundColor,
            borderRadius: '12px',
            border: `1px solid ${colorSettings.borderColor}`,
          }}>
            <div>
              <div style={{ color: colorSettings.primaryTextColor, fontSize: '15px', fontWeight: '600' }}>
                Total
              </div>
              {pricing.discountPercentage > 0 && (
                <div style={{ color: colorSettings.countdownBgColor, fontSize: '11px', marginTop: '4px' }}>
                  Save {pricing.discountPercentage}% (${pricing.saved})
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: colorSettings.primaryTextColor, fontSize: '15px', fontWeight: '600' }}>
                ${pricing.discountedPrice}
              </div>
              {pricing.discountPercentage > 0 && (
                <div style={{ 
                  color: colorSettings.secondaryTextColor, 
                  fontSize: '11px', 
                  textDecoration: 'line-through',
                  marginTop: '4px'
                }}>
                  ${pricing.totalPrice}
                </div>
              )}
            </div>
          </div>

          <button style={{
            width: '100%',
            padding: '15px',
            marginTop: '8px',
            background: colorSettings.buttonColor,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
            {addToCartText}
          </button>

          {showSkipButton && (
            <button style={{
              width: '100%',
              padding: '15px',
              marginTop: '8px',
              background: colorSettings.secondaryBackgroundColor,
              color: colorSettings.primaryTextColor,
              border: `1px solid ${colorSettings.borderColor}`,
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
            }}>
              {skipOfferText}
            </button>
          )}
        </div>
      </div>
    );
  };

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
          title={bundleTitle}
          onTitleChange={(value) => { setBundleTitle(value); markAsChanged(); }}
          enabled={bundleEnabled}
          onEnabledChange={(value) => { setBundleEnabled(value); markAsChanged(); }}
          onSave={handleSave}
          isLoading={isSaving}
        />
        
        <EditorPreviewPanel
          device={device}
          onDeviceChange={setDevice}
        >
          <ProductPagePreview widgetLabel="Bundle Offer">
            {renderBundlePreview()}
          </ProductPagePreview>
        </EditorPreviewPanel>
      </EditorRightContent>
    </EditorLayout>
  );
};

export default StandardBundleEditor;
