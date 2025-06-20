class BOGOBundle {
  constructor() {
    this.currentProduct = null;
    this.bundleProducts = [];
    this.selectedProducts = new Map();
    this.bundleType = "bundle_discount";
    this.bundleConfig = {};
    this.bundleExists = false; // Initialize this property
    this.init();
  }

  async init() {
    // await this.loadCurrentProduct();

    try {
      await this.loadBundleProducts();
    } catch (error) {
      console.error("Failed to load bundle products:", error);
      this.bundleExists = false;
    }

    // Only proceed if the current product is part of a bundle
    if (this.bundleExists) {
      console.log("Bundle exists, inserting bundle UI");
      this.findAndInsertBundle();
      this.attachEventListeners();
    } else {
      console.log("No bundle found for this product");
    }
  }

  async loadCurrentProduct() {
    try {
      if (typeof window.ShopifyAnalytics !== "undefined" && window.ShopifyAnalytics.meta) {
        const productId = window.ShopifyAnalytics.meta.product.id;
        const response = await fetch(`/products/${window.location.pathname.split("/").pop()}.js`);
        this.currentProduct = await response.json();
      } else {
        const productHandle = window.location.pathname.split("/").pop();
        const response = await fetch(`/products/${productHandle}.js`);
        this.currentProduct = await response.json();
      }
      console.log("Current product loaded:", this.currentProduct);
    } catch (error) {
      console.error("Error loading current product:", error);
    }
  }

  // async loadBundleProducts() {
  //   try {
  //     const productId = this.currentProduct?.id;
  //     console.log("productId", productId);

  //     if (!productId) {
  //       console.error("No current product ID found");
  //       this.bundleExists = false;
  //       return;
  //     }

  //     const apiUrl = `/apps/bogo-app/api/frontStore/getActiveBundle?product_id=${productId}`;
  //     console.log("Fetching bundles from:", apiUrl);

  //     const response = await fetch(apiUrl);

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error("API Error:", {
  //         status: response.status,
  //         url: response.url,
  //         response: errorText.substring(0, 500),
  //       });
  //       this.bundleExists = false;
  //       return;
  //     }

  //     const data = await response.json();
  //     console.log("Bundle data received:", data);

  //     if (data.bundles && data.bundles.length > 0) {
  //       // Extract product ID from Shopify GID format
  //       const cleanProductId = productId.toString();

  //       // Check if current product is in any of the bundles
  //       const relevantBundles = data.bundles.filter((bundle) => {
  //         return bundle.products.some((p) => {
  //           // Extract ID from GID format (gid://shopify/Product/ID)
  //           const bundleProductId = p.productId.split('/').pop();
  //           return bundleProductId === cleanProductId;
  //         });
  //       });

  //       console.log("Relevant bundles found:", relevantBundles);

  //       if (relevantBundles.length > 0) {
  //         this.bundleExists = true;
  //         const bundle = relevantBundles[0];

  //         // Set bundle type based on API response
  //         this.bundleType = bundle.type.toLowerCase().replace(/\s+/g, '_');
  //         console.log("Bundle type set to:", this.bundleType);

  //         // Configure bundle settings
  //         this.bundleConfig = {
  //           title: bundle.title || "Special Bundle Offer!",
  //           discountPercent: bundle.discountValue || 10,
  //           discountType: bundle.discountType || "Percentage",
  //           showTimer: bundle.widgetAppearance?.isShowCountDownTimer || false,
  //           multipleProducts: bundle.type !== "Volume Discount",
  //           volumeOffer: bundle.type === "Volume Discount"
  //             ? `Buy ${bundle.quantityBreaks?.[0]?.quantity || 1}, get ${bundle.discountValue || 10}% OFF`
  //             : null,
  //         };

  //         // Get other products from the bundle (excluding current product)
  //         const bundleProducts = bundle.products.filter((p) => {
  //           const bundleProductId = p.productId.split('/').pop();
  //           return bundleProductId !== cleanProductId;
  //         });

  //         console.log("Other bundle products:", bundleProducts);

  //         // Fetch details for each bundle product
  //         this.bundleProducts = await Promise.all(
  //           bundleProducts.slice(0, 3).map(async (product) => {
  //             try {
  //               // Extract product ID from GID
  //               const productId = product.productId.split('/').pop();
  //               const productResponse = await fetch(`/products/${productId}.js`);

  //               if (!productResponse.ok) {
  //                 console.warn(`Failed to fetch product ${productId}`);
  //                 return null;
  //               }

  //               const productData = await productResponse.json();
  //               return {
  //                 id: productData.id,
  //                 title: productData.title,
  //                 price: productData.variants[0]?.price || 0,
  //                 compare_at_price: productData.variants[0]?.compare_at_price,
  //                 image: productData.images[0] || product.media || "",
  //                 variant_id: productData.variants[0]?.id,
  //                 available: productData.variants[0]?.available || false,
  //               };
  //             } catch (error) {
  //               console.error(`Error fetching product details for ${product.productId}:`, error);
  //               return null;
  //             }
  //           })
  //         );

  //         // Filter out null products
  //         this.bundleProducts = this.bundleProducts.filter(p => p !== null);
  //         console.log("Bundle products loaded:", this.bundleProducts);
  //       } else {
  //         this.bundleExists = false;
  //         console.log("Current product not found in any bundles");
  //       }
  //     } else {
  //       this.bundleExists = false;
  //       console.log("No bundles returned from API");
  //     }
  //   } catch (error) {
  //     console.error("Error loading bundle products:", error);
  //     this.bundleExists = false;
  //   }
  // }
  // async loadBundleProducts() {
  //   try {
  //     const productId = this.currentProduct?.id;
  //     console.log("productId", productId);

  //     if (!productId) {
  //       console.error("No current product ID found");
  //       this.bundleExists = false;
  //       return;
  //     }

  //     const apiUrl = `/apps/bogo-app/api/frontStore/getActiveBundle?product_id=${productId}`;
  //     console.log("Fetching bundles from:", apiUrl);

  //     const response = await fetch(apiUrl);

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error("API Error:", {
  //         status: response.status,
  //         url: response.url,
  //         response: errorText.substring(0, 500),
  //       });
  //       this.bundleExists = false;
  //       return;
  //     }

  //     const data = await response.json();
  //     console.log("Bundle data received:", data);

  //     if (data.bundles && data.bundles.length > 0) {
  //       // Extract product ID from Shopify GID format
  //       const cleanProductId = productId.toString();

  //       // Check if current product is in any of the bundles
  //       const relevantBundles = data.bundles.filter((bundle) => {
  //         return bundle.products.some((p) => {
  //           // Extract ID from GID format (gid://shopify/Product/ID)
  //           const bundleProductId = p.productId.split("/").pop();
  //           return true;
  //           // return bundleProductId === cleanProductId;
  //         });
  //       });

  //       console.log("Relevant bundles found:", relevantBundles);

  //       if (relevantBundles.length > 0) {
  //         this.bundleExists = true;
  //         const bundle = relevantBundles[0];

  //         // Set bundle type based on API response
  //         this.bundleType = bundle.type.toLowerCase().replace(/\s+/g, "_");
  //         console.log("Bundle type set to:", this.bundleType);

  //         // Configure bundle settings
  //         this.bundleConfig = {
  //           title: bundle.title || "Special Bundle Offer!",
  //           discountPercent: bundle.discountValue || 10,
  //           discountType: bundle.discountType || "Percentage",
  //           showTimer: bundle.widgetAppearance?.isShowCountDownTimer || false,
  //           multipleProducts: bundle.type !== "Volume Discount",
  //           volumeOffer:
  //             bundle.type === "Volume Discount"
  //               ? `Buy ${bundle.quantityBreaks?.[0]?.quantity || 1}, get ${bundle.discountValue || 10}% OFF`
  //               : null,
  //         };

  //         // Get other products from the bundle (excluding current product)
  //         const bundleProducts = bundle.products.filter((p) => {
  //           const bundleProductId = p.productId.split("/").pop();
  //           return true;
  //           // return bundleProductId !== cleanProductId;
  //         });

  //         console.log("Other bundle products:", bundleProducts);

  //         // Fetch details for ALL bundle products (removed the slice(0, 3) limitation)
  //         this.bundleProducts = await Promise.all(
  //           bundleProducts.map(async (product) => {
  //             try {
  //               // Extract product ID from GID
  //               console.log("productsssssssss", product);
  //               console.log("productsssssssss", product.productId);
  //               const productId = product.productId.split("/").pop();
  //               const productHandele = product.handle;

  //               const productResponse = await fetch(`/products/${productHandele}.js`);

  //               console.log(productResponse, "productResponse");
  //               if (!productResponse.ok) {
  //                 console.warn(`Failed to fetch product ${productId}`);
  //                 return null;
  //               }

  //               const productData = await productResponse.json();
  //               console.log(productData, "productResponse");
  //               return {
  //                 id: productData.id,
  //                 title: productData.title,
  //                 price: productData.variants[0]?.price || 0,
  //                 compare_at_price: productData.variants[0]?.compare_at_price,
  //                 image: productData.images[0] || product.media || "",
  //                 variant_id: productData.variants[0]?.id,
  //                 available: productData.variants[0]?.available || false,
  //               };
  //             } catch (error) {
  //               console.error(`Error fetching product details for ${product.productId}:`, error);
  //               return null;
  //             }
  //           })
  //         );

  //         // Filter out null products
  //         this.bundleProducts = this.bundleProducts.filter((p) => p !== null);
  //         console.log("Bundle products loaded:", this.bundleProducts);
  //       } else {
  //         this.bundleExists = false;
  //         console.log("Current product not found in any bundles");
  //       }
  //     } else {
  //       this.bundleExists = false;
  //       console.log("No bundles returned from API");
  //     }
  //   } catch (error) {
  //     console.error("Error loading bundle products:", error);
  //     this.bundleExists = false;
  //   }
  // }
  async loadBundleProducts() {
    try {
      const productId = this.currentProduct?.id;
      console.log("productId", productId);

      if (!productId) {
        console.error("No current product ID found");
        this.bundleExists = false;
        return;
      }

      const apiUrl = `/apps/bogo-app/api/frontStore/getActiveBundle?product_id=${productId}`;
      console.log("Fetching bundles from:", apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", {
          status: response.status,
          url: response.url,
          response: errorText.substring(0, 500),
        });
        this.bundleExists = false;
        return;
      }

      const data = await response.json();
      console.log("Bundle data received:", data);

      if (data.bundles && data.bundles.length > 0) {
        // Consider all bundles as relevant (ignore current product check)
        const relevantBundles = data.bundles;
        console.log("Relevant bundles found:", relevantBundles);

        if (relevantBundles.length > 0) {
          this.bundleExists = true;
          const bundle = relevantBundles[0];

          // Set bundle type based on API response
          this.bundleType = bundle.type.toLowerCase().replace(/\s+/g, "_");
          console.log("Bundle type set to:", this.bundleType);

          // Configure bundle settings
          this.bundleConfig = {
            title: bundle.title || "Special Bundle Offer!",
            discountPercent: bundle.discountValue || 10,
            discountType: bundle.discountType || "Percentage",
            showTimer: bundle.widgetAppearance?.isShowCountDownTimer || false,
            multipleProducts: bundle.type !== "Volume Discount",
            volumeOffer:
              bundle.type === "Volume Discount"
                ? `Buy ${bundle.quantityBreaks?.[0]?.quantity || 1}, get ${bundle.discountValue || 10}% OFF`
                : null,
          };

          // Use all products from the bundle (no filtering of current product)
          const bundleProducts = bundle.products;
          console.log("Bundle products:", bundleProducts);

          // Fetch details for ALL bundle products
          this.bundleProducts = await Promise.all(
            bundleProducts.map(async (product) => {
              try {
                // Extract product handle from GID or use provided handle
                const productHandle = product.handle || product.productId.split("/").pop();
                const productResponse = await fetch(`/products/${productHandle}.js`);

                console.log(productResponse, "productResponse");
                if (!productResponse.ok) {
                  console.warn(`Failed to fetch product ${productHandle}`);
                  return null;
                }

                const productData = await productResponse.json();
                console.log(productData, "productData");
                return {
                  id: productData.id,
                  title: productData.title,
                  price: productData.variants[0]?.price || 0,
                  compare_at_price: productData.variants[0]?.compare_at_price,
                  image: productData.images[0] || product.media || "",
                  variant_id: productData.variants[0]?.id,
                  available: productData.variants[0]?.available || false,
                };
              } catch (error) {
                console.error(`Error fetching product details for ${product.productId}:`, error);
                return null;
              }
            })
          );

          // Filter out null products
          this.bundleProducts = this.bundleProducts.filter((p) => p !== null);
          console.log("Bundle products loaded:", this.bundleProducts);
        } else {
          this.bundleExists = false;
          console.log("No relevant bundles found");
        }
      } else {
        this.bundleExists = false;
        console.log("No bundles returned from API");
      }
    } catch (error) {
      console.error("Error loading bundle products:", error);
      this.bundleExists = false;
    }
  }
  findAndInsertBundle() {
    // Don't proceed if no bundle exists
    if (!this.bundleExists) {
      console.log("No bundle exists, skipping insertion");
      return;
    }

    // Remove existing bundle containers
    const existingContainers = document.querySelectorAll(".bogo-bundle-container");
    existingContainers.forEach((container) => container.remove());

    const insertionPoint = this.findInsertionPoint();
    console.log("Insertion point found:", insertionPoint);

    if (insertionPoint) {
      const bundleContainer = document.createElement("div");
      bundleContainer.className = "bogo-bundle-container product-info-bundle";
      bundleContainer.innerHTML = this.getHTML();

      insertionPoint.parentNode.insertBefore(bundleContainer, insertionPoint.nextSibling);
      console.log("Bundle UI inserted successfully");
    } else {
      console.error("Could not find insertion point for bundle");
    }
  }

  findInsertionPoint() {
    const selectors = [
      ".product-form",
      ".product__form",
      ".product-form-container",
      ".add-to-cart-form",
      ".product-description",
      ".product__description",
      ".product-single__description",
      ".rte",
      ".product-details",
      ".product__details",
      ".product-info",
      ".product__info",
      ".product-price",
      ".product__price",
      ".price",
      ".product-single",
      ".product__main",
      ".product-content",
      '[data-section-type="product"]',
      ".product",
      "main",
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`Found insertion point with selector: ${selector}`);

        if (selector.includes("form") || selector.includes("cart")) {
          return element;
        }

        const children = Array.from(element.children);
        const lastMeaningfulChild = children
          .reverse()
          .find(
            (child) =>
              child.tagName !== "SCRIPT" &&
              child.tagName !== "STYLE" &&
              !child.classList.contains("bogo-bundle-container")
          );

        return lastMeaningfulChild || element;
      }
    }

    console.log("Using body as fallback insertion point");
    return document.body.lastElementChild;
  }

  formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price / 100);
  }

  calculateDiscount(originalPrice, salePrice) {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  getTotalPrice() {
    let total = 0;
    if (this.bundleType === "volume_discount") {
      return parseFloat(this.currentProduct?.variants[0]?.price || 0);
    }

    // Add current product price
    total += parseFloat(this.currentProduct?.variants[0]?.price || 0);

    // Add selected bundle products
    this.selectedProducts.forEach((product) => {
      total += parseFloat(product.price);
    });

    return total;
  }

  getTotalSavings() {
    if (this.bundleType === "volume_discount") {
      return 1000; // Rs.10 in cents
    }

    const totalPrice = this.getTotalPrice();
    const discountAmount = (totalPrice * this.bundleConfig.discountPercent) / 100;
    return discountAmount;
  }

  getHTML() {
    if (!this.currentProduct) {
      return '<div class="bogo-loading">Loading bundle offers...</div>';
    }

    if (!this.bundleExists) {
      return ""; // Return empty string if no bundle should be shown
    }

    console.log("Generating HTML for bundle type:", this.bundleType);

    switch (this.bundleType) {
      case "bundle_discount":
        return this.getBundleDiscountHTML();
      case "buy_one_get_one":
        return this.getBuyOneGetOneHTML();
      case "volume_discount":
        return this.getVolumeDiscountHTML();
      default:
        return this.getBundleDiscountHTML();
    }
  }

  getBundleDiscountHTML() {
    // Add current product to selected by default
    if (this.currentProduct && !this.selectedProducts.has(this.currentProduct.id)) {
      this.selectedProducts.set(this.currentProduct.id, {
        id: this.currentProduct.id,
        title: this.currentProduct.title,
        price: this.currentProduct.variants[0]?.price || 0,
        compare_at_price: this.currentProduct.variants[0]?.compare_at_price,
        image: this.currentProduct.images[0] || "",
        variant_id: this.currentProduct.variants[0]?.id,
      });
    }

    const totalPrice = this.getTotalPrice();
    const discountAmount = this.getTotalSavings();
    const finalTotal = totalPrice - discountAmount;

    return `
      <div class="bogo-bundle-wrapper bundle-discount-type">
        ${
          this.bundleConfig.showTimer
            ? `
          <div class="bogo-timer">
            <span class="timer-text">⏰ Limited Time Offer!</span>
          </div>`
            : ""
        }

        <div class="bogo-header">
          <h3 class="bundle-title">
            <span class="fire-icon">🔥</span>
            ${this.bundleConfig.title}
          </h3>
        </div>

        <div class="bogo-products">
          ${this.renderCurrentProduct()}
          ${this.bundleProducts.map((product) => this.renderBundleProduct(product)).join("")}
        </div>

        <div class="bogo-summary">
          <div class="total-row">
            <span class="total-label">Total</span>
            <div class="total-pricing">
              <span class="original-total">${this.formatPrice(totalPrice)}</span>
              <span class="final-total">${this.formatPrice(finalTotal)}</span>
            </div>
          </div>
          <div class="savings-row">
            <span class="savings-text">Save ${this.bundleConfig.discountPercent}% (${this.formatPrice(
      discountAmount
    )})</span>
          </div>
        </div>

        <div class="bogo-actions">
          <button class="bogo-add-to-cart">Add Bundle To Cart</button>
          <button class="bogo-skip">Skip Offer</button>
        </div>
      </div>
      ${this.getCSS()}`;
  }

  getBuyOneGetOneHTML() {
    return `
      <div class="bogo-bundle-wrapper bogo-type">
        ${
          this.bundleConfig.showTimer
            ? `
          <div class="bogo-timer">
            <span class="timer-text">⏰ Limited Time Offer!</span>
          </div>`
            : ""
        }

        <div class="bogo-header">
          <h3 class="bundle-title">
            <span class="fire-icon">🔥</span>
            ${this.bundleConfig.title}
          </h3>
        </div>

        <div class="bogo-products">
          ${this.renderCurrentProduct()}
          ${
            this.bundleProducts.length > 0
              ? `
            <div class="add-product-section">
              <button class="add-product-btn">+</button>
            </div>
            ${this.renderBundleProduct(this.bundleProducts[0])}
          `
              : ""
          }
        </div>

        <div class="bogo-summary">
          <div class="total-row">
            <span class="total-label">Total</span>
            <span class="total-price">${this.formatPrice(this.getTotalPrice())}</span>
          </div>
        </div>

        <div class="bogo-actions">
          <button class="bogo-add-to-cart">Add Bundle To Cart</button>
          <button class="bogo-skip">Skip Offer</button>
        </div>
      </div>
      ${this.getCSS()}`;
  }

  getVolumeDiscountHTML() {
    const product = this.currentProduct;
    const price = parseFloat(product.variants[0]?.price || 0);

    return `
      <div class="bogo-bundle-wrapper volume-discount-type">
        <div class="bogo-header">
          <h3 class="bundle-title">${this.bundleConfig.title}</h3>
        </div>

        <div class="volume-product">
          <div class="product-image">
            <img src="${product.images[0] || "/assets/no-image.png"}" alt="${product.title}">
          </div>
          <div class="product-details">
            <h4 class="product-title">${product.title}</h4>
            <div class="product-price">${this.formatPrice(price)}</div>
            <div class="volume-offer">${this.bundleConfig.volumeOffer || "Special Volume Discount!"}</div>
            
            <div class="product-options">
              <div class="size-selector">
                <label>Size</label>
                <select class="size-select">
                  <option>OS</option>
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                </select>
              </div>
              <div class="color-selector">
                <label>Color</label>
                <select class="color-select">
                  <option>white</option>
                  <option>black</option>
                  <option>red</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="bogo-actions">
          <button class="bogo-add-to-cart">Add To Cart</button>
          <button class="bogo-skip">Skip Offer</button>
        </div>
      </div>
      ${this.getCSS()}`;
  }

  renderCurrentProduct() {
    const product = this.currentProduct;
    const price = parseFloat(product.variants[0]?.price || 0);
    const comparePrice = parseFloat(product.variants[0]?.compare_at_price || 0);

    return `
      <div class="bogo-product-card current-product selected">
        <div class="product-image">
          <img src="${product.images[0] || "/assets/no-image.png"}" alt="${product.title}">
        </div>
        <div class="product-details">
          <h4 class="product-title">${product.title}</h4>
          <div class="product-price">
            <span class="current-price">${this.formatPrice(price)}</span>
            ${
              comparePrice > price
                ? `<span class="original-price">${this.formatPrice(comparePrice)}</span>`
                : ""
            }
          </div>
          <div class="product-options">
            <div class="color-selector">
              <label>Color</label>
              <select class="color-select">
                <option>Red</option>
                <option>Blue</option>
                <option>Green</option>
              </select>
            </div>
            <div class="size-selector">
              <label>Size</label>
              <select class="size-select">
                <option>M</option>
                <option>L</option>
                <option>XL</option>
              </select>
            </div>
          </div>
        </div>
      </div>`;
  }

  renderBundleProduct(product) {
    if (!product) return "";

    const price = parseFloat(product.price);

    return `
      <div class="bogo-product-card bundle-product">
        <div class="product-image">
          <img src="${product.image || "/assets/no-image.png"}" alt="${product.title}">
        </div>
        <div class="product-details">
          <h4 class="product-title">${product.title}</h4>
          <div class="product-price">
            <span class="current-price">${this.formatPrice(price)}</span>
          </div>
          <div class="product-options">
            <div class="size-selector">
              <label>Size</label>
              <select class="size-select">
                <option>OS</option>
                <option>S</option>
                <option>M</option>
              </select>
            </div>
            <div class="color-selector">
              <label>Color</label>
              <select class="color-select">
                <option>black</option>
                <option>white</option>
                <option>gray</option>
              </select>
            </div>
          </div>
        </div>
      </div>`;
  }

  attachEventListeners() {
    document.addEventListener("click", (e) => {
      if (e.target.matches(".bogo-add-to-cart")) {
        this.addBundleToCart();
      }

      if (e.target.matches(".bogo-skip")) {
        this.skipOffer();
      }

      if (e.target.matches(".add-product-btn")) {
        e.target.style.display = "none";
        const bundleProduct = e.target.closest(".bogo-products").querySelector(".bundle-product");
        if (bundleProduct) {
          bundleProduct.style.display = "flex";
        }
      }
    });
  }

  async addBundleToCart() {
    try {
      let items = [];

      if (this.bundleType === "volume_discount") {
        items.push({
          id: this.currentProduct.variants[0].id,
          quantity: 1,
        });
      } else {
        // Add current product
        items.push({
          id: this.currentProduct.variants[0].id,
          quantity: 1,
        });

        // Add selected bundle products
        this.selectedProducts.forEach((product) => {
          if (product.id !== this.currentProduct.id) {
            items.push({
              id: product.variant_id,
              quantity: 1,
            });
          }
        });

        // Add all bundle products for now
        this.bundleProducts.forEach((product) => {
          items.push({
            id: product.variant_id,
            quantity: 1,
          });
        });
      }

      console.log("Adding items to cart:", items);

      const response = await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        window.location.href = "/cart";
      } else {
        const errorData = await response.json();
        console.error("Cart error:", errorData);
        throw new Error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding bundle to cart:", error);
      alert("Error adding products to cart. Please try again.");
    }
  }

  skipOffer() {
    const containers = document.querySelectorAll(".bogo-bundle-container");
    containers.forEach((container) => {
      container.style.display = "none";
    });
  }

  getCSS() {
    return `
      <style>
        .bogo-bundle-wrapper {
          max-width: 100%;
          margin: 30px 0;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .product-info-bundle {
          margin-top: 40px;
          padding: 0;
        }

        .product-info-bundle .bogo-bundle-wrapper {
          border: 1px solid #e1e1e1;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .bogo-timer {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
        }

        .bogo-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .bundle-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fire-icon {
          font-size: 20px;
        }

        .bogo-products {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bogo-product-card {
          display: flex;
          gap: 16px;
          padding: 16px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .bogo-product-card.selected {
          border-color: #007bff;
          background: #f8f9ff;
        }

        .product-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-details {
          flex: 1;
        }

        .product-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          line-height: 1.4;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .current-price {
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }

        .original-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }

        .product-options {
          display: flex;
          gap: 16px;
        }

        .color-selector,
        .size-selector {
          flex: 1;
        }

        .color-selector label,
        .size-selector label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .color-select,
        .size-select {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .add-product-section {
          display: flex;
          justify-content: center;
          padding: 20px 0;
        }

        .add-product-btn {
          width: 40px;
          height: 40px;
          background: #333;
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .volume-product {
          padding: 20px;
          display: flex;
          gap: 16px;
          background: #fff;
          border-radius: 8px;
          border: 1px solid #eee;
          margin: 20px;
        }

        .volume-product .product-image {
          width: 100px;
          height: 100px;
        }

        .volume-offer {
          color: #ff6b35;
          font-weight: 600;
          font-size: 14px;
          margin: 4px 0 12px 0;
        }

        .bogo-summary {
          padding: 20px;
          border-top: 1px solid #eee;
          background: #f9f9f9;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .total-label {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .total-pricing {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .original-total {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }

        .final-total {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }

        .total-price {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }

        .savings-row {
          text-align: right;
        }

        .savings-text {
          color: #22c55e;
          font-weight: 600;
          font-size: 14px;
        }

        .bogo-actions {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bogo-add-to-cart {
          background: #333;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .bogo-add-to-cart:hover {
          background: #555;
        }

        .bogo-skip {
          background: none;
          border: none;
          color: #007bff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px;
          text-decoration: underline;
        }

        .bogo-skip:hover {
          color: #0056b3;
        }

        .bogo-loading {
          padding: 40px;
          text-align: center;
          color: #666;
        }
 .bogo-products {
        padding: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        max-height: 500px;
        overflow-y: auto;
      }

      .bogo-product-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .bogo-product-card.selected {
        border-color: #007bff;
        background: #f8f9ff;
      }

      .product-image {
        width: 100%;
        height: 200px;
        border-radius: 8px;
        overflow: hidden;
      }

        @media (max-width: 768px) {
          .bogo-bundle-wrapper {
            margin: 10px;
            border-radius: 8px;
          }

          .bogo-product-card,
          .volume-product {
            flex-direction: column;
            text-align: center;
          }

          .product-image {
            width: 100px;
            height: 100px;
            margin: 0 auto;
          }

          .product-options {
            flex-direction: column;
            gap: 8px;
          }
        }
            @media (max-width: 768px) {
        .bogo-products {
          grid-template-columns: 1fr;
        }
        
        .product-image {
          height: 150px;
        }
      }
      </style>`;
  }
}

// Initialize the bundle when DOM is loaded
function initializeBOGOBundle() {
  if (window.location.pathname.includes("/products/")) {
    console.log("Initializing BOGO Bundle on product page");
    new BOGOBundle();
  } else {
    console.log("Not on a product page, skipping BOGO Bundle initialization");
  }
}

// Multiple initialization methods to ensure it runs
document.addEventListener("DOMContentLoaded", initializeBOGOBundle);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeBOGOBundle);
} else {
  setTimeout(initializeBOGOBundle, 500);
}
