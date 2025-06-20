class BOGOBundle {
  constructor() {
    this.currentProduct = null;
    this.bundleProducts = [];
    this.prioritizedBundleProducts = [];
    this.selectedProducts = new Map();
    this.bundleType = "bundle_discount";
    this.bundleConfig = {};
    this.bundleExists = false;
    this.container = null;
    this.allBundles = [];
    this.productHandleCache = new Map(); // Cache for product handles (ID -> handle)
    this.init();
  }

  async init() {
    this.container = document.querySelector(".bogo-bundle-container");
    if (!this.container) {
      console.error("BOGO Bundle container not found. Ensure the Liquid section is rendered.");
      return;
    }
    this.container.style.display = 'none';

    await this.loadCurrentProduct();

    try {
      await this.loadBundleProducts();
    } catch (error) {
      console.error("Failed to load bundle products:", error);
      this.bundleExists = false;
    }

    if (this.bundleExists) {
      console.log("Bundle exists, populating bundle UI");
      this.populateBundleUI();
      this.attachEventListeners();
      this.container.style.display = '';
    } else {
      console.log("No bundle found for this product, hiding UI.");
      this.container.remove();
    }
  }

  async loadCurrentProduct() {
    try {
      const productHandle = window.location.pathname.split("/").pop().split('?')[0];
      const response = await fetch(`/products/${productHandle}.js`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.currentProduct = await response.json();
      console.log("Current product loaded:", this.currentProduct);
      this.currentProduct.instanceId = `current-product-${this.currentProduct.id}`;

      if (this.currentProduct && this.currentProduct.variants.length > 0) {
        const defaultVariant = this.currentProduct.variants.find(v => v.available) || this.currentProduct.variants[0];
        this.selectedProducts.set(this.currentProduct.instanceId, {
          id: defaultVariant.id,
          price: parseFloat(defaultVariant.price),
          compare_at_price: defaultVariant.compare_at_price ? parseFloat(defaultVariant.compare_at_price) : null,
          title: defaultVariant.title,
          available: defaultVariant.available,
          quantity: 1
        });
        // Cache the handle of the current product
        this.productHandleCache.set(String(this.currentProduct.id), productHandle);
      }
    } catch (error) {
      console.error("Error loading current product:", error);
    }
  }

  async loadBundleProducts() {
    try {
      const productId = this.currentProduct?.id;
      if (!productId) {
        console.error("No current product ID found, cannot load bundles.");
        this.bundleExists = false;
        return;
      }

      const apiUrl = `/apps/bogo-app/api/frontStore/getActiveBundle?product_id=${productId}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error fetching bundles:", {
          status: response.status,
          url: response.url,
          response: errorText.substring(0, 500),
        });
        this.bundleExists = false;
        return;
      }

      const data = await response.json();
      console.log("Bundle data received from API:", data);

      if (data.bundles && data.bundles.length > 0) {
        this.allBundles = data.bundles;
        this.bundleExists = true;

        let prioritizedBundle = null;
        const currentProductIdString = String(this.currentProduct.id);

        for (const bundle of this.allBundles) {
          const bundleContainsCurrentProduct = bundle.products.some(
            (bp) => String(bp.productId).split('/').pop() === currentProductIdString
          );

          if (bundleContainsCurrentProduct) {
            prioritizedBundle = bundle;
            break;
          }
        }

        if (!prioritizedBundle && this.allBundles.length > 0) {
          prioritizedBundle = this.allBundles[0];
          console.warn("Current product not found in any bundle. Falling back to the first bundle from API.");
        }

        if (prioritizedBundle) {
          this.bundleType = prioritizedBundle.type.toLowerCase().replace(/\s+/g, "_");
          this.bundleConfig = {
            title: prioritizedBundle.title || "Special Bundle Offer!",
            discountPercent: prioritizedBundle.discountValue || 10,
            discountType: prioritizedBundle.discountType || "Percentage",
            showTimer: prioritizedBundle.widgetAppearance?.isShowCountDownTimer || false,
            multipleProducts: prioritizedBundle.type !== "Volume Discount",
            volumeOffer:
              prioritizedBundle.type === "Volume Discount"
                ? `Buy ${prioritizedBundle.quantityBreaks?.[0]?.quantity || 1}, get ${
                    prioritizedBundle.discountValue || 10
                  }% OFF`
                : null,
            timerEndsAt: prioritizedBundle.widgetAppearance?.countDownTimerEndsAt,
          };

          await this.collectProductsForPrioritizedBundle(prioritizedBundle);
          await this.collectAllBundleProducts();

        } else {
          console.warn("No bundles found from API or no suitable prioritized bundle could be determined.");
          this.bundleExists = false;
        }

      } else {
        console.log("No bundles returned from API for this product.");
        this.bundleExists = false;
      }
    } catch (error) {
      console.error("Error in loadBundleProducts:", error);
      this.bundleExists = false;
    }
  }

  /**
   * Resolves a Shopify product handle from its ID.
   * Prioritizes cache, then current product, then fetches using .json?ids.
   * @param {string} shopifyProductId - The numerical Shopify product ID.
   * @returns {Promise<string|null>} The product handle or null if not found.
   */
  async resolveProductHandle(shopifyProductId) {
    // 1. Check cache first
    if (this.productHandleCache.has(shopifyProductId)) {
      return this.productHandleCache.get(shopifyProductId);
    }

    // 2. Check if it's the current product
    if (this.currentProduct && String(this.currentProduct.id) === shopifyProductId) {
        const handle = window.location.pathname.split("/").pop().split('?')[0];
        this.productHandleCache.set(shopifyProductId, handle);
        return handle;
    }

    // 3. Attempt to fetch using /products.json?ids=ID
    try {
      console.log(`Resolving handle for ID ${shopifyProductId} via /products.json`);
      const response = await fetch(`/products.json?ids=${shopifyProductId}`);
      if (!response.ok) {
        console.warn(`Failed to fetch product list for ID ${shopifyProductId}. Status: ${response.status}`);
        return null;
      }
      const data = await response.json();
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        this.productHandleCache.set(shopifyProductId, product.handle);
        console.log(`Resolved handle for ID ${shopifyProductId}: ${product.handle}`);
        return product.handle;
      }
      console.warn(`No product found in /products.json for ID ${shopifyProductId}.`);
      return null;
    } catch (error) {
      console.error(`Error resolving handle for ID ${shopifyProductId}:`, error);
      return null;
    }
  }


  async collectProductsForPrioritizedBundle(bundle) {
    const fetchedProductCache = new Map();
    const prioritizedBundleProducts = [];

    console.log("Starting to collect products for prioritized bundle:", bundle);

    for (let productIndex = 0; productIndex < bundle.products.length; productIndex++) {
      const bundleProductItem = bundle.products[productIndex];
      const shopifyProductId = String(bundleProductItem.productId).split('/').pop();
      const quantity = bundleProductItem.quantity || 1;

      let productData;
      // Get the handle first
      const productHandle = await this.resolveProductHandle(shopifyProductId);
      if (!productHandle) {
          console.warn(`Could not resolve handle for product ID ${shopifyProductId}. Skipping this bundle product.`);
          continue;
      }

      // Now use the resolved handle to fetch product.js
      if (fetchedProductCache.has(shopifyProductId)) {
        productData = fetchedProductCache.get(shopifyProductId);
      } else {
        try {
          console.log(`Attempting to fetch product: /products/${productHandle}.js (for ID: ${shopifyProductId})`);
          const productResponse = await fetch(`/products/${productHandle}.js`);
          if (!productResponse.ok) {
            console.warn(`Failed to fetch product ${productHandle}. Status: ${productResponse.status}. Skipping.`);
            continue;
          }
          productData = await productResponse.json();
          fetchedProductCache.set(shopifyProductId, productData);
          console.log(`SUCCESS: Fetched product data for ${productHandle}.`);
        } catch (error) {
          console.error(`Error fetching product details for ${shopifyProductId} (handle: ${productHandle}):`, error);
          continue;
        }
      }

      if (!productData) {
        console.warn(`No product data available for ${shopifyProductId}. Skipping.`);
        continue;
      }

      const variants = productData.variants.map(variant => ({
        id: variant.id,
        title: variant.title,
        price: parseFloat(variant.price),
        compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
        available: variant.available,
        options: variant.options
      }));

      let defaultVariant = null;
      if (bundleProductItem.optionSelections && variants.length > 0) {
        const apiOptionsMap = new Map();
        bundleProductItem.optionSelections.forEach(opt => {
          if (opt.name && opt.values && opt.values.length > 0) {
            apiOptionsMap.set(opt.name.toLowerCase(), opt.values[0].toLowerCase());
          }
        });

        defaultVariant = variants.find(variant => {
          return variant.options.every((variantOptionValue, i) => {
            const optionName = productData.options[i]?.name.toLowerCase();
            if (optionName && apiOptionsMap.has(optionName)) {
              return variantOptionValue.toLowerCase() === apiOptionsMap.get(optionName);
            }
            return true;
          });
        });
      }

      if (!defaultVariant && variants.length > 0) {
        defaultVariant = variants.find(v => v.available) || variants[0];
      }

      const instanceId = `${productData.id}-prioritized-${bundle.id || '0'}-${productIndex}`;

      if (defaultVariant) {
        this.selectedProducts.set(instanceId, {
          id: defaultVariant.id,
          price: defaultVariant.price,
          compare_at_price: defaultVariant.compare_at_price,
          title: defaultVariant.title,
          available: defaultVariant.available,
          quantity: quantity
        });
      } else {
        console.warn(`No suitable variant found for product ${productData.title} with provided optionSelections for instance ${instanceId}. Setting as unavailable.`);
        this.selectedProducts.set(instanceId, {
          id: null,
          price: 0,
          compare_at_price: null,
          title: 'Product Unavailable',
          available: false,
          quantity: quantity
        });
      }

      prioritizedBundleProducts.push({
        id: productData.id,
        instanceId: instanceId,
        title: productData.title,
        image: bundleProductItem.media || productData.images[0]?.src || "",
        variants: variants,
        defaultQuantity: quantity,
        options: productData.options,
        bundleIndex: 0,
        bundleTitle: bundle.title || "Prioritized Bundle"
      });
    }
    this.prioritizedBundleProducts = prioritizedBundleProducts;
    console.log("Prioritized bundle products loaded:", this.prioritizedBundleProducts);
  }

  async collectAllBundleProducts() {
    const uniqueProducts = new Map();
    const fetchedProductCache = new Map();

    console.log("Starting collectAllBundleProducts. All bundles:", this.allBundles);

    if (!this.allBundles || this.allBundles.length === 0) {
        console.warn("No bundles available in this.allBundles to collect products from.");
        this.bundleProducts = [];
        return;
    }

    for (const bundle of this.allBundles) {
        console.log(`Processing bundle (ID: ${bundle.id}, Title: ${bundle.title}) for all products.`);
        if (!bundle.products || bundle.products.length === 0) {
            console.warn(`Bundle (ID: ${bundle.id}) has no products. Skipping.`);
            continue;
        }

        for (const bundleProductItem of bundle.products) {
            console.log(`  Processing bundle product item:`, bundleProductItem);

            const shopifyProductId = String(bundleProductItem.productId).split('/').pop();
            const quantity = bundleProductItem.quantity || 1;

            let productData;
            // Get the handle first using the new resolveProductHandle method
            const productHandle = await this.resolveProductHandle(shopifyProductId);
            if (!productHandle) {
                console.warn(`  Could not resolve handle for product ID ${shopifyProductId}. Skipping this bundle product.`);
                continue;
            }

            // Now use the resolved handle to fetch product.js
            if (fetchedProductCache.has(shopifyProductId)) {
                productData = fetchedProductCache.get(shopifyProductId);
                console.log(`  Product data for ${shopifyProductId} from cache.`);
            } else {
                try {
                    console.log(`  Attempting to fetch product: /products/${productHandle}.js (for ID: ${shopifyProductId})`);
                    const productResponse = await fetch(`/products/${productHandle}.js`);

                    if (!productResponse.ok) {
                        const errorText = await productResponse.text();
                        console.warn(`  WARNING: Failed to fetch product ${productHandle} for bundle ${bundle.id}. Status: ${productResponse.status}. Response: ${errorText.substring(0, 200)}`);
                        continue;
                    }
                    productData = await productResponse.json();
                    fetchedProductCache.set(shopifyProductId, productData);
                    console.log(`  SUCCESS: Fetched product data for ${productHandle}.`);
                } catch (error) {
                    console.error(`  ERROR: Error fetching product details for ${shopifyProductId} (Handle: ${productHandle}) in bundle ${bundle.id}:`, error);
                    continue;
                }
            }

            if (!productData) {
                console.warn(`  Skipping product as no data was loaded for ${shopifyProductId}.`);
                continue;
            }

            const instanceId = `${productData.id}-${bundle.id}-${bundleProductItem.productId.replace(/\D/g, '')}`;

            const variants = productData.variants.map(variant => ({
                id: variant.id,
                title: variant.title,
                price: parseFloat(variant.price),
                compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
                available: variant.available,
                options: variant.options
            }));

            let defaultVariant = null;
            if (bundleProductItem.optionSelections && variants.length > 0) {
                const apiOptionsMap = new Map();
                bundleProductItem.optionSelections.forEach(opt => {
                    if (opt.name && opt.values && opt.values.length > 0) {
                        apiOptionsMap.set(opt.name.toLowerCase(), opt.values[0].toLowerCase());
                    }
                });

                defaultVariant = variants.find(variant => {
                    return variant.options.every((variantOptionValue, i) => {
                        const optionName = productData.options[i]?.name.toLowerCase();
                        if (optionName && apiOptionsMap.has(optionName)) {
                            return variantOptionValue.toLowerCase() === apiOptionsMap.get(optionName);
                        }
                        return true;
                    });
                });
            }
            if (!defaultVariant && variants.length > 0) {
                defaultVariant = variants.find(v => v.available) || variants[0];
            }

            if (defaultVariant) {
                this.selectedProducts.set(instanceId, {
                    id: defaultVariant.id,
                    price: defaultVariant.price,
                    compare_at_price: defaultVariant.compare_at_price,
                    title: defaultVariant.title,
                    available: defaultVariant.available,
                    quantity: quantity
                });
            } else {
                console.warn(`  WARNING: No suitable variant found for product ${productData.title} (ID: ${productData.id}) in bundle ${bundle.id}. Setting as unavailable in selectedProducts.`);
                this.selectedProducts.set(instanceId, {
                    id: null,
                    price: 0,
                    compare_at_price: null,
                    title: 'Product Unavailable',
                    available: false,
                    quantity: quantity
                });
            }

            uniqueProducts.set(instanceId, {
                id: productData.id,
                instanceId: instanceId,
                title: productData.title,
                image: bundleProductItem.media || productData.images[0]?.src || "",
                variants: variants,
                defaultQuantity: quantity,
                options: productData.options,
                bundleId: bundle.id,
                bundleTitle: bundle.title
            });
        }
    }
    this.bundleProducts = Array.from(uniqueProducts.values());
    console.log("All unique bundle products collected:", this.bundleProducts);
  }

  // ... (rest of the methods: populateBundleUI, getPlusDividerHtml, getVariantOptionsHtml, getProductHtml,
  //      attachEventListeners, updateSelectedProductOptions, updateDisplayedProductPrice,
  //      updateBundleTotalPrice, formatCurrency, updateTimerDisplay, addBundleToCart, skipOffer)

  // Keep these methods exactly as they were in the last provided full code.
  // I've omitted them here for brevity, but they should be present in your final code.

  populateBundleUI() {
    if (!this.container) return;

    const titleElement = this.container.querySelector(".bogo-bundle-title");
    if (titleElement) {
      titleElement.textContent = this.bundleConfig.title;
    }

    const taglineElement = this.container.querySelector(".bogo-bundle-tagline");
    if (taglineElement) {
      const discountText = this.bundleConfig.volumeOffer || (this.bundleConfig.discountType === "Percentage" ?
        `save ${this.bundleConfig.discountPercent}%` :
        `save ${this.formatCurrency(this.bundleConfig.discountPercent)}`);
      taglineElement.textContent = `Bought together and ${discountText}!🔥`;
    }

    const productsContainer = this.container.querySelector(".bogo-products-container");
    if (productsContainer) {
      let allProductsHtml = "";
      let isFirstProductOverall = true;

      const displayedProductInstanceIds = new Set();

      // if (this.currentProduct) {
      //   allProductsHtml += this.getProductHtml(this.currentProduct, this.currentProduct.instanceId, true);
      //   displayedProductInstanceIds.add(this.currentProduct.instanceId);
      //   isFirstProductOverall = false;
      // }

      // if (this.prioritizedBundleProducts && this.prioritizedBundleProducts.length > 0) {
      //   this.prioritizedBundleProducts.forEach((productInstance) => {
      //     if (!displayedProductInstanceIds.has(productInstance.instanceId)) {
      //       if (!isFirstProductOverall) {
      //         allProductsHtml += this.getPlusDividerHtml();
      //       }
      //       allProductsHtml += this.getProductHtml(productInstance, productInstance.instanceId);
      //       displayedProductInstanceIds.add(productInstance.instanceId);
      //       isFirstProductOverall = false;
      //     }
      //   });
      // }

      this.bundleProducts.forEach((productInstance) => {
        if (!displayedProductInstanceIds.has(productInstance.instanceId)) {
          if (!isFirstProductOverall) {
            allProductsHtml += this.getPlusDividerHtml();
          }
          allProductsHtml += this.getProductHtml(productInstance, productInstance.instanceId);
          displayedProductInstanceIds.add(productInstance.instanceId);
          isFirstProductOverall = false;
        }
      });

      productsContainer.innerHTML = allProductsHtml;
    }

    this.updateBundleTotalPrice();
    this.updateTimerDisplay();
  }

  getPlusDividerHtml() {
    return `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: -25px;
        margin-bottom: -10px;
        z-index: 1;">
        <div style="
          width: 29.9px;
          height: 29.9px;
          background: #2A353D;
          color: white;
          font-size: 20px;
          font-weight: bold;
          border-radius: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 2px solid white;
          padding: 15px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          +
        </div>
      </div>
    `;
  }

  getVariantOptionsHtml(product, instanceId, selectedVariantId) {
    let optionsHtml = '';

    if (product.options && product.options.length > 0) {
      optionsHtml = product.options.map((option, optionIndex) => {
        const currentSelection = this.selectedProducts.get(instanceId)?.id;
        const currentVariantDetails = product.variants.find(v => v.id === currentSelection);
        const currentSelectedOptions = currentVariantDetails ? currentVariantDetails.options : [];

        const uniqueOptionValues = [...new Set(
          product.variants
            .filter(v => currentSelectedOptions.every((val, idx) => {
                if (idx === optionIndex) return true;
                return v.options[idx] === currentSelectedOptions[idx];
            }))
            .map(v => v.options[optionIndex])
        )];

        const selectedValueForThisOption = currentSelectedOptions[optionIndex] || uniqueOptionValues[0];

        return `
          <div style="margin-top: 10px; position: relative;">
            <label for="option-${instanceId}-${option.name.toLowerCase().replace(/\s/g, '-')}" style="font-size: 12px; margin-bottom: 5px; display: block;">${option.name}:</label>
            <select
              id="option-${instanceId}-${option.name.toLowerCase().replace(/\s/g, '-')}"
              class="bogo-product-variant-select"
              data-instance-id="${instanceId}"
              data-option-index="${optionIndex}"
              style="
                font-size: 12px;
                background: #F1F1F1;
                padding: 8px 12px;
                border-radius: 8px;
                border: 1px solid rgba(34, 34, 34, 0.1);
                width: 100%;
                appearance: none;">
              ${uniqueOptionValues.map(value => `
                <option value="${value}" ${value === selectedValueForThisOption ? 'selected' : ''}>
                  ${value}
                </option>
              `).join('')}
            </select>
            <span style="
              position: absolute;
              right: 15px;
              top: 70%;
              transform: translateY(-50%) translateZ(10px);
              pointer-events: none;
              font-size: 10px;">
              ▼
            </span>
          </div>
        `;
      }).join('');
    }
    return optionsHtml;
  }

  getProductHtml(product, instanceId, isCurrentProduct = false) {
    const selectedVariantInfo = this.selectedProducts.get(instanceId);

    if (!selectedVariantInfo) {
      console.warn(`No selected variant info found for instanceId: ${instanceId}. Product:`, product);
      return `<div>Product details unavailable for ${product.title}</div>`;
    }

    const originalPrice = this.formatCurrency(selectedVariantInfo.compare_at_price || selectedVariantInfo.price);
    const displayedPrice = this.formatCurrency(selectedVariantInfo.price);
    const variantSelectorsHtml = this.getVariantOptionsHtml(product, instanceId, selectedVariantInfo.id);

    const bundleIndicator = !isCurrentProduct && product.bundleTitle ?
      `<div style="font-size: 10px; color: #666; margin-bottom: 3px;">${product.bundleTitle}</div>` : '';

    return `
      <div class="bogo-single-product" data-instance-id="${instanceId}" style="
        padding: 15px;
        border-radius: 18px;
        margin-bottom: 15px;
        background-color: white;
        ${isCurrentProduct ? 'border: 2px solid #3B82F6;' : ''}">
        ${bundleIndicator}
        <div style="display: flex; align-items: center;">
          <img src="${product.image || product.images}" width="100" height="100" alt="${product.title} Image" style="border-radius: 10px; margin-right: 15px;" />
          <div style="flex-grow: 1;">
            <p style="font-weight: 600; font-size: 14px; margin-bottom: 5px;">
              ${product.title}
              ${isCurrentProduct ? '<span style="color: #3B82F6; font-size: 12px;"> (Current Product)</span>' : ''}
            </p>
            <div class="bogo-product-price-display" style="display: flex; align-items: center; gap: 8px;">
              <p style="font-weight: 600; font-size: 14px; margin: 0;">${displayedPrice}</p>
              ${selectedVariantInfo.compare_at_price ? `<p style="width: 1.5px; height: 10px; background: #222222; opacity: 0.1; margin: 0;"></p>
              <p style="color: #999; font-size: 12px; text-decoration: line-through; margin: 0;">${originalPrice}</p>` : ''}
            </div>
          </div>
        </div>
        ${variantSelectorsHtml}
      </div>
    `;
  }

  attachEventListeners() {
    const addToCartButton = this.container.querySelector(".bogo-add-to-cart");
    if (addToCartButton) {
      addToCartButton.addEventListener("click", this.addBundleToCart.bind(this));
    }

    const skipOfferButton = this.container.querySelector(".bogo-skip");
    if (skipOfferButton) {
      skipOfferButton.addEventListener("click", this.skipOffer.bind(this));
    }

    this.container.addEventListener("change", (e) => {
      if (e.target.matches(".bogo-product-variant-select")) {
        const instanceId = e.target.dataset.instanceId;
        const optionIndex = parseInt(e.target.dataset.optionIndex);
        const selectedOptionValue = e.target.value;
        this.updateSelectedProductOptions(instanceId, optionIndex, selectedOptionValue);
      }
    });
  }

  updateSelectedProductOptions(instanceId, changedOptionIndex, selectedOptionValue) {
    let productDetails = null;
    if (this.currentProduct && this.currentProduct.instanceId === instanceId) {
      productDetails = this.currentProduct;
    } else if (this.prioritizedBundleProducts.some(p => p.instanceId === instanceId)) {
      productDetails = this.prioritizedBundleProducts.find(p => p.instanceId === instanceId);
    } else {
      productDetails = this.bundleProducts.find(p => p.instanceId === instanceId);
    }

    if (!productDetails) {
      console.error(`Product details not found for instanceId: ${instanceId}`);
      return;
    }

    let currentSelectedVariant = this.selectedProducts.get(instanceId);
    let currentOptions = currentSelectedVariant ?
      productDetails.variants.find(v => v.id === currentSelectedVariant.id)?.options || [] :
      [];

    let newOptions = [...currentOptions];
    newOptions[changedOptionIndex] = selectedOptionValue;

    const matchedVariant = productDetails.variants.find(variant => {
      return variant.options.every((variantOptionValue, index) => {
        return newOptions[index] !== undefined && newOptions[index] === variantOptionValue;
      });
    });

    if (matchedVariant) {
      this.selectedProducts.set(instanceId, {
        id: matchedVariant.id,
        price: parseFloat(matchedVariant.price),
        compare_at_price: matchedVariant.compare_at_price ? parseFloat(matchedVariant.compare_at_price) : null,
        title: matchedVariant.title,
        available: matchedVariant.available,
        quantity: productDetails.defaultQuantity || 1
      });
      console.log(`Instance ${instanceId} variant updated to:`, matchedVariant);
      this.updateDisplayedProductPrice(instanceId);

      const productCard = this.container.querySelector(`.bogo-single-product[data-instance-id="${instanceId}"]`);
      if (productCard) {
          productCard.querySelectorAll('.bogo-product-variant-select').forEach(el => {
              if (el.parentElement && el.parentElement.tagName === 'DIV' && el.parentElement.style.position === 'relative') {
                  el.parentElement.remove();
              }
          });
          const priceDisplay = productCard.querySelector('.bogo-product-price-display');
          if (priceDisplay) {
              const newSelectorsHtml = this.getVariantOptionsHtml(productDetails, instanceId, matchedVariant.id);
              priceDisplay.insertAdjacentHTML('afterend', newSelectorsHtml);
          }
      }
    } else {
      console.warn(`No variant found matching new options for instance ${instanceId}:`, newOptions);
      this.selectedProducts.set(instanceId, {
        id: null,
        price: 0,
        compare_at_price: null,
        title: 'Product Unavailable',
        available: false,
        quantity: productDetails.defaultQuantity || 1
      });
      this.updateDisplayedProductPrice(instanceId);
    }

    this.updateBundleTotalPrice();
  }

  updateDisplayedProductPrice(instanceId) {
    const productCard = this.container.querySelector(`.bogo-single-product[data-instance-id="${instanceId}"]`);
    if (productCard) {
      const selectedVariant = this.selectedProducts.get(instanceId);
      if (selectedVariant) {
        const priceDisplay = productCard.querySelector('.bogo-product-price-display');
        if (priceDisplay) {
          const originalPrice = this.formatCurrency(selectedVariant.compare_at_price || selectedVariant.price);
          const displayedPrice = this.formatCurrency(selectedVariant.price);
          priceDisplay.innerHTML = `
            <p style="font-weight: 600; font-size: 14px; margin: 0;">${displayedPrice}</p>
            ${selectedVariant.compare_at_price ? `<p style="width: 1.5px; height: 10px; background: #222222; opacity: 0.1; margin: 0;"></p>
            <p style="color: #999; font-size: 12px; text-decoration: line-through; margin: 0;">${originalPrice}</p>` : ''}
          `;
        }
      }
    }
  }

  updateBundleTotalPrice() {
    let totalPrice = 0;
    this.selectedProducts.forEach(variantInfo => {
      if (variantInfo.id && variantInfo.available) {
        totalPrice += (variantInfo.price * variantInfo.quantity);
      }
    });

    let discountedPrice = totalPrice;
    if (this.bundleConfig.discountType === "Percentage") {
      discountedPrice = totalPrice * (1 - this.bundleConfig.discountPercent / 100);
    } else if (this.bundleConfig.discountType === "Fixed Amount") {
      discountedPrice = totalPrice - this.bundleConfig.discountPercent;
      if (discountedPrice < 0) discountedPrice = 0;
    }

    const totalElement = this.container.querySelector(".bogo-bundle-total-price");
    if (totalElement) {
      totalElement.textContent = this.formatCurrency(discountedPrice);
    }
  }

  formatCurrency(price) {
    return `Rs.${parseFloat(price).toFixed(2)}`;
  }

  updateTimerDisplay() {
    const timerDisplayElement = this.container.querySelector(".bogo-timer-display");
    const timerCountdownElement = this.container.querySelector(".bogo-timer-countdown");

    if (!this.bundleConfig.showTimer || !this.bundleConfig.timerEndsAt || !timerDisplayElement || !timerCountdownElement) {
      if (timerDisplayElement) timerDisplayElement.style.display = 'none';
      return;
    }

    timerDisplayElement.style.display = 'block';
    const endTime = new Date(this.bundleConfig.timerEndsAt).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(countdownInterval);
        timerCountdownElement.textContent = "EXPIRED";
        const addToCartButton = this.container.querySelector(".bogo-add-to-cart");
        if (addToCartButton) addToCartButton.disabled = true;
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timerCountdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
  }

  addBundleToCart() {
    console.log("Adding bundle to cart...");
    const items = [];

    this.selectedProducts.forEach(variantInfo => {
      if (variantInfo.id && variantInfo.available) {
        items.push({
          id: variantInfo.id,
          quantity: 1
        });
      }
    });

    if (items.length === 0) {
      console.warn("No valid products selected to add to cart.");
      alert("Please select available products to add to cart.");
      return;
    }

    fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items
        })
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => { throw new Error(errorData.message || 'Failed to add items to cart'); });
        }
        return response.json();
      })
      .then(data => {
        console.log('Bundle added to cart:', data);
        window.location.href = '/cart';
      })
      .catch(error => {
        console.error('Error adding bundle to cart:', error);
        alert(`Failed to add bundle to cart: ${error.message}`);
      });
  }

  skipOffer() {
    console.log("Skipping bundle offer...");
    if (this.container) {
      this.container.remove();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new BOGOBundle();
});