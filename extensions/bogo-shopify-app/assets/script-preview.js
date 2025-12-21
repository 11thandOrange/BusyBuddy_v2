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
    this.selectedQuantityBreakIndex = 0;
    // Buy One Get One specific properties
    this.xProducts = [];
    this.yProducts = [];
    this.selectedXProducts = new Map();
    this.selectedYProducts = new Map();
    this.init();
  }
  ou;

  async init() {
    this.container = document.querySelector(".bogo-bundle-container");
    if (!this.container) {
      console.error(
        "BOGO Bundle container not found. Ensure the Liquid section is rendered."
      );
      return;
    }
    this.container.style.display = "none";

    await this.loadCurrentProduct();

    try {
      await this.loadBundleProducts();
    } catch (error) {
      console.error("Failed to load bundle products:", error);
      this.bundleExists = false;
    }

    if (this.bundleExists) {
      console.log("Bundle exists, populating bundle UI");
      console.log("Bundle type:", this.bundleType);
      console.log("X Products count:", this.xProducts?.length || 0);
      console.log("Y Products count:", this.yProducts?.length || 0);
      this.populateBundleUI();
      this.attachEventListeners();
      this.container.style.display = "";
    } else {
      console.log("No bundle found for this product, hiding UI.");
      this.container.remove();
    }
  }

  async loadCurrentProduct() {
    try {
      const productHandle = window.location.pathname
        .split("/")
        .pop()
        .split("?")[0];
      const response = await fetch(`/products/${productHandle}.js`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.currentProduct = await response.json();
      console.log("Current product loaded:", this.currentProduct);
      this.currentProduct.instanceId = `current-product-${this.currentProduct.id}`;

      if (this.currentProduct && this.currentProduct.variants.length > 0) {
        const defaultVariant =
          this.currentProduct.variants.find((v) => v.available) ||
          this.currentProduct.variants[0];
        this.selectedProducts.set(this.currentProduct.instanceId, {
          id: defaultVariant.id,
          price: parseFloat(defaultVariant.price),
          compare_at_price: defaultVariant.compare_at_price
            ? parseFloat(defaultVariant.compare_at_price)
            : null,
          title: defaultVariant.title,
          available: defaultVariant.available,
          quantity: 1,
        });
        // Cache the handle of the current product
        this.productHandleCache.set(
          String(this.currentProduct.id),
          productHandle
        );
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
      console.log("First bundle structure:", data.bundles?.[0]);

      if (data.bundles && data.bundles.length > 0) {
        this.allBundles = data.bundles;
        this.bundleExists = true;

        let prioritizedBundle = null;
        const currentProductIdString = String(this.currentProduct.id);

        for (const bundle of this.allBundles) {
          let bundleContainsCurrentProduct = false;

          // products could be an array OR an object with x/y arrays (for BOGO)
          if (Array.isArray(bundle.products)) {
            bundleContainsCurrentProduct = bundle.products.some(
              (bp) =>
                String(bp.productId).split("/").pop() === currentProductIdString
            );
          } else if (bundle.products && typeof bundle.products === "object") {
            const xArr = Array.isArray(bundle.products.x)
              ? bundle.products.x
              : [];
            const yArr = Array.isArray(bundle.products.y)
              ? bundle.products.y
              : [];
            bundleContainsCurrentProduct = [...xArr, ...yArr].some(
              (bp) =>
                String(bp.productId).split("/").pop() === currentProductIdString
            );
          } else if (
            Array.isArray(bundle.productsX) ||
            Array.isArray(bundle.productsY)
          ) {
            const xArr = Array.isArray(bundle.productsX)
              ? bundle.productsX
              : [];
            const yArr = Array.isArray(bundle.productsY)
              ? bundle.productsY
              : [];
            bundleContainsCurrentProduct = [...xArr, ...yArr].some(
              (bp) =>
                String(bp.productId).split("/").pop() === currentProductIdString
            );
          }

          if (bundleContainsCurrentProduct) {
            prioritizedBundle = bundle;
            break;
          }
        }

        if (!prioritizedBundle && this.allBundles.length > 0) {
          prioritizedBundle = this.allBundles[0];
          console.warn(
            "Current product not found in any bundle. Falling back to the first bundle from API."
          );
        }

        if (prioritizedBundle) {
          this.bundleType = prioritizedBundle.type
            .toLowerCase()
            .replace(/\s+/g, "_");

          // Handle Buy One Get One special case
          if (prioritizedBundle.type === "Buy One Get One") {
            this.bundleType = "buy_one_get_one";
          }

          this.bundleConfig = {
            title: prioritizedBundle.title || "Special Bundle Offer!",
            discountPercent: prioritizedBundle.discountValue || 10,
            discountType: prioritizedBundle.discountType || "Percentage",
            showTimer:
              prioritizedBundle.widgetAppearance?.isShowCountDownTimer || false,
            multipleProducts: prioritizedBundle.type !== "Volume Discount",
            volumeOffer:
              prioritizedBundle.type === "Volume Discount"
                ? `Buy ${
                    prioritizedBundle.quantityBreaks?.[0]?.quantity || 1
                  }, get ${prioritizedBundle.discountValue || 10}% OFF`
                : null,
            timerEndsAt:
              prioritizedBundle.widgetAppearance?.countDownTimerEndsAt,
            appearance: {
              primaryTextColor:
                prioritizedBundle.widgetAppearance?.primaryTextColor ||
                "#303030",
              secondaryTextColor:
                prioritizedBundle.widgetAppearance?.secondaryTextColor ||
                "#000000",
              primaryBackgroundColor:
                prioritizedBundle.widgetAppearance?.PrimaryBackgroundColor ||
                "#ffffff",
              secondaryBackgroundColor:
                prioritizedBundle.widgetAppearance?.secondaryBackgroundColor ||
                "#f1f2f4",
              borderColor:
                prioritizedBundle.widgetAppearance?.borderColor || "#FFFFFF",
              buttonColor:
                prioritizedBundle.widgetAppearance?.buttonColor || "#222222",
              offerTagBackgroundColor:
                prioritizedBundle.widgetAppearance?.offerTagBackgroundColor ||
                "#C4290E",
              offerTagTextColor:
                prioritizedBundle.widgetAppearance?.offerTagTextColor ||
                "#FFFFFF",
              topMargin: prioritizedBundle.widgetAppearance?.topMargin ?? 20,
              bottomMargin:
                prioritizedBundle.widgetAppearance?.bottomMargin ?? 20,
              cardCornerRadius:
                prioritizedBundle.widgetAppearance?.cardCornerRadius ?? 20,
            },
            quantityBreaks: Array.isArray(prioritizedBundle.quantityBreaks)
              ? prioritizedBundle.quantityBreaks
              : [],
            // Mix & Match specific
            selectedTier: prioritizedBundle.selectedTier || 2,
            tierDiscounts: prioritizedBundle.tierDiscounts || {},
          };

          // Initialize selected quantity break
          if (this.bundleConfig.quantityBreaks.length > 0) {
            const defaultIndex = this.bundleConfig.quantityBreaks.findIndex(
              (qb) => qb.default
            );
            this.selectedQuantityBreakIndex =
              defaultIndex >= 0 ? defaultIndex : 0;
          }

          if (this.bundleType === "buy_one_get_one") {
            await this.collectBuyOneGetOneProducts(prioritizedBundle);
          } else {
            await this.collectProductsForPrioritizedBundle(prioritizedBundle);
            await this.collectAllBundleProducts();
          }

          // Initialize default Mix & Match tiers if missing
          if (this.bundleType === "mix_and_match") {
            const productCount =
              prioritizedBundle.products?.length ||
              this.bundleProducts.length ||
              0;
            if (
              !this.bundleConfig.tierDiscounts ||
              Object.keys(this.bundleConfig.tierDiscounts).length === 0
            ) {
              const tierDiscounts = {};
              for (let i = 2; i <= Math.max(2, productCount); i++) {
                tierDiscounts[i] = 10 + (i - 2) * 5; // 10%, 15%, 20%, ...
              }
              this.bundleConfig.tierDiscounts = tierDiscounts;
            }
            if (!this.bundleConfig.selectedTier) {
              this.bundleConfig.selectedTier = 2;
            }
          }
        } else {
          console.warn(
            "No bundles found from API or no suitable prioritized bundle could be determined."
          );
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
    if (
      this.currentProduct &&
      String(this.currentProduct.id) === shopifyProductId
    ) {
      const handle = window.location.pathname.split("/").pop().split("?")[0];
      this.productHandleCache.set(shopifyProductId, handle);
      return handle;
    }

    // 3. Attempt to fetch using /products.json?ids=ID
    try {
      console.log(
        `Resolving handle for ID ${shopifyProductId} via /products.json`
      );
      const response = await fetch(`/products.json?ids=${shopifyProductId}`);
      if (!response.ok) {
        console.warn(
          `Failed to fetch product list for ID ${shopifyProductId}. Status: ${response.status}`
        );
        return null;
      }
      const data = await response.json();
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        this.productHandleCache.set(shopifyProductId, product.handle);
        console.log(
          `Resolved handle for ID ${shopifyProductId}: ${product.handle}`
        );
        return product.handle;
      }
      console.warn(
        `No product found in /products.json for ID ${shopifyProductId}.`
      );
      return null;
    } catch (error) {
      console.error(
        `Error resolving handle for ID ${shopifyProductId}:`,
        error
      );
      return null;
    }
  }

  async collectProductsForPrioritizedBundle(bundle) {
    const fetchedProductCache = new Map();
    const prioritizedBundleProducts = [];

    console.log("Starting to collect products for prioritized bundle:", bundle);

    for (
      let productIndex = 0;
      productIndex < bundle.products.length;
      productIndex++
    ) {
      const bundleProductItem = bundle.products[productIndex];
      const shopifyProductId = String(bundleProductItem.productId)
        .split("/")
        .pop();
      const quantity = bundleProductItem.quantity || 1;

      let productData;
      // Get the handle first
      const productHandle = await this.resolveProductHandle(shopifyProductId);
      if (!productHandle) {
        console.warn(
          `Could not resolve handle for product ID ${shopifyProductId}. Skipping this bundle product.`
        );
        continue;
      }

      // Now use the resolved handle to fetch product.js
      if (fetchedProductCache.has(shopifyProductId)) {
        productData = fetchedProductCache.get(shopifyProductId);
      } else {
        try {
          console.log(
            `Attempting to fetch product: /products/${productHandle}.js (for ID: ${shopifyProductId})`
          );
          const productResponse = await fetch(`/products/${productHandle}.js`);
          if (!productResponse.ok) {
            console.warn(
              `Failed to fetch product ${productHandle}. Status: ${productResponse.status}. Skipping.`
            );
            continue;
          }
          productData = await productResponse.json();
          fetchedProductCache.set(shopifyProductId, productData);
          console.log(`SUCCESS: Fetched product data for ${productHandle}.`);
        } catch (error) {
          console.error(
            `Error fetching product details for ${shopifyProductId} (handle: ${productHandle}):`,
            error
          );
          continue;
        }
      }

      if (!productData) {
        console.warn(
          `No product data available for ${shopifyProductId}. Skipping.`
        );
        continue;
      }

      const variants = productData.variants.map((variant) => ({
        id: variant.id,
        title: variant.title,
        price: parseFloat(variant.price),
        compare_at_price: variant.compare_at_price
          ? parseFloat(variant.compare_at_price)
          : null,
        available: variant.available,
        options: variant.options,
      }));

      let defaultVariant = null;
      if (bundleProductItem.optionSelections && variants.length > 0) {
        const apiOptionsMap = new Map();
        bundleProductItem.optionSelections.forEach((opt) => {
          if (opt.name && opt.values && opt.values.length > 0) {
            apiOptionsMap.set(
              opt.name.toLowerCase(),
              opt.values[0].toLowerCase()
            );
          }
        });

        defaultVariant = variants.find((variant) => {
          return variant.options.every((variantOptionValue, i) => {
            const optionName = productData.options[i]?.name.toLowerCase();
            if (optionName && apiOptionsMap.has(optionName)) {
              return (
                variantOptionValue.toLowerCase() ===
                apiOptionsMap.get(optionName)
              );
            }
            return true;
          });
        });
      }

      if (!defaultVariant && variants.length > 0) {
        defaultVariant = variants.find((v) => v.available) || variants[0];
      }

      const instanceId = `${productData.id}-prioritized-${
        bundle.id || "0"
      }-${productIndex}`;

      if (defaultVariant) {
        this.selectedProducts.set(instanceId, {
          id: defaultVariant.id,
          price: defaultVariant.price,
          compare_at_price: defaultVariant.compare_at_price,
          title: defaultVariant.title,
          available: defaultVariant.available,
          quantity: quantity,
        });
      } else {
        console.warn(
          `No suitable variant found for product ${productData.title} with provided optionSelections for instance ${instanceId}. Setting as unavailable.`
        );
        this.selectedProducts.set(instanceId, {
          id: null,
          price: 0,
          compare_at_price: null,
          title: "Product Unavailable",
          available: false,
          quantity: quantity,
        });
      }

      prioritizedBundleProducts.push({
        id: productData.id,
        instanceId: instanceId,
        title: bundleProductItem.title || productData.title,
        image: bundleProductItem.media || productData.images[0]?.src || "",
        variants: variants,
        defaultQuantity: quantity,
        options: productData.options,
        bundleIndex: 0,
        bundleTitle:
          bundleProductItem.title || bundle.title || "Prioritized Bundle",
      });
    }
    this.prioritizedBundleProducts = prioritizedBundleProducts;
    console.log(
      "Prioritized bundle products loaded:",
      this.prioritizedBundleProducts
    );
  }

  async collectAllBundleProducts() {
    const uniqueProducts = new Map();
    const fetchedProductCache = new Map();

    console.log(
      "Starting collectAllBundleProducts. All bundles:",
      this.allBundles
    );

    if (!this.allBundles || this.allBundles.length === 0) {
      console.warn(
        "No bundles available in this.allBundles to collect products from."
      );
      this.bundleProducts = [];
      return;
    }

    for (const bundle of this.allBundles) {
      console.log(
        `Processing bundle (ID: ${bundle.id}, Title: ${bundle.title}) for all products.`
      );
      if (!bundle.products || bundle.products.length === 0) {
        console.warn(`Bundle (ID: ${bundle.id}) has no products. Skipping.`);
        continue;
      }

      for (let idx = 0; idx < bundle.products.length; idx++) {
        const bundleProductItem = bundle.products[idx];
        console.log(`  Processing bundle product item:`, bundleProductItem);

        const shopifyProductId = String(bundleProductItem.productId)
          .split("/")
          .pop();
        const quantity = bundleProductItem.quantity || 1;

        let productData;
        // Get the handle first using the new resolveProductHandle method
        const productHandle = await this.resolveProductHandle(shopifyProductId);
        if (!productHandle) {
          console.warn(
            `  Could not resolve handle for product ID ${shopifyProductId}. Skipping this bundle product.`
          );
          continue;
        }

        // Now use the resolved handle to fetch product.js
        if (fetchedProductCache.has(shopifyProductId)) {
          productData = fetchedProductCache.get(shopifyProductId);
          console.log(`  Product data for ${shopifyProductId} from cache.`);
        } else {
          try {
            console.log(
              `  Attempting to fetch product: /products/${productHandle}.js (for ID: ${shopifyProductId})`
            );
            const productResponse = await fetch(
              `/products/${productHandle}.js`
            );

            if (!productResponse.ok) {
              const errorText = await productResponse.text();
              console.warn(
                `  WARNING: Failed to fetch product ${productHandle} for bundle ${
                  bundle.id
                }. Status: ${
                  productResponse.status
                }. Response: ${errorText.substring(0, 200)}`
              );
              continue;
            }
            productData = await productResponse.json();
            fetchedProductCache.set(shopifyProductId, productData);
            console.log(
              `  SUCCESS: Fetched product data for ${productHandle}.`
            );
          } catch (error) {
            console.error(
              `  ERROR: Error fetching product details for ${shopifyProductId} (Handle: ${productHandle}) in bundle ${bundle.id}:`,
              error
            );
            continue;
          }
        }

        if (!productData) {
          console.warn(
            `  Skipping product as no data was loaded for ${shopifyProductId}.`
          );
          continue;
        }

        // Use a stable, index-based instance id to avoid collisions across bundles
        const instanceId = `${productData.id}-${bundle.id}-idx-${idx}`;

        const variants = productData.variants.map((variant) => ({
          id: variant.id,
          title: variant.title,
          price: parseFloat(variant.price),
          compare_at_price: variant.compare_at_price
            ? parseFloat(variant.compare_at_price)
            : null,
          available: variant.available,
          options: variant.options,
        }));

        let defaultVariant = null;
        if (bundleProductItem.optionSelections && variants.length > 0) {
          const apiOptionsMap = new Map();
          bundleProductItem.optionSelections.forEach((opt) => {
            if (opt.name && opt.values && opt.values.length > 0) {
              apiOptionsMap.set(
                opt.name.toLowerCase(),
                opt.values[0].toLowerCase()
              );
            }
          });

          defaultVariant = variants.find((variant) => {
            return variant.options.every((variantOptionValue, i) => {
              const optionName = productData.options[i]?.name.toLowerCase();
              if (optionName && apiOptionsMap.has(optionName)) {
                return (
                  variantOptionValue.toLowerCase() ===
                  apiOptionsMap.get(optionName)
                );
              }
              return true;
            });
          });
        }
        if (!defaultVariant && variants.length > 0) {
          defaultVariant = variants.find((v) => v.available) || variants[0];
        }

        if (defaultVariant) {
          this.selectedProducts.set(instanceId, {
            id: defaultVariant.id,
            price: defaultVariant.price,
            compare_at_price: defaultVariant.compare_at_price,
            title: defaultVariant.title,
            available: defaultVariant.available,
            quantity: quantity,
          });
        } else {
          console.warn(
            `  WARNING: No suitable variant found for product ${productData.title} (ID: ${productData.id}) in bundle ${bundle.id}. Setting as unavailable in selectedProducts.`
          );
          this.selectedProducts.set(instanceId, {
            id: null,
            price: 0,
            compare_at_price: null,
            title: "Product Unavailable",
            available: false,
            quantity: quantity,
          });
        }

        uniqueProducts.set(instanceId, {
          id: productData.id,
          instanceId: instanceId,
          title: bundleProductItem.title || productData.title,
          image: bundleProductItem.media || productData.images[0]?.src || "",
          variants: variants,
          defaultQuantity: quantity,
          options: productData.options,
          bundleId: bundle.id,
          bundleTitle: bundleProductItem.title || bundle.title,
        });
      }
    }
    this.bundleProducts = Array.from(uniqueProducts.values());
    console.log("All unique bundle products collected:", this.bundleProducts);
  }

  async collectBuyOneGetOneProducts(bundle) {
    console.log("collectBuyOneGetOneProducts-bundle", bundle);
    console.log("Starting to collect Buy One Get One products:", bundle);
    console.log("Bundle products structure:", bundle.products);
    console.log("Bundle productsX:", bundle.productsX);
    console.log("Bundle productsY:", bundle.productsY);

    // Handle X products (products customer buys)
    if (bundle.products && bundle.products.x && bundle.products.x.length > 0) {
      console.log("Found X products in bundle.products.x:", bundle.products.x);
      this.xProducts = await this.collectProductGroup(bundle.products.x, "X");
    } else if (bundle.productsX && bundle.productsX.length > 0) {
      console.log("Found X products in bundle.productsX:", bundle.productsX);
      this.xProducts = await this.collectProductGroup(bundle.productsX, "X");
    }

    // Handle Y products (products customer gets)
    if (bundle.products && bundle.products.y && bundle.products.y.length > 0) {
      console.log("Found Y products in bundle.products.y:", bundle.products.y);
      this.yProducts = await this.collectProductGroup(bundle.products.y, "Y");
    } else if (bundle.productsY && bundle.productsY.length > 0) {
      console.log("Found Y products in bundle.productsY:", bundle.productsY);
      this.yProducts = await this.collectProductGroup(bundle.productsY, "Y");
    }

    console.log("X Products (Buy):", this.xProducts);
    console.log("Y Products (Get):", this.yProducts);

    // Check if we have valid products for Buy One Get One
    if (this.xProducts.length === 0 && this.yProducts.length === 0) {
      console.warn("No valid X or Y products found for Buy One Get One bundle");
      this.bundleExists = false;
    } else {
      console.log("Buy One Get One bundle is valid with products");
    }
  }

  async collectProductGroup(productGroup, groupType) {
    const products = [];

    for (
      let productIndex = 0;
      productIndex < productGroup.length;
      productIndex++
    ) {
      const bundleProductItem = productGroup[productIndex];
      const shopifyProductId = String(bundleProductItem.productId)
        .split("/")
        .pop();
      const quantity = bundleProductItem.quantity || 1;

      console.log(`Processing ${groupType} product:`, bundleProductItem);

      // Check if we already have enhanced product data from the API
      if (bundleProductItem.media && bundleProductItem.title) {
        console.log(
          `Using enhanced product data from API for ${groupType} product ${shopifyProductId}`
        );

        // Create a mock product data structure from the API response
        const productData = {
          id: shopifyProductId,
          title: bundleProductItem.title,
          images: [{ src: bundleProductItem.media }],
          variants: [], // We'll need to fetch variants for proper functionality
          options: [],
        };

        // Still need to fetch variants for proper functionality
        let productHandle;
        try {
          productHandle = await this.resolveProductHandle(shopifyProductId);
          if (productHandle) {
            const productResponse = await fetch(
              `/products/${productHandle}.js`
            );
            if (productResponse.ok) {
              const fullProductData = await productResponse.json();
              productData.variants = fullProductData.variants;
              productData.options = fullProductData.options;
              console.log(
                `Fetched variants for ${groupType} product ${shopifyProductId}`
              );
            }
          }
        } catch (error) {
          console.warn(
            `Could not fetch variants for ${groupType} product ${shopifyProductId}:`,
            error
          );
        }

        const variants = productData.variants.map((variant) => ({
          id: variant.id,
          title: variant.title,
          price: parseFloat(variant.price),
          compare_at_price: variant.compare_at_price
            ? parseFloat(variant.compare_at_price)
            : null,
          available: variant.available,
          options: variant.options,
        }));

        let defaultVariant = null;
        if (bundleProductItem.optionSelections && variants.length > 0) {
          const apiOptionsMap = new Map();
          bundleProductItem.optionSelections.forEach((opt) => {
            if (opt.name && opt.values && opt.values.length > 0) {
              apiOptionsMap.set(
                opt.name.toLowerCase(),
                opt.values[0].toLowerCase()
              );
            }
          });

          defaultVariant = variants.find((variant) => {
            return variant.options.every((variantOptionValue, i) => {
              const optionName = productData.options[i]?.name.toLowerCase();
              if (optionName && apiOptionsMap.has(optionName)) {
                return (
                  variantOptionValue.toLowerCase() ===
                  apiOptionsMap.get(optionName)
                );
              }
              return true;
            });
          });
        }

        if (!defaultVariant && variants.length > 0) {
          defaultVariant = variants.find((v) => v.available) || variants[0];
        }

        const instanceId = `${
          productData.id
        }-${groupType.toLowerCase()}-${productIndex}`;

        if (defaultVariant) {
          if (groupType === "X") {
            this.selectedXProducts.set(instanceId, {
              id: defaultVariant.id,
              price: defaultVariant.price,
              compare_at_price: defaultVariant.compare_at_price,
              title: defaultVariant.title,
              available: defaultVariant.available,
              quantity: quantity,
            });
          } else {
            this.selectedYProducts.set(instanceId, {
              id: defaultVariant.id,
              price: defaultVariant.price,
              compare_at_price: defaultVariant.compare_at_price,
              title: defaultVariant.title,
              available: defaultVariant.available,
              quantity: quantity,
            });
          }
        } else {
          console.warn(
            `No suitable variant found for ${groupType} product ${productData.title} with provided optionSelections for instance ${instanceId}. Setting as unavailable.`
          );
          if (groupType === "X") {
            this.selectedXProducts.set(instanceId, {
              id: null,
              price: 0,
              compare_at_price: null,
              title: "Product Unavailable",
              available: false,
              quantity: quantity,
            });
          } else {
            this.selectedYProducts.set(instanceId, {
              id: null,
              price: 0,
              compare_at_price: null,
              title: "Product Unavailable",
              available: false,
              quantity: quantity,
            });
          }
        }

        products.push({
          id: productData.id,
          instanceId: instanceId,
          title: bundleProductItem.title || productData.title,
          image: bundleProductItem.media || productData.images[0]?.src || "",
          variants: variants,
          defaultQuantity: quantity,
          options: productData.options,
          groupType: groupType,
          bundleTitle: bundleProductItem.title || `${groupType} Products`,
        });

        continue;
      }

      // Fallback to original method if no enhanced data
      console.log(
        `No enhanced data available, fetching product data for ${groupType} product ${shopifyProductId}`
      );

      let productData;
      // Get the handle first
      const productHandle = await this.resolveProductHandle(shopifyProductId);
      if (!productHandle) {
        console.warn(
          `Could not resolve handle for ${groupType} product ID ${shopifyProductId}. Skipping.`
        );
        continue;
      }

      // Now use the resolved handle to fetch product.js
      try {
        console.log(
          `Attempting to fetch ${groupType} product: /products/${productHandle}.js (for ID: ${shopifyProductId})`
        );
        const productResponse = await fetch(`/products/${productHandle}.js`);
        if (!productResponse.ok) {
          console.warn(
            `Failed to fetch ${groupType} product ${productHandle}. Status: ${productResponse.status}. Skipping.`
          );
          continue;
        }
        productData = await productResponse.json();
        console.log(
          `SUCCESS: Fetched ${groupType} product data for ${productHandle}.`
        );
      } catch (error) {
        console.error(
          `Error fetching ${groupType} product details for ${shopifyProductId} (handle: ${productHandle}):`,
          error
        );
        continue;
      }

      if (!productData) {
        console.warn(
          `No product data available for ${groupType} product ${shopifyProductId}. Skipping.`
        );
        continue;
      }

      const variants = productData.variants.map((variant) => ({
        id: variant.id,
        title: variant.title,
        price: parseFloat(variant.price),
        compare_at_price: variant.compare_at_price
          ? parseFloat(variant.compare_at_price)
          : null,
        available: variant.available,
        options: variant.options,
      }));

      let defaultVariant = null;
      if (bundleProductItem.optionSelections && variants.length > 0) {
        const apiOptionsMap = new Map();
        bundleProductItem.optionSelections.forEach((opt) => {
          if (opt.name && opt.values && opt.values.length > 0) {
            apiOptionsMap.set(
              opt.name.toLowerCase(),
              opt.values[0].toLowerCase()
            );
          }
        });

        defaultVariant = variants.find((variant) => {
          return variant.options.every((variantOptionValue, i) => {
            const optionName = productData.options[i]?.name.toLowerCase();
            if (optionName && apiOptionsMap.has(optionName)) {
              return (
                variantOptionValue.toLowerCase() ===
                apiOptionsMap.get(optionName)
              );
            }
            return true;
          });
        });
      }

      if (!defaultVariant && variants.length > 0) {
        defaultVariant = variants.find((v) => v.available) || variants[0];
      }

      const instanceId = `${
        productData.id
      }-${groupType.toLowerCase()}-${productIndex}`;

      if (defaultVariant) {
        if (groupType === "X") {
          this.selectedXProducts.set(instanceId, {
            id: defaultVariant.id,
            price: defaultVariant.price,
            compare_at_price: defaultVariant.compare_at_price,
            title: defaultVariant.title,
            available: defaultVariant.available,
            quantity: quantity,
          });
        } else {
          this.selectedYProducts.set(instanceId, {
            id: defaultVariant.id,
            price: defaultVariant.price,
            compare_at_price: defaultVariant.compare_at_price,
            title: defaultVariant.title,
            available: defaultVariant.available,
            quantity: quantity,
          });
        }
      } else {
        console.warn(
          `No suitable variant found for ${groupType} product ${productData.title} with provided optionSelections for instance ${instanceId}. Setting as unavailable.`
        );
        if (groupType === "X") {
          this.selectedXProducts.set(instanceId, {
            id: null,
            price: 0,
            compare_at_price: null,
            title: "Product Unavailable",
            available: false,
            quantity: quantity,
          });
        } else {
          this.selectedYProducts.set(instanceId, {
            id: null,
            price: 0,
            compare_at_price: null,
            title: "Product Unavailable",
            available: false,
            quantity: quantity,
          });
        }
      }

      products.push({
        id: productData.id,
        instanceId: instanceId,
        title: bundleProductItem.title || productData.title,
        image: bundleProductItem.media || productData.images[0]?.src || "",
        variants: variants,
        defaultQuantity: quantity,
        options: productData.options,
        groupType: groupType,
        bundleTitle:
          bundleProductItem.title || bundle.title || `${groupType} Products`,
      });
    }

    return products;
  }

  // ... (rest of the methods: populateBundleUI, getPlusDividerHtml, getVariantOptionsHtml, getProductHtml,
  //      attachEventListeners, updateSelectedProductOptions, updateDisplayedProductPrice,
  //      updateBundleTotalPrice, formatCurrency, updateTimerDisplay, addBundleToCart, skipOffer)

  // Keep these methods exactly as they were in the last provided full code.
  // I've omitted them here for brevity, but they should be present in your final code.

  populateBundleUI() {
    if (!this.container) return;
    console.log("allBundles", this.allBundles);
    // Apply appearance settings derived from admin UI
    const appearance = this.bundleConfig.appearance || {};
    try {
      if (typeof appearance.topMargin === "number") {
        this.container.style.marginTop = `${appearance.topMargin}px`;
      }
      if (typeof appearance.bottomMargin === "number") {
        this.container.style.marginBottom = `${appearance.bottomMargin}px`;
      }

      const productsWrapper = this.container.querySelector(
        ".bogo-products-container"
      )?.parentElement;
      if (productsWrapper) {
        if (appearance.secondaryBackgroundColor) {
          productsWrapper.style.backgroundColor =
            appearance.secondaryBackgroundColor;
        }
        if (appearance.cardCornerRadius !== undefined) {
          productsWrapper.style.borderRadius = `${parseInt(
            appearance.cardCornerRadius,
            10
          )}px`;
        }
      }

      const totalBar = this.container.querySelector(
        ".bogo-bundle-total-price"
      )?.parentElement;
      if (totalBar) {
        if (appearance.primaryBackgroundColor) {
          totalBar.style.background = appearance.primaryBackgroundColor;
        }
        if (appearance.borderColor) {
          totalBar.style.border = `1px solid ${appearance.borderColor}`;
        }
        if (appearance.cardCornerRadius !== undefined) {
          totalBar.style.borderRadius = `${Math.max(
            0,
            parseInt(appearance.cardCornerRadius, 10) - 5
          )}px`;
        }
      }

      const addToCartButton = this.container.querySelector(".bogo-add-to-cart");
      if (addToCartButton) {
        if (appearance.buttonColor)
          addToCartButton.style.backgroundColor = appearance.buttonColor;
        addToCartButton.style.color = "#ffffff";
        if (appearance.cardCornerRadius !== undefined) {
          addToCartButton.style.borderRadius = `${Math.max(
            0,
            parseInt(appearance.cardCornerRadius, 10) - 5
          )}px`;
        }
      }
      const skipButton = this.container.querySelector(".bogo-skip");
      if (skipButton) {
        if (appearance.secondaryBackgroundColor)
          skipButton.style.backgroundColor =
            appearance.secondaryBackgroundColor;
        if (appearance.primaryTextColor)
          skipButton.style.color = appearance.primaryTextColor;
        if (appearance.borderColor)
          skipButton.style.border = `1px solid ${appearance.borderColor}`;
        if (appearance.cardCornerRadius !== undefined) {
          skipButton.style.borderRadius = `${Math.max(
            0,
            parseInt(appearance.cardCornerRadius, 10) - 5
          )}px`;
        }
      }

      const titleElement = this.container.querySelector(".bogo-bundle-title");
      if (titleElement && appearance.primaryTextColor) {
        titleElement.style.color = appearance.primaryTextColor;
      }

      const timerDisplayElement = this.container.querySelector(
        ".bogo-timer-display"
      );
      if (timerDisplayElement) {
        if (appearance.offerTagBackgroundColor)
          timerDisplayElement.style.background =
            appearance.offerTagBackgroundColor;
        if (appearance.borderColor)
          timerDisplayElement.style.border = `1px solid ${appearance.borderColor}`;
        if (appearance.offerTagTextColor)
          timerDisplayElement.style.color = appearance.offerTagTextColor;
      }
    } catch (e) {
      console.warn("Failed to apply appearance styles:", e);
    }
    const titleElement = this.container.querySelector(".bogo-bundle-title");
    if (titleElement) {
      titleElement.textContent = this.bundleConfig.title;
    }

    const taglineElement = this.container.querySelector(".bogo-bundle-tagline");
    if (taglineElement) {
      const discountText =
        this.bundleConfig.volumeOffer ||
        (this.bundleConfig.discountType === "Percentage"
          ? `save ${this.bundleConfig.discountPercent}%`
          : `save ${this.formatCurrency(this.bundleConfig.discountPercent)}`);
      // taglineElement.textContent = `Bought together and ${discountText}!🔥`;
    }

    const productsContainer = this.container.querySelector(
      ".bogo-products-container"
    );
    if (productsContainer) {
      let allProductsHtml = "";

      if (
        this.bundleType === "volume_discount" &&
        this.bundleConfig.quantityBreaks &&
        this.bundleConfig.quantityBreaks.length > 0
      ) {
        const appearance = this.bundleConfig.appearance || {};
        const productInstance =
          this.prioritizedBundleProducts[0] || this.bundleProducts[0];
        if (productInstance) {
          this.bundleConfig.quantityBreaks.forEach((breakItem, index) => {
            const isSelected = index === this.selectedQuantityBreakIndex;
            allProductsHtml += this.getVolumeBreakProductHtml(
              productInstance,
              productInstance.instanceId,
              breakItem,
              index,
              isSelected,
              appearance
            );
          });
        } else {
          allProductsHtml = `<div>No products available for this volume discount.</div>`;
        }
      } else if (
        this.bundleType === "mix_and_match" &&
        this.bundleProducts.length > 0
      ) {
        const appearance = this.bundleConfig.appearance || {};
        const productCount = this.bundleProducts.length;
        const computedTiers = {};
        for (let i = 2; i <= productCount; i++) {
          const defaultDiscount = 10 + (i - 2) * 5;
          const d =
            this.bundleConfig.tierDiscounts &&
            this.bundleConfig.tierDiscounts[i] != null
              ? this.bundleConfig.tierDiscounts[i]
              : defaultDiscount;
          computedTiers[i] = d;
        }
        // Tier buttons
        allProductsHtml += this.getMixMatchTierButtonsHtml(
          computedTiers,
          this.bundleConfig.selectedTier,
          appearance,
          this.bundleConfig.discountType
        );
        // Selected info
        const selectedDiscount =
          computedTiers[this.bundleConfig.selectedTier] || 0;
        const sublabelSuffix =
          this.bundleConfig.discountType === "Percentage" ? "%" : "";
        allProductsHtml += `
          <div style="font-size: 12px; color: ${
            appearance.secondaryTextColor || "#616161"
          }; margin: 10px 0 12px 0;">
            You have selected ${this.bundleConfig.selectedTier} Products.<br/>
            ${selectedDiscount}${sublabelSuffix} Discount is applied on the selected products.
          </div>
        `;
        // List products
        this.bundleProducts.forEach((productInstance) => {
          allProductsHtml += this.getMixMatchProductHtml(
            productInstance,
            appearance
          );
        });
      } else if (
        this.bundleType === "bundle_discount" &&
        this.bundleProducts.length > 0
      ) {
        const appearance = this.bundleConfig.appearance || {};
        let isFirstProductOverall = true;
        const displayedProductInstanceIds = new Set();
        this.bundleProducts.forEach((productInstance) => {
          if (!displayedProductInstanceIds.has(productInstance.instanceId)) {
            if (!isFirstProductOverall) {
              allProductsHtml += this.getPlusDividerHtml();
            }
            allProductsHtml += this.getBundleDiscountProductHtml(
              productInstance,
              appearance
            );
            displayedProductInstanceIds.add(productInstance.instanceId);
            isFirstProductOverall = false;
          }
        });
      } else if (this.bundleType === "buy_one_get_one") {
        const appearance = this.bundleConfig.appearance || {};
        console.log("getBuyOneGetOneHtml", appearance);
        allProductsHtml += this.getBuyOneGetOneHtml(appearance);
      } else {
        let isFirstProductOverall = true;
        const displayedProductInstanceIds = new Set();
        this.bundleProducts.forEach((productInstance) => {
          if (!displayedProductInstanceIds.has(productInstance.instanceId)) {
            if (!isFirstProductOverall) {
              allProductsHtml += this.getPlusDividerHtml();
            }
            allProductsHtml += this.getProductHtml(
              productInstance,
              productInstance.instanceId
            );
            displayedProductInstanceIds.add(productInstance.instanceId);
            isFirstProductOverall = false;
          }
        });
      }
      productsContainer.innerHTML = allProductsHtml;

      // bind click handlers for volume discount cards
      if (this.bundleType === "volume_discount") {
        productsContainer
          .querySelectorAll("[data-break-index]")
          ?.forEach((el) => {
            el.addEventListener("click", (e) => {
              const idx = parseInt(el.getAttribute("data-break-index"));
              if (!Number.isNaN(idx)) {
                this.selectedQuantityBreakIndex = idx;
                this.populateBundleUI();
              }
            });
          });
      }

      // bind click handlers for mix & match tier buttons
      if (this.bundleType === "mix_and_match") {
        productsContainer.querySelectorAll("[data-tier]")?.forEach((el) => {
          el.addEventListener("click", () => {
            const tier = parseInt(el.getAttribute("data-tier"));
            if (!Number.isNaN(tier)) {
              this.bundleConfig.selectedTier = tier;
              this.populateBundleUI();
            }
          });
        });
      }
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

  getVolumeBreakProductHtml(
    product,
    instanceId,
    breakItem,
    index,
    isSelected,
    appearance
  ) {
    const selectedVariantInfo = this.selectedProducts.get(instanceId);
    const quantity = parseInt(breakItem.quantity, 10) || 1;
    // const unit = selectedVariantInfo ? selectedVariantInfo.price : 0;
    const unit = selectedVariantInfo ? selectedVariantInfo.price / 100 : 0;
    const originalTotal = unit * quantity;
    const originalProductsTotal = unit * quantity * 100;
    let finalTotal = originalTotal;
    if (this.bundleConfig.discountType === "Percentage") {
      const pct = Number(breakItem.discount) || 0;
      // finalTotal = unit * (1 - pct / 100) * quantity;
      // finalTotal = (unit * (1 - pct / 100) * quantity).toFixed(2);
      finalTotal = (unit * (1 - pct / 100) * quantity * 100).toFixed(2);
    } else if (this.bundleConfig.discountType === "Fixed Amount") {
      const discount = Number(breakItem.discount) || 0;
      // const perUnit = Math.max(0, unit - discount);
      // finalTotal = Math.max(0, originalTotal - discount).toFixed(2);
      finalTotal = ((originalTotal - discount) * 100).toFixed(2);
    }

    const corner = Math.max(
      0,
      parseInt(appearance?.cardCornerRadius ?? 20, 10) - 5
    );
    const bg = isSelected ? "#EAEDFB" : "white";
    const borderColor = isSelected
      ? "#5169DD"
      : appearance?.borderColor || "rgba(34, 34, 34, 0.1)";
    const nameText = (breakItem.name || "Buy [quantity], get [discount] OFF")
      .replace("[quantity]", quantity)
      .replace(
        "[discount]",
        this.bundleConfig.discountType === "Percentage"
          ? `${breakItem.discount}%`
          : `${breakItem.discount}`
      );

    const savedPct =
      originalTotal > 0
        ? Math.round(((originalTotal - finalTotal) / originalTotal) * 100)
        : 0;

    return `
      <div data-break-index="${index}" style="
        padding: 15px;
        border-radius: ${corner}px;
        margin-bottom: 15px;
        background-color: ${bg};
        border: 1px solid ${borderColor};
        cursor: pointer;
        overflow-x: auto;          
        white-space: nowrap;       
        max-width: 100%;          
        -webkit-overflow-scrolling: touch; 
        ">
        <div style="display:flex; align-items:center;  min-width: 445px;">
          <div style="flex:1;">
           <p style="margin:8px 0 0 0; font-size:13px; font-weight:600; color:${
             appearance?.secondaryTextColor || "#303030"
           };">${nameText}</p>
            <div style="display:flex; align-items:center; gap:8px;">
              <p style="font-weight:600; font-size:14px; margin:0; color:${
                appearance?.primaryTextColor || "#303030"
              };">Rs.${this.formatCurrency(finalTotal)}</p>
              ${
                finalTotal !== originalProductsTotal
                  ? `
                <p style="width:1.5px; height:10px; background:${
                  appearance?.primaryTextColor || "#222"
                }; opacity:0.3; margin:0;"></p>
                <p style="color:${
                  appearance?.secondaryTextColor || "#616161"
                }; font-size:12px; text-decoration: line-through; margin:0;">Rs. ${this.formatCurrency(
                      originalProductsTotal
                    )}</p>
              `
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Mix & Match: Tier buttons
  getMixMatchTierButtonsHtml(tiers, selectedTier, appearance, discountType) {
    const entries = Object.entries(tiers);
    if (entries.length === 0) return "";
    const buttons = entries
      .map(([tierKey, discount]) => {
        const isSelected = parseInt(tierKey) === parseInt(selectedTier);
        const bg = isSelected ? "#5169DD" : "#ffffff";
        const col = isSelected ? "#ffffff" : "#222222";
        const subCol = isSelected
          ? "#ffffff"
          : appearance?.secondaryTextColor || "#616161";
        const suffix = discountType === "Percentage" ? "%" : "";
        return `
        <button data-tier="${tierKey}" style="
          width: 135px; min-width: 135px; height: 60px; padding: 16px 12px; border-radius: 20px; border: none;
          background-color: ${bg}; color: ${col}; font-size: 16px; font-weight: 600; cursor: pointer;
          text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display:flex; align-items:center; justify-content:center; gap:12px;">
          <div style="width:20px; height:20px; border-radius:25%; background-color:white; color:black; display:flex; align-items:center; justify-content:center; ${
            isSelected ? "" : "border:1px solid #222222;"
          }">
            ${
              isSelected
                ? `
              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#5169DD\" stroke-width=\"3\"> 
                <path d=\"M5 12l5 5L20 7\" />
              </svg>
            `
                : ""
            }
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-start;">
            <div style="font-weight:bold; font-size:16px;">BUY ${tierKey}</div>
            <div style="font-size:12px; color:${subCol};">Get ${discount}${suffix} OFF</div>
          </div>
        </button>
      `;
      })
      .join("");
    return `
      <div style="display:flex; gap:8px; margin-bottom: 12px; overflow-x:auto; padding-bottom: 4px;">${buttons}</div>
    `;
  }

  // Mix & Match: Single product card
  getMixMatchProductHtml(product, appearance) {
    const selectedVariantInfo = this.selectedProducts.get(product.instanceId);
    const unit = selectedVariantInfo ? selectedVariantInfo.price : 0;
    const tierDiscount =
      this.bundleConfig.tierDiscounts?.[this.bundleConfig.selectedTier] || 0;
    let finalUnit = unit;
    if (this.bundleConfig.discountType === "Percentage") {
      finalUnit = unit * (1 - tierDiscount / 100);
    } else if (this.bundleConfig.discountType === "Fixed Amount") {
      const perUnitDiscount =
        (parseFloat(this.bundleConfig.discountPercent) || 0) /
        Math.max(1, this.bundleConfig.selectedTier);
      finalUnit = Math.max(0, unit - perUnitDiscount);
    }
    const original = this.formatCurrency(unit);
    const final = this.formatCurrency(finalUnit);
    const showCompare = finalUnit !== unit;
    return `
      <div style="padding: 15px; border-radius: ${Math.max(
        0,
        parseInt(appearance?.cardCornerRadius ?? 20, 10) - 5
      )}px; margin-bottom: 15px; background-color: ${
      appearance?.primaryBackgroundColor || "#ffffff"
    }; border: 1px solid ${appearance?.borderColor || "#e5e5e5"}; 
    overflow-x: auto;          
    white-space: nowrap;       
    max-width: 100%;           
    -webkit-overflow-scrolling: touch; ">
        <div style="display:flex; align-items:center; min-width: 445px;">
          <img src="${
            product.image || product.images
          }" width="100" height="100" alt="${
      product.title
    } Image" style="border-radius: 10px; margin-right: 15px; border: 1px solid ${
      appearance?.borderColor || "#e5e5e5"
    };" />
          <div style="flex:1;">
            <p style="font-weight:600; font-size:14px; margin:0 0 5px 0; color:${
              appearance?.primaryTextColor || "#303030"
            };">${product.title}</p>
            <div style="display:flex; align-items:center; gap:8px;">
              <p style="font-weight:600; font-size:14px; margin:0; color:${
                appearance?.primaryTextColor || "#303030"
              };">Rs.${final}</p>
              ${
                showCompare
                  ? `
                <p style="width:1.5px; height:10px; background:${
                  appearance?.primaryTextColor || "#222"
                }; opacity:0.3; margin:0;"></p>
                <p style="color:${
                  appearance?.secondaryTextColor || "#616161"
                }; font-size:12px; text-decoration: line-through; margin:0;">Rs.${original}</p>
              `
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Bundle Discount: Single product card mirrors admin preview
  getBundleDiscountProductHtml(product, appearance) {
    const selectedVariantInfo = this.selectedProducts.get(product.instanceId);
    const unit = selectedVariantInfo ? selectedVariantInfo.price : 0;
    const original = this.formatCurrency(unit);
    let finalUnit = unit;
    if (this.bundleConfig.discountType === "Percentage") {
      finalUnit =
        unit * (1 - (parseFloat(this.bundleConfig.discountPercent) || 0) / 100);
    } else if (this.bundleConfig.discountType === "Fixed Amount") {
      finalUnit = Math.max(
        0,
        unit - (parseFloat(this.bundleConfig.discountPercent) || 0)
      );
    }
    const final = this.formatCurrency(finalUnit);
    const showCompare = finalUnit !== unit;
    return `
      <div style="padding: 15px; border-radius: ${Math.max(
        0,
        parseInt(appearance?.cardCornerRadius ?? 20, 10) - 5
      )}px; margin-bottom: 15px; background-color: ${
      appearance?.primaryBackgroundColor || "#ffffff"
    }; border: 1px solid ${appearance?.borderColor || "#e5e5e5"};">
        <div style="display:flex; align-items:center;">
          <img src="${
            product.image || product.images
          }" width="100" height="100" alt="${
      product.title
    } Image" style="border-radius: 10px; margin-right: 15px; border: 1px solid ${
      appearance?.borderColor || "#e5e5e5"
    };" />
          <div style="flex:1;">
            <p style="font-weight:600; font-size:14px; margin:0 0 5px 0; color:${
              appearance?.primaryTextColor || "#303030"
            };">${product.title}</p>
            <div style="display:flex; align-items:center; gap:8px;">
              <p style="font-weight:600; font-size:14px; margin:0; color:${
                appearance?.primaryTextColor || "#303030"
              };">Rs.${final}</p>
              ${
                showCompare
                  ? `
                <p style=\"width:1.5px; height:10px; background:${
                  appearance?.primaryTextColor || "#222"
                }; opacity:0.3; margin:0;\"></p>
                <p style=\"color:${
                  appearance?.secondaryTextColor || "#616161"
                }; font-size:12px; text-decoration: line-through; margin:0;\">Rs.${original}</p>
              `
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getBuyOneGetOneHtml(appearance) {
    console.log("Rendering Buy One Get One HTML");
    const xArr = Array.isArray(this.xProducts) ? this.xProducts : [];
    const yArr = Array.isArray(this.yProducts) ? this.yProducts : [];
    console.log("X Products:", xArr);
    console.log("Y Products:", yArr);
    console.log("Bundle config:", this.bundleConfig);

    let html = "";

    // X Products Section (Buy)
    if (xArr.length > 0) {
      html += `
        <div style="margin-bottom: 20px;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
      `;

      xArr.forEach((product, index) => {
        if (!product) return;
        html += this.getBuyOneGetOneProductHtml(product, "X", appearance);
        if (index < xArr.length - 1) {
          html += `<div style=\"height:6px\"></div>`;
        }
      });

      html += `
          </div>
        </div>
      `;
    }

    // Y Products Section (Get)
    if (yArr.length > 0) {
      const label =
        this.bundleConfig.discountType === "Percentage"
          ? `YOU GET ${this.bundleConfig.discountPercent || 0}% OFF ON`
          : this.bundleConfig.discountType === "Free Gift"
          ? "YOU WILL GET FREE GIFT ON"
          : `YOU GET Rs.${this.bundleConfig.discountPercent || 0} OFF ON`;
      html += `
        <div style=\"margin-bottom: 20px;\">
          <div style=\"
            background-color: rgb(81, 105, 221);
            padding: 5px;
            border-radius: 20px;\">
            <p style=\"
              font-weight: 700;
              font-size: 14px;
              color: white;
              text-align: center;
              padding: 5px 0px;
              margin: 0;\">${label}</p>
      `;
      yArr.forEach((product) => {
        if (!product) return;
        html += this.getBuyOneGetOneProductHtml(product, "Y", appearance);
      });
      html += `</div></div>`;
    }

    console.log("Generated Buy One Get One HTML:", html);
    return html;
  }

  getBuyOneGetOneProductHtml(product, groupType, appearance) {
    const selectedVariantInfo =
      groupType === "X"
        ? this.selectedXProducts.get(product.instanceId)
        : this.selectedYProducts.get(product.instanceId);

    if (!selectedVariantInfo) {
      return `<div>Product details unavailable for ${product.title}</div>`;
    }

    const originalPrice = this.formatCurrency(
      selectedVariantInfo.compare_at_price || selectedVariantInfo.price
    );
    const displayedPrice = this.formatCurrency(selectedVariantInfo.price);

    // For Y products, apply discount
    let finalPrice = displayedPrice;
    let showDiscount = false;
    if (groupType === "Y") {
      if (this.bundleConfig.discountType === "Percentage") {
        const discountAmount =
          selectedVariantInfo.price * (this.bundleConfig.discountPercent / 100);
        finalPrice = this.formatCurrency(
          selectedVariantInfo.price - discountAmount
        );
        showDiscount = true;
      } else if (this.bundleConfig.discountType === "Fixed Amount") {
        const discountAmount =
          parseFloat(this.bundleConfig.discountPercent) || 0;
        finalPrice = this.formatCurrency(
          Math.max(0, selectedVariantInfo.price - discountAmount)
        );
        showDiscount = true;
      }
    }

    const variantSelectorsHtml = this.getVariantOptionsHtml(
      product,
      product.instanceId,
      selectedVariantInfo.id
    );

    const groupIndicator = "";

    return `
      <div class="bogo-single-product" data-instance-id="${
        product.instanceId
      }" data-group-type="${groupType}" style="
        padding: 15px;
        border-radius: ${Math.max(
          0,
          parseInt(appearance?.cardCornerRadius ?? 20, 10) - 5
        )}px;
        margin-bottom: ${groupType === "Y" ? "5px" : "6px"};
        background-color: ${
          groupType === "Y"
            ? "#FFFFFFB2"
            : appearance?.primaryBackgroundColor || "white"
        };
        border: 1px solid ${appearance?.borderColor || "#e5e5e5"};
      ">
        <div style="display: flex; align-items: center;">
          <img src="${
            product.image || product.images
          }" width="100" height="100" alt="${
      product.title
    } Image" style="border-radius: 10px; margin-right: 15px; border: 1px solid ${
      appearance?.borderColor || "#e5e5e5"
    };" />
          <div style="flex-grow: 1;">
            <p style="font-weight: 600; font-size: 14px; margin-bottom: 5px; color: ${
              appearance?.primaryTextColor || "#303030"
            };">
              ${product.title}
            </p>
            <div class="bogo-product-price-display" style="display: flex; align-items: center; gap: 8px;">
              <p style="font-weight: 600; font-size: 14px; margin: 0; color: ${
                appearance?.primaryTextColor || "#303030"
              };">Rs.${finalPrice}</p>
              ${
                showDiscount
                  ? `
                <p style=\"width: 1.5px; height: 10px; background: ${
                  appearance?.primaryTextColor || "#222222"
                }; opacity: 0.3; margin: 0;\"></p>
                <p style=\"color: ${
                  appearance?.secondaryTextColor || "#999"
                }; font-size: 12px; text-decoration: line-through; margin: 0;\">Rs.${originalPrice}</p>
              `
                  : ""
              }
            </div>
          </div>
        </div>
        ${variantSelectorsHtml}
      </div>
    `;
  }

  getVariantOptionsHtml(product, instanceId, selectedVariantId) {
    let optionsHtml = "";

    if (product.options && product.options.length > 0) {
      optionsHtml = product.options
        .map((option, optionIndex) => {
          const currentSelection = this.selectedProducts.get(instanceId)?.id;
          const currentVariantDetails = product.variants.find(
            (v) => v.id === currentSelection
          );
          const currentSelectedOptions = currentVariantDetails
            ? currentVariantDetails.options
            : [];

          const uniqueOptionValues = [
            ...new Set(
              product.variants
                .filter((v) =>
                  currentSelectedOptions.every((val, idx) => {
                    if (idx === optionIndex) return true;
                    return v.options[idx] === currentSelectedOptions[idx];
                  })
                )
                .map((v) => v.options[optionIndex])
            ),
          ];

          const selectedValueForThisOption =
            currentSelectedOptions[optionIndex] || uniqueOptionValues[0];

          // If there's only one unique value, don't render the option
          if (uniqueOptionValues.length === 1) {
            return ""; // Skip rendering this option entirely
          }

          return `
        <div style="margin-top: 10px; position: relative;">
          <label for="option-${instanceId}-${option.name
            .toLowerCase()
            .replace(
              /\s/g,
              "-"
            )}" style="font-size: 12px; margin-bottom: 5px; display: block;">${
            option.name
          }:</label>
          <select
            id="option-${instanceId}-${option.name
            .toLowerCase()
            .replace(/\s/g, "-")}"
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
            ${uniqueOptionValues
              .map(
                (value) => `
              <option value="${value}" ${
                  value === selectedValueForThisOption ? "selected" : ""
                }>
                ${value}
              </option>
            `
              )
              .join("")}
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
        })
        .join("");
    }

    return optionsHtml;
  }

  getProductHtml(product, instanceId, isCurrentProduct = false) {
    const selectedVariantInfo = this.selectedProducts.get(instanceId);

    if (!selectedVariantInfo) {
      console.warn(
        `No selected variant info found for instanceId: ${instanceId}. Product:`,
        product
      );
      return `<div>Product details unavailable for ${product.title}</div>`;
    }

    const originalPrice = this.formatCurrency(
      selectedVariantInfo.compare_at_price || selectedVariantInfo.price
    );
    const displayedPrice = this.formatCurrency(selectedVariantInfo.price);
    const variantSelectorsHtml = this.getVariantOptionsHtml(
      product,
      instanceId,
      selectedVariantInfo.id
    );

    const bundleIndicator =
      !isCurrentProduct && product.bundleTitle
        ? `<div style="font-size: 10px; color: #666; margin-bottom: 3px;">${product.bundleTitle}</div>`
        : "";

    return `
      <div class="bogo-single-product" data-instance-id="${instanceId}" style="
        padding: 15px;
        border-radius: 18px;
        margin-bottom: 15px;
        background-color: white;
        ${isCurrentProduct ? "border: 2px solid #3B82F6;" : ""}">
        ${bundleIndicator}
        <div style="display: flex; align-items: center;">
          <img src="${
            product.image || product.images
          }" width="100" height="100" alt="${
      product.title
    } Image" style="border-radius: 10px; margin-right: 15px;" />
          <div style="flex-grow: 1;">
            <p style="font-weight: 600; font-size: 14px; margin-bottom: 5px;">
              ${product.title}
              ${
                isCurrentProduct
                  ? '<span style="color: #3B82F6; font-size: 12px;"> (Current Product)</span>'
                  : ""
              }
            </p>
            <div class="bogo-product-price-display" style="display: flex; align-items: center; gap: 8px;">
              <p style="font-weight: 600; font-size: 14px; margin: 0;">${displayedPrice}</p>
              ${
                selectedVariantInfo.compare_at_price
                  ? `<p style="width: 1.5px; height: 10px; background: #222222; opacity: 0.1; margin: 0;"></p>
              <p style="color: #999; font-size: 12px; text-decoration: line-through; margin: 0;">${originalPrice}</p>`
                  : ""
              }
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
      addToCartButton.addEventListener(
        "click",
        this.addBundleToCart.bind(this)
      );
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
        this.updateSelectedProductOptions(
          instanceId,
          optionIndex,
          selectedOptionValue
        );
      }
    });
  }

  updateSelectedProductOptions(
    instanceId,
    changedOptionIndex,
    selectedOptionValue
  ) {
    let productDetails = null;
    let isBuyOneGetOne = false;
    let groupType = null;

    if (this.currentProduct && this.currentProduct.instanceId === instanceId) {
      productDetails = this.currentProduct;
    } else if (
      this.prioritizedBundleProducts.some((p) => p.instanceId === instanceId)
    ) {
      productDetails = this.prioritizedBundleProducts.find(
        (p) => p.instanceId === instanceId
      );
    } else if (this.bundleType === "buy_one_get_one") {
      // Handle Buy One Get One products
      const xProduct = this.xProducts.find((p) => p.instanceId === instanceId);
      const yProduct = this.yProducts.find((p) => p.instanceId === instanceId);

      if (xProduct) {
        productDetails = xProduct;
        isBuyOneGetOne = true;
        groupType = "X";
      } else if (yProduct) {
        productDetails = yProduct;
        isBuyOneGetOne = true;
        groupType = "Y";
      }
    } else {
      productDetails = this.bundleProducts.find(
        (p) => p.instanceId === instanceId
      );
    }

    if (!productDetails) {
      console.error(`Product details not found for instanceId: ${instanceId}`);
      return;
    }

    let currentSelectedVariant = this.selectedProducts.get(instanceId);
    let currentOptions = currentSelectedVariant
      ? productDetails.variants.find((v) => v.id === currentSelectedVariant.id)
          ?.options || []
      : [];

    let newOptions = [...currentOptions];
    newOptions[changedOptionIndex] = selectedOptionValue;

    const matchedVariant = productDetails.variants.find((variant) => {
      return variant.options.every((variantOptionValue, index) => {
        return (
          newOptions[index] !== undefined &&
          newOptions[index] === variantOptionValue
        );
      });
    });

    if (matchedVariant) {
      const variantData = {
        id: matchedVariant.id,
        price: parseFloat(matchedVariant.price),
        compare_at_price: matchedVariant.compare_at_price
          ? parseFloat(matchedVariant.compare_at_price)
          : null,
        title: matchedVariant.title,
        available: matchedVariant.available,
        quantity: productDetails.defaultQuantity || 1,
      };

      if (isBuyOneGetOne) {
        if (groupType === "X") {
          this.selectedXProducts.set(instanceId, variantData);
        } else {
          this.selectedYProducts.set(instanceId, variantData);
        }
      } else {
        this.selectedProducts.set(instanceId, variantData);
      }

      console.log(`Instance ${instanceId} variant updated to:`, matchedVariant);
      this.updateDisplayedProductPrice(instanceId);

      const productCard = this.container.querySelector(
        `.bogo-single-product[data-instance-id="${instanceId}"]`
      );
      if (productCard) {
        productCard
          .querySelectorAll(".bogo-product-variant-select")
          .forEach((el) => {
            if (
              el.parentElement &&
              el.parentElement.tagName === "DIV" &&
              el.parentElement.style.position === "relative"
            ) {
              el.parentElement.remove();
            }
          });
        const priceDisplay = productCard.querySelector(
          ".bogo-product-price-display"
        );
        if (priceDisplay) {
          const newSelectorsHtml = this.getVariantOptionsHtml(
            productDetails,
            instanceId,
            matchedVariant.id
          );
          priceDisplay.insertAdjacentHTML("afterend", newSelectorsHtml);
        }
      }
    } else {
      console.warn(
        `No variant found matching new options for instance ${instanceId}:`,
        newOptions
      );
      const errorData = {
        id: null,
        price: 0,
        compare_at_price: null,
        title: "Product Unavailable",
        available: false,
        quantity: productDetails.defaultQuantity || 1,
      };

      if (isBuyOneGetOne) {
        if (groupType === "X") {
          this.selectedXProducts.set(instanceId, errorData);
        } else {
          this.selectedYProducts.set(instanceId, errorData);
        }
      } else {
        this.selectedProducts.set(instanceId, errorData);
      }

      this.updateDisplayedProductPrice(instanceId);
    }

    this.updateBundleTotalPrice();
  }

  updateDisplayedProductPrice(instanceId) {
    const productCard = this.container.querySelector(
      `.bogo-single-product[data-instance-id="${instanceId}"]`
    );
    if (productCard) {
      let selectedVariant = this.selectedProducts.get(instanceId);
      let isBuyOneGetOne = false;
      let groupType = null;

      // Check if it's a Buy One Get One product
      if (this.bundleType === "buy_one_get_one") {
        const xProduct = this.xProducts.find(
          (p) => p.instanceId === instanceId
        );
        const yProduct = this.yProducts.find(
          (p) => p.instanceId === instanceId
        );

        if (xProduct) {
          selectedVariant = this.selectedXProducts.get(instanceId);
          isBuyOneGetOne = true;
          groupType = "X";
        } else if (yProduct) {
          selectedVariant = this.selectedYProducts.get(instanceId);
          isBuyOneGetOne = true;
          groupType = "Y";
        }
      }

      if (selectedVariant) {
        const priceDisplay = productCard.querySelector(
          ".bogo-product-price-display"
        );
        if (priceDisplay) {
          const originalPrice = this.formatCurrency(
            selectedVariant.compare_at_price || selectedVariant.price
          );
          let displayedPrice = this.formatCurrency(selectedVariant.price);
          let showDiscount = false;
          let discountHtml = "";

          // Apply discount for Y products in Buy One Get One
          if (isBuyOneGetOne && groupType === "Y") {
            if (this.bundleConfig.discountType === "Percentage") {
              const discountAmount =
                selectedVariant.price *
                (this.bundleConfig.discountPercent / 100);
              displayedPrice = this.formatCurrency(
                selectedVariant.price - discountAmount
              );
              showDiscount = true;
            } else if (this.bundleConfig.discountType === "Fixed Amount") {
              const discountAmount =
                parseFloat(this.bundleConfig.discountPercent) || 0;
              displayedPrice = this.formatCurrency(
                Math.max(0, selectedVariant.price - discountAmount)
              );
              showDiscount = true;
            }
          }

          if (showDiscount) {
            discountHtml = `
              <p style="width: 1.5px; height: 10px; background: #222222; opacity: 0.3; margin: 0;"></p>
              <p style="color: #999; font-size: 12px; text-decoration: line-through; margin: 0;">Rs.${originalPrice}</p>
              <span style="background: #C4290E; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                ${
                  this.bundleConfig.discountType === "Percentage"
                    ? `${this.bundleConfig.discountPercent}% OFF`
                    : `${this.formatCurrency(
                        this.bundleConfig.discountPercent
                      )} OFF`
                }
              </span>
            `;
          } else if (selectedVariant.compare_at_price) {
            discountHtml = `
              <p style="width: 1.5px; height: 10px; background: #222222; opacity: 0.1; margin: 0;"></p>
              <p style="color: #999; font-size: 12px; text-decoration: line-through; margin: 0;">Rs.${originalPrice}</p>
            `;
          }

          priceDisplay.innerHTML = `
            <p style="font-weight: 600; font-size: 14px; margin: 0;">Rs.${displayedPrice}</p>
            ${discountHtml}
          `;
        }
      }
    }
  }

  updateBundleTotalPrice() {
    // Special handling for Volume Discount
    if (
      this.bundleType === "volume_discount" &&
      this.bundleConfig.quantityBreaks?.length
    ) {
      const productInstance =
        this.prioritizedBundleProducts[0] || this.bundleProducts[0];
      const selectedVariant = productInstance
        ? this.selectedProducts.get(productInstance.instanceId)
        : null;
      const breakItem =
        this.bundleConfig.quantityBreaks[this.selectedQuantityBreakIndex];
      const appearance = this.bundleConfig.appearance || {};
      const quantity = parseInt(breakItem?.quantity, 10) || 1;
      const unitPrice = selectedVariant?.price || 0;
      const originalTotal = unitPrice * quantity;
      let finalTotal = originalTotal;
      if (breakItem) {
        if (this.bundleConfig.discountType === "Percentage") {
          const pct = parseFloat(breakItem.discount) || 0;
          finalTotal = unitPrice * (1 - pct / 100) * quantity;
        } else if (this.bundleConfig.discountType === "Fixed Amount") {
          const discount = parseFloat(breakItem.discount) || 0;
          const perUnit = Math.max(0, unitPrice - discount);
          finalTotal = perUnit * quantity;
        }
      }

      const saved = Math.max(0, originalTotal - finalTotal);
      const discountPercentage =
        originalTotal > 0 ? Math.round((saved / originalTotal) * 100) : 0;

      const totalBar = this.container.querySelector(
        ".bogo-bundle-total-price"
      )?.parentElement;
      const totalElement = this.container.querySelector(
        ".bogo-bundle-total-price"
      );
      if (totalBar) {
        // Ensure a left column that holds the Total label and Save line
        const leftWrapperClass = "bogo-total-left";
        let leftWrapper = totalBar.querySelector(`.${leftWrapperClass}`);
        if (!leftWrapper) {
          leftWrapper = document.createElement("div");
          leftWrapper.className = leftWrapperClass;
          leftWrapper.style.display = "flex";
          leftWrapper.style.flexDirection = "column";
          leftWrapper.style.justifyContent = "center";
          leftWrapper.style.alignItems = "flex-start";
          // Move the original Total label (assumed first <p>) inside leftWrapper
          const firstP = totalBar.querySelector("p");
          if (firstP) {
            totalBar.insertBefore(leftWrapper, firstP);
            leftWrapper.appendChild(firstP);
            firstP.style.margin = "0";
          } else {
            totalBar.prepend(leftWrapper);
          }
        }

        const saveInfoClass = "bogo-save-info";
        let saveInfoEl = leftWrapper.querySelector(`.${saveInfoClass}`);
        if (!saveInfoEl) {
          saveInfoEl = document.createElement("p");
          saveInfoEl.className = saveInfoClass;
          saveInfoEl.style.fontFamily = "Inter";
          saveInfoEl.style.fontStyle = "normal";
          saveInfoEl.style.fontWeight = "500";
          saveInfoEl.style.fontSize = "11px";
          saveInfoEl.style.lineHeight = "100%";
          saveInfoEl.style.margin = "0";
          saveInfoEl.style.color =
            appearance.offerTagBackgroundColor || "#C4290E";
          leftWrapper.appendChild(saveInfoEl);
        }
        if (discountPercentage > 0) {
          saveInfoEl.textContent = `Save ${discountPercentage}% (Rs.${this.formatCurrency(
            saved
          )})`;
          saveInfoEl.style.display = "block";
        } else {
          saveInfoEl.textContent = "";
          saveInfoEl.style.display = "none";
        }

        // Right side price alignment
        if (totalElement) {
          totalElement.style.alignSelf = "center";
          totalElement.style.textAlign = "right";
          totalElement.style.marginLeft = "auto";
          totalElement.style.display = "flex";
          totalElement.style.flexDirection = "column";
          totalElement.style.alignItems = "flex-end";
          totalElement.style.gap = "0";
        }
      }

      if (totalElement) {
        if (discountPercentage > 0) {
          totalElement.innerHTML = `
            <span style="font-weight: 600; font-size: 15px; color: ${
              appearance.primaryTextColor || "#303030"
            }; margin: 0;">Rs.${this.formatCurrency(finalTotal)}</span>
            <span style="font-weight: 500; font-size: 11px; color: ${
              appearance.secondaryTextColor || "#616161"
            }; text-decoration: line-through; margin: 0;">Rs.${this.formatCurrency(
            originalTotal
          )}</span>
          `;
        } else {
          totalElement.textContent = this.formatCurrency(finalTotal);
        }
      }
      return;
    }

    // Mix & Match: compute total from selected tier
    if (this.bundleType === "mix_and_match" && this.bundleProducts.length > 0) {
      const appearance = this.bundleConfig.appearance || {};
      const tierDiscount =
        this.bundleConfig.tierDiscounts?.[this.bundleConfig.selectedTier] || 0;
      let originalTotal = 0;
      let finalTotal = 0;
      this.bundleProducts.forEach((product) => {
        const variantInfo = this.selectedProducts.get(product.instanceId);
        const unit = variantInfo?.price || 0;
        originalTotal += unit;
        if (this.bundleConfig.discountType === "Percentage") {
          finalTotal += unit * (1 - tierDiscount / 100);
        } else if (this.bundleConfig.discountType === "Fixed Amount") {
          const perUnitDiscount =
            (parseFloat(this.bundleConfig.discountPercent) || 0) /
            Math.max(1, this.bundleConfig.selectedTier);
          finalTotal += Math.max(0, unit - perUnitDiscount);
        } else {
          finalTotal += unit;
        }
      });

      const saved = Math.max(0, originalTotal - finalTotal);
      const discountPercentage =
        originalTotal > 0 ? Math.round((saved / originalTotal) * 100) : 0;

      const totalBar = this.container.querySelector(
        ".bogo-bundle-total-price"
      )?.parentElement;
      const totalElement = this.container.querySelector(
        ".bogo-bundle-total-price"
      );
      if (totalBar) {
        // Left column wrapper for Total and Save
        const leftWrapperClass = "bogo-total-left";
        let leftWrapper = totalBar.querySelector(`.${leftWrapperClass}`);
        if (!leftWrapper) {
          leftWrapper = document.createElement("div");
          leftWrapper.className = leftWrapperClass;
          leftWrapper.style.display = "flex";
          leftWrapper.style.flexDirection = "column";
          leftWrapper.style.justifyContent = "center";
          leftWrapper.style.alignItems = "flex-start";
          const firstP = totalBar.querySelector("p");
          if (firstP) {
            totalBar.insertBefore(leftWrapper, firstP);
            leftWrapper.appendChild(firstP);
            firstP.style.margin = "0";
          } else {
            totalBar.prepend(leftWrapper);
          }
        }

        const saveInfoClass = "bogo-save-info";
        let saveInfoEl = leftWrapper.querySelector(`.${saveInfoClass}`);
        if (!saveInfoEl) {
          saveInfoEl = document.createElement("p");
          saveInfoEl.className = saveInfoClass;
          saveInfoEl.style.fontFamily = "Inter";
          saveInfoEl.style.fontStyle = "normal";
          saveInfoEl.style.fontWeight = "500";
          saveInfoEl.style.fontSize = "11px";
          saveInfoEl.style.lineHeight = "100%";
          saveInfoEl.style.margin = "0";
          saveInfoEl.style.color =
            appearance.offerTagBackgroundColor || "#C4290E";
          leftWrapper.appendChild(saveInfoEl);
        }
        if (discountPercentage > 0) {
          saveInfoEl.textContent = `Save ${discountPercentage}% (Rs.${this.formatCurrency(
            saved
          )})`;
          saveInfoEl.style.display = "block";
        } else {
          saveInfoEl.textContent = "";
          saveInfoEl.style.display = "none";
        }

        if (totalElement) {
          totalElement.style.alignSelf = "center";
          totalElement.style.textAlign = "right";
          totalElement.style.marginLeft = "auto";
          totalElement.style.display = "flex";
          totalElement.style.flexDirection = "column";
          totalElement.style.alignItems = "flex-end";
          totalElement.style.gap = "0";
        }
      }

      if (totalElement) {
        if (discountPercentage > 0) {
          totalElement.innerHTML = `
            <span style="font-weight: 600; font-size: 15px; color: ${
              appearance.primaryTextColor || "#303030"
            }; margin: 0;">Rs.${this.formatCurrency(finalTotal)}</span>
            <span style="font-weight: 500; font-size: 11px; color: ${
              appearance.secondaryTextColor || "#616161"
            }; text-decoration: line-through; margin: 0;">Rs.${this.formatCurrency(
            originalTotal
          )}</span>
          `;
        } else {
          totalElement.textContent = this.formatCurrency(finalTotal);
        }
      }
      return;
    }

    // Buy One Get One: calculate total from X and Y products
    if (this.bundleType === "buy_one_get_one") {
      const appearance = this.bundleConfig.appearance || {};
      let totalXPrice = 0;
      let totalYPrice = 0;
      let totalYDiscountedPrice = 0;

      // Calculate X products total (full price)
      this.selectedXProducts.forEach((variantInfo) => {
        if (variantInfo.id && variantInfo.available) {
          totalXPrice += variantInfo.price * variantInfo.quantity;
        }
      });

      // Calculate Y products total (with discount)
      this.selectedYProducts.forEach((variantInfo) => {
        if (variantInfo.id && variantInfo.available) {
          totalYPrice += variantInfo.price * variantInfo.quantity;

          let discountedPrice = variantInfo.price;
          if (this.bundleConfig.discountType === "Percentage") {
            discountedPrice =
              variantInfo.price * (1 - this.bundleConfig.discountPercent / 100);
          } else if (this.bundleConfig.discountType === "Fixed Amount") {
            discountedPrice = Math.max(
              0,
              variantInfo.price - this.bundleConfig.discountPercent
            );
          }
          totalYDiscountedPrice += discountedPrice * variantInfo.quantity;
        }
      });

      const originalTotal = totalXPrice + totalYPrice;
      const finalTotal = totalXPrice + totalYDiscountedPrice;
      const saved = originalTotal - finalTotal;
      const discountPercentage =
        originalTotal > 0 ? Math.round((saved / originalTotal) * 100) : 0;

      const totalElement = this.container.querySelector(
        ".bogo-bundle-total-price"
      );
      const totalBar = this.container.querySelector(
        ".bogo-bundle-total-price"
      )?.parentElement;

      if (totalElement && totalBar) {
        // Left column wrapper for Total and Save
        const leftWrapperClass = "bogo-total-left";
        let leftWrapper = totalBar.querySelector(`.${leftWrapperClass}`);
        if (!leftWrapper) {
          leftWrapper = document.createElement("div");
          leftWrapper.className = leftWrapperClass;
          leftWrapper.style.display = "flex";
          leftWrapper.style.flexDirection = "column";
          leftWrapper.style.justifyContent = "center";
          leftWrapper.style.alignItems = "flex-start";
          const firstP = totalBar.querySelector("p");
          if (firstP) {
            totalBar.insertBefore(leftWrapper, firstP);
            leftWrapper.appendChild(firstP);
            firstP.style.margin = "0";
          } else {
            totalBar.prepend(leftWrapper);
          }
        }

        const saveInfoClass = "bogo-save-info";
        let saveInfoEl = leftWrapper.querySelector(`.${saveInfoClass}`);
        if (!saveInfoEl) {
          saveInfoEl = document.createElement("p");
          saveInfoEl.className = saveInfoClass;
          saveInfoEl.style.fontFamily = "Inter";
          saveInfoEl.style.fontStyle = "normal";
          saveInfoEl.style.fontWeight = "500";
          saveInfoEl.style.fontSize = "11px";
          saveInfoEl.style.lineHeight = "100%";
          saveInfoEl.style.margin = "0";
          saveInfoEl.style.color =
            appearance.offerTagBackgroundColor || "#C4290E";
          leftWrapper.appendChild(saveInfoEl);
        }

        if (discountPercentage > 0) {
          saveInfoEl.textContent = `Save ${discountPercentage}% (Rs.${this.formatCurrency(
            saved
          )})`;
          saveInfoEl.style.display = "block";
        } else {
          saveInfoEl.textContent = "";
          saveInfoEl.style.display = "none";
        }

        totalElement.style.alignSelf = "center";
        totalElement.style.textAlign = "right";
        totalElement.style.marginLeft = "auto";
        totalElement.style.display = "flex";
        totalElement.style.flexDirection = "column";
        totalElement.style.alignItems = "flex-end";
        totalElement.style.gap = "0";

        if (discountPercentage > 0) {
          totalElement.innerHTML = `
            <span style="font-weight: 600; font-size: 15px; color: ${
              appearance.primaryTextColor || "#303030"
            }; margin: 0;">Rs.${this.formatCurrency(finalTotal)}</span>
            <span style="font-weight: 500; font-size: 11px; color: ${
              appearance.secondaryTextColor || "#616161"
            }; text-decoration: line-through; margin: 0;">Rs.${this.formatCurrency(
            originalTotal
          )}</span>
          `;
        } else {
          totalElement.textContent = this.formatCurrency(finalTotal);
        }
      }
      return;
    }

    // Default: sum all selected products (also used for bundle_discount total bar)
    let totalPrice = 0;
    this.selectedProducts.forEach((variantInfo) => {
      if (variantInfo.id && variantInfo.available) {
        totalPrice += variantInfo.price * variantInfo.quantity;
      }
    });

    let discountedPrice = totalPrice;
    if (this.bundleConfig.discountType === "Percentage") {
      discountedPrice =
        totalPrice * (1 - this.bundleConfig.discountPercent / 100);
    } else if (this.bundleConfig.discountType === "Fixed Amount") {
      discountedPrice = totalPrice - this.bundleConfig.discountPercent;
      if (discountedPrice < 0) discountedPrice = 0;
    }

    const totalElement = this.container.querySelector(
      ".bogo-bundle-total-price"
    );
    const totalBar = this.container.querySelector(
      ".bogo-bundle-total-price"
    )?.parentElement;
    if (this.bundleType === "bundle_discount" && totalElement && totalBar) {
      const appearance = this.bundleConfig.appearance || {};
      const saved = Math.max(0, totalPrice - discountedPrice);
      const discountPercentage =
        totalPrice > 0 ? Math.round((saved / totalPrice) * 100) : 0;

      const leftWrapperClass = "bogo-total-left";
      let leftWrapper = totalBar.querySelector(`.${leftWrapperClass}`);
      if (!leftWrapper) {
        leftWrapper = document.createElement("div");
        leftWrapper.className = leftWrapperClass;
        leftWrapper.style.display = "flex";
        leftWrapper.style.flexDirection = "column";
        leftWrapper.style.justifyContent = "center";
        leftWrapper.style.alignItems = "flex-start";
        const firstP = totalBar.querySelector("p");
        if (firstP) {
          totalBar.insertBefore(leftWrapper, firstP);
          firstP.style.margin = "0";
          leftWrapper.appendChild(firstP);
        } else {
          totalBar.prepend(leftWrapper);
        }
      }
      const saveInfoClass = "bogo-save-info";
      let saveInfoEl = leftWrapper.querySelector(`.${saveInfoClass}`);
      if (!saveInfoEl) {
        saveInfoEl = document.createElement("p");
        saveInfoEl.className = saveInfoClass;
        saveInfoEl.style.fontFamily = "Inter";
        saveInfoEl.style.fontStyle = "normal";
        saveInfoEl.style.fontWeight = "500";
        saveInfoEl.style.fontSize = "11px";
        saveInfoEl.style.lineHeight = "100%";
        saveInfoEl.style.margin = "0";
        saveInfoEl.style.color =
          appearance.offerTagBackgroundColor || "#C4290E";
        leftWrapper.appendChild(saveInfoEl);
      }
      if (discountPercentage > 0) {
        saveInfoEl.textContent = `Save ${discountPercentage}% (Rs.${this.formatCurrency(
          saved
        )})`;
        saveInfoEl.style.display = "block";
      } else {
        saveInfoEl.textContent = "";
        saveInfoEl.style.display = "none";
      }

      totalElement.style.alignSelf = "center";
      totalElement.style.textAlign = "right";
      totalElement.style.marginLeft = "auto";
      totalElement.style.display = "flex";
      totalElement.style.flexDirection = "column";
      totalElement.style.alignItems = "flex-end";
      totalElement.style.gap = "0";

      if (discountPercentage > 0) {
        totalElement.innerHTML = `
          <span style="font-weight: 600; font-size: 15px; color: ${
            appearance.primaryTextColor || "#303030"
          }; margin: 0;">Rs.${this.formatCurrency(discountedPrice)}</span>
          <span style="font-weight: 500; font-size: 11px; color: ${
            appearance.secondaryTextColor || "#616161"
          }; text-decoration: line-through; margin: 0;">Rs.${this.formatCurrency(
          totalPrice
        )}</span>
        `;
      } else {
        totalElement.textContent = this.formatCurrency(discountedPrice);
      }
      return;
    }

    if (totalElement) {
      totalElement.textContent = this.formatCurrency(discountedPrice);
    }
  }

  formatCurrency(price) {
    return `${parseFloat(price / 100).toFixed(2)}`;
  }

  updateTimerDisplay() {
    const timerDisplayElement = this.container.querySelector(
      ".bogo-timer-display"
    );
    const timerCountdownElement = this.container.querySelector(
      ".bogo-timer-countdown"
    );

    if (
      !this.bundleConfig.showTimer ||
      !this.bundleConfig.timerEndsAt ||
      !timerDisplayElement ||
      !timerCountdownElement
    ) {
      if (timerDisplayElement) timerDisplayElement.style.display = "none";
      return;
    }

    timerDisplayElement.style.display = "block";
    const appearance = this.bundleConfig.appearance || {};
    if (appearance.offerTagBackgroundColor)
      timerDisplayElement.style.background = appearance.offerTagBackgroundColor;
    if (appearance.borderColor)
      timerDisplayElement.style.border = `1px solid ${appearance.borderColor}`;
    if (appearance.offerTagTextColor)
      timerDisplayElement.style.color = appearance.offerTagTextColor;
    const endTime = new Date(this.bundleConfig.timerEndsAt).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(countdownInterval);
        timerCountdownElement.textContent = "EXPIRED";
        const addToCartButton =
          this.container.querySelector(".bogo-add-to-cart");
        if (addToCartButton) addToCartButton.disabled = true;
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
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

    if (
      this.bundleType === "volume_discount" &&
      this.bundleConfig.quantityBreaks?.length
    ) {
      // const productInstance =
      //   this.prioritizedBundleProducts[0] || this.bundleProducts[0];
      // const selectedVariant = productInstance
      //   ? this.selectedProducts.get(productInstance.instanceId)
      //   : null;
      // const breakItem =
      //   this.bundleConfig.quantityBreaks[this.selectedQuantityBreakIndex];
      // if (selectedVariant?.id && selectedVariant.available && breakItem) {
      //   items.push({
      //     id: selectedVariant.id,
      //     // quantity: parseInt(breakItem.quantity, 10) || 1,
      //     quantity: 1,
      //   });
      // }
      const breakItem =
        this.bundleConfig.quantityBreaks[this.selectedQuantityBreakIndex];

      if (breakItem?.variantId) {
        const variantId = breakItem.variantId.replace(
          "gid://shopify/ProductVariant/",
          ""
        );
        const quantity = 1;

        console.log(
          `Adding Volume Discount variant: ${variantId} | quantity: ${quantity}`
        );

        items.push({
          id: variantId,
          quantity,
        });
      } else {
        console.warn("No valid variant found for selected quantity break.");
        alert("Please select a valid quantity break option.");
        return;
      }
    } else if (this.bundleType === "buy_one_get_one") {
      // Add X products (full price)
      this.selectedXProducts.forEach((variantInfo) => {
        if (variantInfo.id && variantInfo.available) {
          items.push({
            id: variantInfo.id,
            // quantity: variantInfo.quantity || 1,
            quantity: 1,
          });
        }
      });

      // Add Y products (discounted)
      this.selectedYProducts.forEach((variantInfo) => {
        if (variantInfo.id && variantInfo.available) {
          items.push({
            id: variantInfo.id,
            // quantity: variantInfo.quantity || 1,
            quantity: 1,
          });
        }
      });
    } else {
      this.selectedProducts.forEach((variantInfo) => {
        if (variantInfo.id && variantInfo.available) {
          if (this.bundleType === "mix_and_match") {
            if (items.some((item) => item.id === variantInfo.id)) return;
            if (variantInfo.id === this.currentProduct?.variants?.[0]?.id)
              return;
          }
          items.push({
            id: variantInfo.id,
            quantity: 1,
          });
        }
      });
    }
    if (items.length === 0) {
      console.warn("No valid products selected to add to cart.");
      alert("Please select available products to add to cart.");
      return;
    }

    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: items,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "Failed to add items to cart");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Bundle added to cart:", data);
        window.location.href = "/cart";
      })
      .catch((error) => {
        console.error("Error adding bundle to cart:", error);
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
