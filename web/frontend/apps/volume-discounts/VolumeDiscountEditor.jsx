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
  ConfigToggleRow,
  EditorPreviewPanel,
  ProductPagePreview,
  EditorHeader,
  EditorRightContent,
  EditorToast,
  CountdownThemePicker,
  CountdownTimerDisplay
} from '../../components/Editor';
import { useEditorNavigation, useSimpleToast } from '../../hooks';
import { editorFetch } from '../../utils/editorAuth';
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

/**
 * VolumeDiscountEditor - Editor for Volume Discount app
 * Uses reusable Editor components with app-specific configuration
 * 
 * Opens in a new browser tab for a clean, standalone experience.
 * URL: /volume-discount/editor/:id (edit) or /volume-discount/editor (create)
 */
export const VolumeDiscountEditor = () => {
  // Get bundle ID from URL params (if editing existing bundle)
  const { id } = useParams();
  const { closeEditor } = useEditorNavigation();
  // No App Bridge in the standalone editor (see useEditorNavigation.js), so
  // there's no host toast to show one on - useSimpleToast renders a real,
  // visible banner instead.
  const [toast, showToast] = useSimpleToast();

  // Loading state for fetching bundle data
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);

  // Tab and setting state
  const [activeTab, setActiveTab] = useState('bundle');
  const [activeSettingId, setActiveSettingId] = useState('select-products');
  const [device, setDevice] = useState('desktop');

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
  const [countdownTheme, setCountdownTheme] = useState('classic');
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

  // Timer display
  const [timeLeft, setTimeLeft] = useState({ hours: '23', minutes: '59', seconds: '59' });

  // Fetch bundle data if editing (id from URL params)
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchBundle = async () => {
      try {
        const response = await editorFetch(`/api/bundles/${id}`);
        if (!response.ok) throw new Error('Failed to fetch bundle');
        const data = await response.json();
        const bundle = data?.data || data;

        if (bundle) {
          setEditingBundle(bundle);
          // Populate form state from fetched data
          setBundleTitle(bundle.title || 'Buy More & Save More! 🔥');
          setBundleInternalName(bundle.internalName || '');
          setSecondaryMessage(bundle.secondaryMessage || '');
          setBundleEnabled(bundle.status ?? true);
          setBundlePriority(bundle.bundlePriority || bundle.priority || 0);
          setSelectedProducts(bundle.products || []);
          setDiscountType(bundle.discountType || 'Percentage');
          setDiscountValue(bundle.discountValue?.toString() || '10');
          
          // Load quantity breaks
          if (bundle.quantityBreaks && bundle.quantityBreaks.length > 0) {
            setQuantityBreaks(bundle.quantityBreaks);
          }

          // Widget appearance
          if (bundle.widgetAppearance) {
            setColorSettings({
              primaryTextColor: bundle.widgetAppearance.primaryTextColor || '#303030',
              secondaryTextColor: bundle.widgetAppearance.secondaryTextColor || '#000000',
              primaryBackgroundColor: bundle.widgetAppearance.PrimaryBackgroundColor || '#FFFFFF',
              secondaryBackgroundColor: bundle.widgetAppearance.secondaryBackgroundColor || '#f1f2f4',
              borderColor: bundle.widgetAppearance.borderColor || '#FFFFFF',
              buttonColor: bundle.widgetAppearance.buttonColor || '#000000',
              countdownBgColor: bundle.widgetAppearance.offerTagBackgroundColor || '#C4290E',
              countdownTextColor: bundle.widgetAppearance.offerTagTextColor || '#FFFFFF',
            });
            setShowCountdown(bundle.widgetAppearance.isShowCountDownTimer || false);
            setCountdownTheme(bundle.widgetAppearance.offerTagTheme || 'classic');
            setShowEmoji(bundle.widgetAppearance.addEmoji ?? true);
            setMargins({
              top: bundle.widgetAppearance.topMargin || 20,
              bottom: bundle.widgetAppearance.bottomMargin || 20,
            });
            setCornerRadius(bundle.widgetAppearance.cardCornerRadius || 20);

            // Button settings
            setAddToCartText(bundle.widgetAppearance.addToCartText || 'Add to Cart');
            setAddToCartBgColor(bundle.widgetAppearance.addToCartBgColor || '#000000');
            setAddToCartTextColor(bundle.widgetAppearance.addToCartTextColor || '#FFFFFF');
            setShowSkipButton(bundle.widgetAppearance.showSkipButton ?? true);
            setSkipButtonText(bundle.widgetAppearance.skipButtonText || 'Skip Offer');
            setSkipButtonBgColor(bundle.widgetAppearance.skipButtonBgColor || '#f5f5f5');
            setSkipButtonTextColor(bundle.widgetAppearance.skipButtonTextColor || '#666666');
          }

          // Schedule
          if (bundle.startDate) setStartDate(new Date(bundle.startDate).toISOString().slice(0, 16));
          if (bundle.endDate) setEndDate(new Date(bundle.endDate).toISOString().slice(0, 16));
        }
      } catch (err) {
        console.error('Error fetching bundle:', err);
        showToast('Failed to load bundle data', { duration: 3000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBundle();
  }, [id]);

  // Fetch store products
  const fetchStoreProducts = async (search = '') => {
    setProductsLoading(true);
    try {
      const response = await editorFetch(`/api/products${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch products");
      }
      const products = data.data?.edges?.map(edge => {
        const product = edge.node;
        // Required by formatComponentsStringForVolumeDiscount (backend) -
        // Shopify's Bundles API rejects the mutation with "Missing or
        // invalid options" if a component's optionSelections don't map
        // every option of the underlying product.
        const optionSelections = product.options?.map(opt => ({
          componentOptionId: opt.id,
          name: opt.name,
          uniqueName: `${product.title} ${opt.name}`,
          values: opt.values,
        })) || [];

        const images = product.images?.edges?.map(e => e.node.url).filter(Boolean) || [];
        return {
          productId: product.id,
          title: product.title,
          price: product.variants?.nodes?.[0]?.price || '0',
          media: images[0] || product.featuredMedia?.image?.url || tshirt,
          images: images.length ? images : (product.featuredMedia?.image?.url ? [product.featuredMedia.image.url] : []),
          variants: product.variants?.nodes || [],
          optionSelections,
        };
      }) || [];
      setStoreProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast(error.message || "Failed to load products", { duration: 3000 });
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  // The picker only ever holds one page (10 products, newest first) - without
  // this, searching for an older product that isn't in that page can never
  // find it no matter what's typed, since filtering below only runs over
  // what's already been fetched. Re-fetching with the search term lets the
  // backend query the full catalog instead.
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchStoreProducts(productSearchQuery);
    }, 300);
    return () => clearTimeout(handle);
  }, [productSearchQuery]);

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

  // Add product to bundle - Volume Discount is tiered pricing on a single
  // product, so a new pick replaces whatever was selected rather than
  // appending to it.
  const handleAddProduct = (product) => {
    setSelectedProducts([product]);
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
      showToast("Please enter a bundle title", { duration: 3000 });
      return;
    }
    if (selectedProducts.length !== 1) {
      showToast("Volume Discount supports exactly 1 product per offer.", { duration: 3000 });
      return;
    }
    if (!discountType) {
      showToast("Please select a discount type", { duration: 3000 });
      return;
    }
    if (quantityBreaks.length < 1) {
      showToast("Please add at least one quantity break", { duration: 3000 });
      return;
    }
    if (!discountValue || isNaN(discountValue) || parseFloat(discountValue) <= 0) {
      showToast("Please enter a valid discount value", { duration: 3000 });
      return;
    }
    if (discountType === 'Percentage' && parseFloat(discountValue) > 100) {
      showToast("Percentage discount cannot exceed 100", { duration: 3000 });
      return;
    }
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      showToast("End date must be after start date", { duration: 3000 });
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
      internalName: bundleInternalName && bundleInternalName.trim() !== '' ? bundleInternalName.trim() : bundleTitle.trim(),
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
        offerTagTheme: countdownTheme,
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
      const isEditing = !!id;
      const url = isEditing ? `/api/bundles/${id}` : "/api/bundles";
      const method = isEditing ? "PUT" : "POST";

      const response = await editorFetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundleData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Bundle " + (isEditing ? "updated" : "created") + " successfully:", data);
        showToast(`Bundle ${isEditing ? "updated" : "created"} successfully!`, { duration: 5000, tone: "success" });
        // Clear unsaved changes flag and close editor - delayed slightly so
        // the success toast is actually visible before the tab closes.
        setHasUnsavedChanges(false);
        setTimeout(() => closeEditor(), 600);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error saving bundle:", errorData);
        showToast(errorData.error || errorData.message || "Failed to save bundle", { duration: 5000 });
      }
    } catch (error) {
      console.error("Error saving bundle:", error);
      showToast("An error occurred while saving the bundle", { duration: 5000 });
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
          <EditorConfigPanel title="Select Products" description="Volume Discount applies tiered pricing to exactly 1 product - picking a new product replaces the current one.">
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

                {/* Product List */}
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '12px' }}>
                  {productsLoading ? (
                    <p style={{ textAlign: 'center', padding: '12px', color: 'rgba(255,255,255,0.6)' }}>Loading products...</p>
                  ) : availableProducts.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '12px', color: 'rgba(255,255,255,0.6)' }}>No products found</p>
                  ) : (
                    availableProducts.map(product => (
                      <div
                        key={product.productId}
                        onClick={() => handleAddProduct(product)}
                        style={{
                          display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer',
                          borderRadius: '8px', marginBottom: '6px', backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      >
                        <img src={product.media || tshirt} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px', marginRight: '10px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, margin: 0, color: 'rgba(255,255,255,0.9)' }}>{product.title}</p>
                          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>${product.price}</p>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>+</span>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowProductPicker(true)}
                  style={{
                    width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer',
                    marginBottom: '16px', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)'
                  }}
                >
                  {selectedProducts.length > 0 ? '↻ Change Product' : '+ Add Product'}
                </button>

                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Selected Product ({selectedProducts.length}/1)
                  </p>
                  {selectedProducts.map((product, index) => (
                    <div key={product.productId || index} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px', background: 'rgba(81, 105, 221, 0.1)', borderRadius: '8px', marginBottom: '8px',
                      border: '1px solid rgba(81, 105, 221, 0.3)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={product.media || tshirt} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{product.title}</div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>${product.price}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(product.productId)}
                        style={{
                          background: 'rgba(255,59,48,0.2)', border: 'none', borderRadius: '4px',
                          color: '#ff3b30', padding: '4px 8px', cursor: 'pointer'
                        }}>✕</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'quantity-breaks':
        return (
          <EditorConfigPanel title="Quantity Breaks" description="Set different discounts based on quantity purchased">
            {quantityBreaks.map((qb, index) => (
              <div key={index} style={{
                padding: '16px', backgroundColor: qb.default ? 'rgba(81, 105, 221, 0.15)' : 'rgba(255,255,255,0.05)',
                borderRadius: '8px', marginBottom: '12px', border: qb.default ? '2px solid #5169DD' : '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                    {qb.default && <span style={{ color: '#5169DD', marginRight: '8px' }}>★</span>}
                    Tier {index + 1}
                  </span>
                  {quantityBreaks.length > 1 && (
                    <button onClick={() => handleRemoveQuantityBreak(index)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>✕</button>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <ConfigFormGroup label="Quantity">
                    <ConfigInput
                      type="number"
                      value={qb.quantity}
                      onChange={(e) => handleQuantityBreakChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </ConfigFormGroup>
                  <ConfigFormGroup label="Discount %">
                    <ConfigInput
                      type="number"
                      value={qb.discount}
                      onChange={(e) => handleQuantityBreakChange(index, 'discount', parseInt(e.target.value) || 0)}
                    />
                  </ConfigFormGroup>
                </div>

                <ConfigFormGroup label="Display Name">
                  <ConfigInput
                    type="text"
                    value={qb.name}
                    onChange={(e) => handleQuantityBreakChange(index, 'name', e.target.value)}
                  />
                </ConfigFormGroup>

                <ConfigFormGroup label="Banner Text (optional)">
                  <ConfigInput
                    type="text"
                    value={qb.banner}
                    onChange={(e) => handleQuantityBreakChange(index, 'banner', e.target.value)}
                    placeholder="e.g., MOST POPULAR"
                  />
                </ConfigFormGroup>

                <ConfigToggleRow
                  label="Set as default selection"
                  checked={qb.default}
                  onChange={(val) => handleQuantityBreakChange(index, 'default', val)}
                />
              </div>
            ))}
            
            <button
              onClick={handleAddQuantityBreak}
              style={{
                width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)'
              }}
            >
              + Add Another Quantity Break
            </button>
          </EditorConfigPanel>
        );

      case 'bundle-priority':
        return (
          <EditorConfigPanel title="Priority" description="Set bundle display priority (higher = shown first)">
            <ConfigFormGroup label="Priority Order">
              <ConfigInput
                type="number"
                value={bundlePriority}
                onChange={(e) => setBundlePriority(parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
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
          <EditorConfigPanel title="Message Text" description="Customize the offer messages">
            <ConfigFormGroup label="Primary Message">
              <ConfigInput value={bundleTitle} onChange={(e) => setBundleTitle(e.target.value)} placeholder="Buy More & Save More!" />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Message">
              <ConfigInput value={secondaryMessage} onChange={(e) => setSecondaryMessage(e.target.value)} placeholder="The more you buy, the more you save" />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'emoji-icons':
        return (
          <EditorConfigPanel title="Emoji & Icons" description="Toggle emoji and icon display">
            <ConfigToggleRow label="Show Emoji in Timer" checked={showEmoji} onChange={setShowEmoji} />
          </EditorConfigPanel>
        );

      case 'countdown-timer':
        return (
          <EditorConfigPanel title="Countdown Timer" description="Configure the countdown timer">
            <ConfigToggleRow label="Show Countdown Timer" checked={showCountdown} onChange={setShowCountdown} />
            {showCountdown && (
              <>
                <ConfigFormGroup label="Timer Theme" hint="Pick a visual style - colors below still apply to any theme">
                  <CountdownThemePicker
                    value={countdownTheme}
                    onChange={setCountdownTheme}
                    bgColor={colorSettings.countdownBgColor}
                    textColor={colorSettings.countdownTextColor}
                  />
                </ConfigFormGroup>
                <ConfigFormGroup label="Timer Background Color">
                  <ConfigInput type="color" value={colorSettings.countdownBgColor} onChange={(e) => setColorSettings({ ...colorSettings, countdownBgColor: e.target.value })} />
                </ConfigFormGroup>
                <ConfigFormGroup label="Timer Text Color">
                  <ConfigInput type="color" value={colorSettings.countdownTextColor} onChange={(e) => setColorSettings({ ...colorSettings, countdownTextColor: e.target.value })} />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'add-to-cart-button':
        return (
          <EditorConfigPanel title="Add to Cart Button" description="Customize the add to cart button">
            <ConfigFormGroup label="Button Text">
              <ConfigInput value={addToCartText} onChange={(e) => setAddToCartText(e.target.value)} placeholder="Add to Cart" />
            </ConfigFormGroup>
            <ConfigFormGroup label="Background Color">
              <ConfigInput type="color" value={addToCartBgColor} onChange={(e) => setAddToCartBgColor(e.target.value)} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Text Color">
              <ConfigInput type="color" value={addToCartTextColor} onChange={(e) => setAddToCartTextColor(e.target.value)} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'skip-offer-button':
        return (
          <EditorConfigPanel title="Skip Offer Button" description="Customize the skip offer button">
            <ConfigToggleRow label="Show Skip Button" checked={showSkipButton} onChange={setShowSkipButton} />
            {showSkipButton && (
              <>
                <ConfigFormGroup label="Button Text">
                  <ConfigInput value={skipButtonText} onChange={(e) => setSkipButtonText(e.target.value)} placeholder="Skip Offer" />
                </ConfigFormGroup>
                <ConfigFormGroup label="Background Color">
                  <ConfigInput type="color" value={skipButtonBgColor} onChange={(e) => setSkipButtonBgColor(e.target.value)} />
                </ConfigFormGroup>
                <ConfigFormGroup label="Text Color">
                  <ConfigInput type="color" value={skipButtonTextColor} onChange={(e) => setSkipButtonTextColor(e.target.value)} />
                </ConfigFormGroup>
              </>
            )}
          </EditorConfigPanel>
        );

      case 'primary-colors':
        return (
          <EditorConfigPanel title="Primary Colors" description="Set primary colors">
            <ConfigFormGroup label="Primary Text Color">
              <ConfigInput type="color" value={colorSettings.primaryTextColor} onChange={(e) => setColorSettings({ ...colorSettings, primaryTextColor: e.target.value })} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Primary Background Color">
              <ConfigInput type="color" value={colorSettings.primaryBackgroundColor} onChange={(e) => setColorSettings({ ...colorSettings, primaryBackgroundColor: e.target.value })} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'secondary-colors':
        return (
          <EditorConfigPanel title="Secondary Colors" description="Set secondary colors">
            <ConfigFormGroup label="Secondary Text Color">
              <ConfigInput type="color" value={colorSettings.secondaryTextColor} onChange={(e) => setColorSettings({ ...colorSettings, secondaryTextColor: e.target.value })} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Secondary Background Color">
              <ConfigInput type="color" value={colorSettings.secondaryBackgroundColor} onChange={(e) => setColorSettings({ ...colorSettings, secondaryBackgroundColor: e.target.value })} />
            </ConfigFormGroup>
            <ConfigFormGroup label="Border Color">
              <ConfigInput type="color" value={colorSettings.borderColor} onChange={(e) => setColorSettings({ ...colorSettings, borderColor: e.target.value })} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'margins':
        return (
          <EditorConfigPanel title="Margins" description="Set widget margins">
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
          <EditorConfigPanel title="Card Settings" description="Configure card appearance">
            <ConfigFormGroup label="Corner Radius (px)">
              <ConfigInput type="number" value={cornerRadius} onChange={(e) => setCornerRadius(parseInt(e.target.value) || 0)} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'start-date':
        return (
          <EditorConfigPanel title="Start Date" description="When should this offer start?">
            <ConfigFormGroup label="Start Date & Time">
              <ConfigInput type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      case 'end-date':
        return (
          <EditorConfigPanel title="End Date" description="When should this offer end?">
            <ConfigFormGroup label="End Date & Time">
              <ConfigInput type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </ConfigFormGroup>
          </EditorConfigPanel>
        );

      default:
        return <p style={{ color: 'rgba(255,255,255,0.6)' }}>Select a setting to configure</p>;
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
            <CountdownTimerDisplay
              theme={countdownTheme}
              bgColor={colorSettings.countdownBgColor}
              textColor={colorSettings.countdownTextColor}
              hours={timeLeft.hours}
              minutes={timeLeft.minutes}
              seconds={timeLeft.seconds}
              label="Ends in"
              showEmoji={showEmoji}
            />
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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const firstSetting = VOLUME_SETTINGS[tabId]?.[0]?.items?.[0];
    if (firstSetting) setActiveSettingId(firstSetting.id);
  };

  return (
    <EditorLayout>
      <EditorToast toast={toast} />
      <EditorSidepane
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        <EditorSettingsPane
          groups={currentSettings}
          activeSetting={activeSettingId}
          onSettingChange={setActiveSettingId}
        />
        {renderConfigContent()}
      </EditorSidepane>

      <EditorRightContent>
        <EditorHeader
          title={bundleInternalName || 'New Volume Discount'}
          onTitleChange={(value) => { setBundleInternalName(value); markAsChanged(); }}
          enabled={bundleEnabled}
          onEnabledChange={(value) => { setBundleEnabled(value); markAsChanged(); }}
          onSave={handleSave}
          isLoading={isSaving}
        />

        <EditorPreviewPanel device={device} onDeviceChange={setDevice}>
          <ProductPagePreview widgetLabel="Volume Discount">
            {renderVolumePreview()}
          </ProductPagePreview>
        </EditorPreviewPanel>
      </EditorRightContent>
    </EditorLayout>
  );
};

export default VolumeDiscountEditor;
