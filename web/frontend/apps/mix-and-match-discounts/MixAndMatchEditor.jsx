import React, { useState, useEffect } from 'react';

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

export default function MixAndMatchEditor({ editingBundle, onSave }) {
  

  // Tab and setting state
  const [activeTab, setActiveTab] = useState('bundle');
  const [activeSettingId, setActiveSettingId] = useState('select-products');
  
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
  const [bundleTitle, setBundleTitle] = useState('Mix & Match - Save More! 🔥');
  const [bundleInternalName, setBundleInternalName] = useState('');
  const [secondaryMessage, setSecondaryMessage] = useState('Select any items and save on your purchase');
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
  const [discountValue, setDiscountValue] = useState('15');

  // Tier states (Mix and Match specific)
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
    secondaryTextColor: '#000000',
    primaryBackgroundColor: '#FFFFFF',
    secondaryBackgroundColor: '#f1f2f4',
    borderColor: '#FFFFFF',
    buttonColor: '#000000',
    countdownBgColor: '#C4290E',
    countdownTextColor: '#FFFFFF',
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

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: '23', minutes: '59', seconds: '59' });

  // Initialize form with edit data
  useEffect(() => {
    if (editingBundle) {
      setBundleTitle(editingBundle.title || 'Mix & Match - Save More! 🔥');
      setBundleInternalName(editingBundle.internalName || '');
      setSecondaryMessage(editingBundle.secondaryMessage || 'Select any items and save on your purchase');
      setBundleEnabled(editingBundle.status ?? true);
      setBundlePriority(editingBundle.bundlePriority || 0);
      setDiscountType(editingBundle.discountType || 'Percentage');
      setDiscountValue(editingBundle.discountValue?.toString() || '15');

      // Mix and Match specific
      setSelectedTier(editingBundle.selectedTier || 2);
      if (editingBundle.tierDiscounts) {
        setTierDiscounts(editingBundle.tierDiscounts);
      }

      // Set products
      if (editingBundle.products) {
        setSelectedProducts(editingBundle.products);
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

  const fetchStoreProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await fetch("/api/products", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      const products = data.data?.products?.edges || [];

      const formattedProducts = products.map((edge) => {
        const product = edge.node;
        const variant = product.variants?.nodes?.[0];
        return {
          id: product.id,
          productId: product.id,
          title: product.title,
          price: variant?.price || "0.00",
          media: product.images?.nodes?.[0]?.url || tshirt,
          quantity: 1,
          optionSelections: product.options?.map((opt) => ({
            name: opt.name,
            values: opt.values,
          })) || [],
        };
      });

      setStoreProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      shopify?.toast?.show("Failed to load products", { duration: 3000 });
    } finally {
      setProductsLoading(false);
    }
  };

  // Helper functions
  const handleSettingClick = (settingId) => {
    setActiveSettingId(settingId);
    if (settingId === 'select-products') {
      setShowProductPicker(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const firstSetting = MIXMATCH_SETTINGS[tabId]?.[0]?.items?.[0]?.id;
    if (firstSetting) setActiveSettingId(firstSetting);
  };

  const handleColorChange = (colorKey, value) => {
    setColorSettings(prev => ({ ...prev, [colorKey]: value }));
  };

  const handleTierDiscountChange = (tier, value) => {
    setTierDiscounts(prev => ({ ...prev, [tier]: value }));
  };

  const getFilteredProducts = () => {
    const selectedIds = selectedProducts.map(p => p.productId);
    let filtered = storeProducts.filter(p => !selectedIds.includes(p.productId));
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

  // Calculate discounted price based on tier
  const calculateDiscountedPrice = (originalPrice) => {
    const price = parseFloat(originalPrice) || 0;
    const discount = parseFloat(tierDiscounts[selectedTier]) || parseFloat(discountValue) || 0;

    if (discountType === 'Percentage') {
      return (price * (1 - discount / 100)).toFixed(2);
    } else if (discountType === 'Fixed Amount') {
      return Math.max(0, price - discount).toFixed(2);
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
    if (selectedProducts.length < selectedTier) {
      shopify?.toast?.show(`Please select at least ${selectedTier} products for this tier`, { duration: 3000 });
      return;
    }
    if (!discountType) {
      shopify?.toast?.show("Please select a discount type", { duration: 3000 });
      return;
    }

    const bundleData = {
      title: bundleTitle,
      secondaryMessage: secondaryMessage,
      products: selectedProducts,
      discountType: discountType,
      discountValue: parseFloat(discountValue) || 0,
      status: bundleEnabled,
      internalName: bundleInternalName,
      type: "Mix and Match",
      bundlePriority: parseInt(bundlePriority) || 0,
      selectedTier: selectedTier,
      tierDiscounts: tierDiscounts,
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
      const url = isEditing ? `/api/bundles/mix-and-match/${editingBundle._id}` : "/api/bundles/mix-and-match";
      const method = "POST";

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
                  {productsLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading products...</div>
                  ) : availableProducts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                      No products available.
                    </div>
                  ) : (
                    availableProducts.slice(0, 10).map(product => (
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
                    ))
                  )}
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
                    No products selected. Click "Add Products" to select from inventory.
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
            <ConfigFormGroup label={discountType === 'Percentage' ? 'Default Discount Percentage' : 'Default Discount Amount ($)'}>
              <ConfigInput
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'Percentage' ? 'e.g., 15' : 'e.g., 10.00'}
                min="0"
                max={discountType === 'Percentage' ? '100' : undefined}
              />
            </ConfigFormGroup>
            <div style={{ padding: '12px', background: 'rgba(81, 105, 221, 0.1)', borderRadius: '8px', marginTop: '15px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                💡 You can set tier-specific discounts in the "Tier Settings" section.
              </span>
            </div>
          </EditorConfigPanel>
        );

      case 'tier-settings':
        return (
          <EditorConfigPanel title="Tier Settings" description="Configure quantity tiers and discounts">
            <ConfigFormGroup label="Minimum Quantity to Unlock">
              <ConfigSelect
                value={selectedTier}
                onChange={(e) => setSelectedTier(parseInt(e.target.value))}
                options={TIER_OPTIONS}
              />
            </ConfigFormGroup>
            <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
              Tier Discounts ({discountType === 'Percentage' ? '%' : '$'})
            </div>
            {TIER_OPTIONS.map(tier => (
              <ConfigFormGroup key={tier.value} label={tier.label}>
                <ConfigInput
                  type="number"
                  value={tierDiscounts[tier.value] || ''}
                  onChange={(e) => handleTierDiscountChange(tier.value, e.target.value)}
                  placeholder={discountType === 'Percentage' ? 'e.g., 10' : 'e.g., 5.00'}
                  min="0"
                />
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
              <ConfigInput value={bundleTitle} onChange={(e) => setBundleTitle(e.target.value)} placeholder="Mix & Match - Save More!" />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Message" hint="Supporting text below the headline">
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
          <EditorConfigPanel title="Skip Offer Button" description="Optional button to dismiss the offer">
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

  // Render Mix & Match preview widget (matching production)
  const renderMixMatchPreview = () => {
    const hasProducts = selectedProducts.length > 0;
    const currentDiscount = tierDiscounts[selectedTier] || discountValue;

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
          {bundleTitle || 'Mix & Match - Save More! 🔥'}
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
          <div style={{
            padding: '30px 15px',
            textAlign: 'center',
            backgroundColor: colorSettings.primaryBackgroundColor,
            borderRadius: `${Math.max(0, cornerRadius - 5)}px`,
            border: `1px solid ${colorSettings.borderColor}`,
            marginTop: '15px',
          }}>
            <p style={{ fontSize: '14px', color: colorSettings.secondaryTextColor, margin: 0 }}>
              Select products to see the preview
            </p>
          </div>
        ) : (
          <>
            {/* Tier Selection Buttons - Production Style */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', marginTop: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
              {Object.entries(tiers).map(([tierKey, tierConfig]) => {
                const isSelected = selectedTier === parseInt(tierKey);
                return (
                  <button
                    key={tierKey}
                    onClick={() => setSelectedTier(parseInt(tierKey))}
                    style={{
                      minWidth: '120px',
                      height: '60px',
                      padding: '12px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: isSelected ? '#5169DD' : 'white',
                      color: isSelected ? 'white' : '#222222',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: !isSelected ? '1px solid #222222' : 'none',
                    }}>
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5169DD" strokeWidth="3">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{tierConfig.label}</span>
                      <span style={{ fontSize: '11px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#616161' }}>{tierConfig.sublabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Info Text */}
            <div style={{ fontSize: '12px', color: colorSettings.secondaryTextColor, marginBottom: '12px' }}>
              You have selected {selectedProducts.length} Products.<br />
              {currentDiscount}% Discount is applied on the selected products.
            </div>

            {/* Products List - Production Style (vertical cards) */}
            {selectedProducts.map((product, index) => (
              <div
                key={product.productId || index}
                style={{
                  padding: '15px',
                  borderRadius: `${Math.max(0, cornerRadius - 5)}px`,
                  marginBottom: '12px',
                  backgroundColor: colorSettings.primaryBackgroundColor,
                  border: `1px solid ${colorSettings.borderColor}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={product.media || tshirt}
                    alt={product.title}
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
                      {product.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: colorSettings.primaryTextColor }}>
                        ${calculateDiscountedPrice(product.price)}
                      </span>
                      <span style={{ width: '1.5px', height: '10px', background: colorSettings.primaryTextColor, opacity: 0.3 }}></span>
                      <span style={{ color: colorSettings.secondaryTextColor, fontSize: '12px', textDecoration: 'line-through' }}>
                        ${product.price}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Variant Selector */}
                {product.optionSelections?.length > 0 && product.optionSelections[0].values?.length > 1 && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 500, color: colorSettings.secondaryTextColor, display: 'block', marginBottom: '4px' }}>
                      {product.optionSelections[0].name || 'Size'}
                    </label>
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
                      {product.optionSelections[0].values.map((val, vIdx) => (
                        <option key={vIdx}>{val}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}

            {/* Total Section */}
            <div style={{
              padding: '15px',
              backgroundColor: colorSettings.primaryBackgroundColor,
              borderRadius: `${Math.max(0, cornerRadius - 5)}px`,
              border: `1px solid ${colorSettings.borderColor}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: colorSettings.primaryTextColor }}>Total</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(() => {
                    const originalTotal = selectedProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
                    const discountedTotal = selectedProducts.reduce((sum, p) => sum + parseFloat(calculateDiscountedPrice(p.price)), 0);
                    const hasSavings = discountedTotal < originalTotal;
                    return (
                      <>
                        <span style={{ fontWeight: 700, fontSize: '18px', color: colorSettings.primaryTextColor }}>
                          ${discountedTotal.toFixed(2)}
                        </span>
                        {hasSavings && (
                          <>
                            <span style={{ width: '1.5px', height: '12px', background: colorSettings.primaryTextColor, opacity: 0.3 }}></span>
                            <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999' }}>
                              ${originalTotal.toFixed(2)}
                            </span>
                          </>
                        )}
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

  // Render product page preview
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
              Mix & Match Offer
            </div>
            {renderMixMatchPreview()}
          </div>
        </div>
      </div>
    </div>
  );

  // Get current settings based on active tab
  const currentSettings = MIXMATCH_SETTINGS[activeTab] || [];

  return (
    <EditorLayout>
      <EditorSidepane tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange}>
        <EditorSettingsPane
          groups={currentSettings}
          activeSetting={activeSettingId}
          onSettingChange={handleSettingClick}
        />
        {renderConfigContent()}
      </EditorSidepane>

      <EditorRightContent>
        <EditorHeader
          title={bundleInternalName || 'New Mix & Match Bundle'}
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
