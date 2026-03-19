import {
  getCreateBundlesMutation,
  getBundleStatusMutation,
  getBundlePriceUpdateMutation,
  getUpdatedBundleMutation,
  getProductStatusUpdateMutation,
  getProductTagsUpdateMutation,
  GET_COLLECTION,
  CREATE_COLLECTIONV2,
  GET_publications,
} from "../../services/mutations.js";
import shopify from "../../../shopify.js";
import Shop from "../../models/shop.model.js";
import Bundle from "../../models/bundle.model.js";
import activityLogService from "../../services/activityLogService.js";

/**
 * Fetches detailed information for a list of product IDs from Shopify.
 * @param {Object} client - GraphQL client.
 * @param {Object} session - Shopify session.
 * @param {string[]} productIds - Array of product GIDs.
 * @returns {Promise<Object>} - A map of product GID to product details.
 */
async function fetchProductDetailsByIds(client, session, productIds) {
  if (!productIds || productIds.length === 0) {
    return {};
  }
  const query = `
    query getProductDetails($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          title
          options {
            id
            name
            values
          }
          variants(first: 250) {
            nodes {
              id
              title
              price
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }`;
  try {
    const result = await client.request(query, {
      session,
      variables: { ids: productIds },
    });
    const productDetailsMap = {};
    if (result.data && result.data.nodes) {
      result.data.nodes.forEach((product) => {
        if (product && product.id) {
          productDetailsMap[product.id] = product;
        }
      });
    }
    return productDetailsMap;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
}

/**
 * Applies BOGO discount to the total original price of Y components.
 * @param {number} originalTotalYPrice - The sum of original prices of Y components.
 * @param {string} discountType - Type of discount ('Percentage', 'Fixed Amount', 'Free Gift').
 * @param {string} discountValueStr - Discount value as a string.
 * @returns {number} - The discounted price of Y components.
 */
function applyBogoDiscountToYPrice(originalTotalYPrice, discountType, discountValueStr) {
  const discountValue = parseFloat(discountValueStr);
  let discountedYPrice = originalTotalYPrice;

  if (discountType === "Percentage") {
    discountedYPrice = originalTotalYPrice * (1 - discountValue / 100);
  } else if (discountType === "Fixed Amount") {
    // For BOGO, the fixed amount discount applies to the sum of Y products, not per item.
    discountedYPrice = Math.max(0, originalTotalYPrice - discountValue);
  } else if (discountType === "Free Gift") {
    discountedYPrice = 0;
  }
  return parseFloat(discountedYPrice.toFixed(2));
}

/**
 * Helper to find the original variant price based on selected options.
 * @param {Object} productDetail - Detailed product information from fetchedProductDetailsMap.
 * @param {Array} componentSelectedOptions - Array of { optionName: string, optionValue: string } for the current product component.
 * @returns {number} - Price of the original variant, or 0 if not found.
 */
function findOriginalVariantPrice(productDetail, componentSelectedOptions) {
  if (!productDetail || !productDetail.variants || !productDetail.variants.nodes) {
    // If productDetail itself is missing, or variants node, return 0
    return 0;
  }

  // Handle products with no options (they have a default variant)
  if (
    (!productDetail.options || productDetail.options.length === 0) &&
    componentSelectedOptions.length === 0
  ) {
    if (productDetail.variants.nodes.length > 0) {
      return parseFloat(productDetail.variants.nodes[0].price); // Price of the default variant
    }
    return 0; // Should not happen if product has variants
  }

  // Handle products with options
  if (componentSelectedOptions.length === 0 && productDetail.options && productDetail.options.length > 0) {
    // This implies we are trying to find a variant for a product with options, but couldn't parse selected options for it.
    // This shouldn't occur if data from frontend is correct.
    console.warn(
      `findOriginalVariantPrice: Product ${productDetail.id} has options, but no componentSelectedOptions provided.`
    );
    return 0;
  }

  const variant = productDetail.variants.nodes.find((v) => {
    if (!v.selectedOptions || v.selectedOptions.length !== componentSelectedOptions.length) return false;
    return componentSelectedOptions.every((selOptFromTitle) =>
      v.selectedOptions.some(
        (variantOpt) =>
          variantOpt.name === selOptFromTitle.optionName && variantOpt.value === selOptFromTitle.optionValue
      )
    );
  });
  return variant ? parseFloat(variant.price) : 0;
}

/**
 * Calculates variant prices for BOGO bundles using pre-fetched original variant prices.
 * @param {Array} bundleProductVariants - Variants of the created Shopify bundle product.
 * @param {Array} productsX - Original X products from the request.
 * @param {Array} productsY - Original Y products from the request.
 * @param {string} discountType - Type of discount.
 * @param {string} discountValueStr - Discount value.
 * @param {Array} originalVariantPrices - Array of {productId, title, price} for original product variants, passed from frontend.
 * @returns {Array} - Array of variant update objects.
 */
function calculateBogoVariantPrices(
  bundleProductVariants,
  productsX,
  productsY,
  discountType,
  discountValueStr,
  originalVariantPrices
) {
  const variantUpdates = [];

  if (!originalVariantPrices || originalVariantPrices.length === 0) {
    console.error(
      "calculateBogoVariantPrices: originalVariantPrices data is missing or empty. Cannot calculate BOGO prices accurately."
    );
    // Fallback: return variants with their current Shopify prices, no BOGO discount applied.
    return bundleProductVariants.map((bv) => ({
      id: bv.id,
      price: bv.price.toString(),
      compareAtPrice: null, // Or bv.compareAtPrice if it exists
    }));
  }

  // Log the received originalVariantPrices for debugging
  // console.log("calculateBogoVariantPrices: Received originalVariantPrices:", JSON.stringify(originalVariantPrices, null, 2));

  for (const bundleVariant of bundleProductVariants) {
    let sumOriginalPriceX = 0;
    let sumOriginalPriceY = 0;

    const getSumForParts = (partsList, partType) => {
      // partType is 'X' or 'Y' for logging
      let currentSum = 0;
      console.log(
        `getSumForParts: Calculating sum for ${partType} components of bundle variant "${bundleVariant.title}" (ID: ${bundleVariant.id})`
      );

      for (const p of partsList) {
        let originalComponentVariantTitle = "";
        if (p.optionSelections && p.optionSelections.length > 0) {
          // Ensure values[0] exists. If p.optionSelections comes from frontend,
          // it should be structured like [{ name: "Color", values: ["Red"] }, ...]
          originalComponentVariantTitle = p.optionSelections
            .map((sel) => (sel.values && sel.values.length > 0 ? sel.values[0] : ""))
            .join(" / ");
        } else {
          // For products with no options, title might be "Default Title" or empty.
          // The find logic below will try to match these.
          originalComponentVariantTitle = "Default Title"; // Default assumption, will also try empty string
        }

        console.log(`  Component Product ID: ${p.productId}, Title: "${p.title || "N/A"}"`);
        console.log(
          `    Attempting to find price with reconstructed title: "${originalComponentVariantTitle}"`
        );

        let foundPriceEntry = originalVariantPrices.find(
          (ovp) => ovp.productId === p.productId && ovp.title === originalComponentVariantTitle
        );

        // Fallback for no-option products or if the initial title guess was "Default Title" and it failed
        if (!foundPriceEntry && (!p.optionSelections || p.optionSelections.length === 0)) {
          console.log(
            `    Initial lookup failed or product has no options. Trying common default titles for productId ${p.productId}.`
          );
          // Try "Default Title" explicitly if not already tried
          if (originalComponentVariantTitle !== "Default Title") {
            foundPriceEntry = originalVariantPrices.find(
              (ovp) => ovp.productId === p.productId && ovp.title === "Default Title"
            );
            if (foundPriceEntry) console.log(`      Found with "Default Title".`);
          }
          // Try empty string title if still not found
          if (!foundPriceEntry) {
            foundPriceEntry = originalVariantPrices.find(
              (ovp) => ovp.productId === p.productId && ovp.title === ""
            );
            if (foundPriceEntry) console.log(`      Found with empty string title.`);
          }
        }

        if (foundPriceEntry) {
          const priceToAdd = parseFloat(foundPriceEntry.price);
          currentSum += priceToAdd;
          console.log(
            `    Found price entry: ${JSON.stringify(
              foundPriceEntry
            )}. Adding ${priceToAdd} to sum. Current sum for ${partType}: ${currentSum}`
          );
        } else {
          console.warn(
            `    Price entry NOT FOUND in originalVariantPrices for product ${
              p.productId
            } (Component Title: "${
              p.title || "N/A"
            }") with reconstructed title "${originalComponentVariantTitle}".`
          );
          // For deeper debugging, list available titles for this productId from originalVariantPrices:
          const availableTitlesForProduct = originalVariantPrices
            .filter((ovp) => ovp.productId === p.productId)
            .map((ovp) => `"${ovp.title}" (Price: ${ovp.price})`)
            .join(", ");
          console.warn(
            `      Available titles in originalVariantPrices for productId ${p.productId}: [${
              availableTitlesForProduct || "None"
            }]`
          );
          console.warn(`      Component's optionSelections: ${JSON.stringify(p.optionSelections, null, 2)}`);
        }
      }
      console.log(`getSumForParts: Total original sum for ${partType} components: ${currentSum}`);
      return currentSum;
    };

    sumOriginalPriceX = getSumForParts(productsX, "X");
    sumOriginalPriceY = getSumForParts(productsY, "Y");

    const shopifyCalculatedBundleVariantPrice = parseFloat(bundleVariant.price);
    let ourCalculatedTotalOriginalPrice = parseFloat((sumOriginalPriceX + sumOriginalPriceY).toFixed(2));

    // Reconciliation/Scaling
    if (
      Math.abs(shopifyCalculatedBundleVariantPrice - ourCalculatedTotalOriginalPrice) > 0.01 &&
      ourCalculatedTotalOriginalPrice > 0
    ) {
      console.warn(
        `BOGO Price Mismatch for bundle variant ${bundleVariant.id} (Title: "${bundleVariant.title}"). Shopify Price: ${shopifyCalculatedBundleVariantPrice}, Our Calculated Sum: ${ourCalculatedTotalOriginalPrice}. Scaling component prices.`
      );
      const scalingFactor = shopifyCalculatedBundleVariantPrice / ourCalculatedTotalOriginalPrice;
      sumOriginalPriceX = parseFloat((sumOriginalPriceX * scalingFactor).toFixed(2));
      sumOriginalPriceY = parseFloat((sumOriginalPriceY * scalingFactor).toFixed(2));
      // Update our total after scaling for consistency in logs, though not strictly needed for calculation
      ourCalculatedTotalOriginalPrice = parseFloat((sumOriginalPriceX + sumOriginalPriceY).toFixed(2));
      console.warn(
        `Scaled X: ${sumOriginalPriceX}, Scaled Y: ${sumOriginalPriceY}. New Sum: ${ourCalculatedTotalOriginalPrice}`
      );
    } else if (ourCalculatedTotalOriginalPrice === 0 && shopifyCalculatedBundleVariantPrice > 0) {
      console.error(
        `CRITICAL BOGO: Could not determine component prices for bundle variant ${bundleVariant.id} (Title: "${bundleVariant.title}") from originalVariantPrices. Shopify Price: ${shopifyCalculatedBundleVariantPrice}. BOGO discount may be inaccurate.`
      );
      // Fallback: If we can't determine Y part, we can't discount it.
      // Price will remain shopifyCalculatedBundleVariantPrice.
      // Or, if X is also 0, this is very problematic.
      // For now, sumOriginalPriceY remains 0, so discountedYPrice will be 0.
    }

    const discountedPriceY = applyBogoDiscountToYPrice(sumOriginalPriceY, discountType, discountValueStr);
    const newBundleVariantPrice = parseFloat((sumOriginalPriceX + discountedPriceY).toFixed(2));

    variantUpdates.push({
      id: bundleVariant.id,
      price: newBundleVariantPrice.toString(),
      compareAtPrice:
        shopifyCalculatedBundleVariantPrice > newBundleVariantPrice
          ? shopifyCalculatedBundleVariantPrice.toFixed(2).toString()
          : null,
    });
  }
  return variantUpdates;
}

/**
 * Creates a product bundle with optional discounting
 * @param {Object} req - Request object containing bundle details
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response with bundle creation status
 */
async function createProductBundleV2(req, res) {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2024-10", // Ensure this is a valid and supported API version
    });
    let {
      title,
      products, // General products array, may not be used for BOGO if productsX/Y are present
      discountType,
      quantityBreaks, // for Volume Discount
      discountValue,
      status, // boolean: true for ACTIVE, false for DRAFT
      internalName,
      type, // "Bundle Discount", "Volume Discount", "Buy One Get One"
      bundlePriority,
      widgetAppearance,
      startDate,
      endDate,
      // BOGO specific product arrays
      productsX, // [{ productId, title, quantity, optionSelections:[{componentOptionId, name, uniqueName, values}] }]
      productsY, // same structure as productsX
      originalVariantPrices, // Array of {productId, title, price} from frontend
    } = req.body;

    // Consolidate products for bundle creation based on type
    if (type === "Buy One Get One" && productsX && productsY) {
      products = [
        // This 'products' variable is used by createBundle
        ...productsX,
        ...productsY,
      ];
    }
    // If 'products' is still undefined or empty, and it's a type that needs it, handle error
    if (!products || products.length === 0) {
      return res.status(400).json({
        status: false,
        error: "Products data is missing or invalid for the selected bundle type.",
      });
    }

    // 1. Create the bundle
    const bundleId = await createBundle(client, session, title, products, type, quantityBreaks);
    if (!bundleId) {
      return res.status(500).json({
        status: false,
        error: "Failed to create bundle operation",
      });
    }

    // 2. Wait for bundle creation to complete
    const completedOperation = await pollBundleStatus(client, session, bundleId);
    if (!completedOperation || !completedOperation.product) {
      return res.status(500).json({
        status: false,
        error: "Bundle creation failed or timed out",
      });
    }

    const productId = completedOperation.product.id;
    const bundleProductVariants = completedOperation.product.variants.nodes;
    console.log(
      "createProductBundleV2 | bundleProductVariants:",
      JSON.stringify(bundleProductVariants, null, 2)
    );

    // 3. Update prices if discount is provided
    let priceUpdateResult = null;
    let variantUpdates; // To hold the calculated variant prices

    if (discountType && discountValue && type === "Bundle Discount") {
      variantUpdates = calculateVariantPrices(bundleProductVariants, discountType, discountValue);
      priceUpdateResult = await updateVariantPrices(client, session, productId, variantUpdates);
    } else if (discountType && type === "Volume Discount" && quantityBreaks) {
      // Ensure quantityBreaks are present
      variantUpdates = calculateVariantPricesUsingVolumeDiscount(
        bundleProductVariants,
        discountType,
        quantityBreaks
      );
      priceUpdateResult = await updateVariantPrices(client, session, productId, variantUpdates);
    } else if (discountType && discountValue && type === "Buy One Get One" && productsX && productsY) {
      // For BOGO, use the new pricing logic with originalVariantPrices
      variantUpdates = calculateBogoVariantPrices(
        bundleProductVariants,
        productsX,
        productsY,
        discountType,
        discountValue,
        originalVariantPrices
      );
      if (variantUpdates && variantUpdates.length > 0) {
        priceUpdateResult = await updateVariantPrices(client, session, productId, variantUpdates);
      } else {
        console.log("BOGO: No variant updates generated or required, skipping price update.");
      }
    } else {
      console.log("No discount information provided or type mismatch, skipping price update");
    }

    // 4. Update the bundle status (e.g., to ACTIVE or DRAFT)
    // The 'status' variable from req.body should be a boolean (true for ACTIVE, false for DRAFT)
    // The Shopify API expects "ACTIVE" or "DRAFT" string.
    const productStatusString = status ? "ACTIVE" : "DRAFT";
    const statusUpdateResult = await updateProductStatus(client, session, productId, productStatusString);
    // console.log("business tags ::::", type);
    const cleanType = type.replace(/\s+/g, "");
    // console.log("business tags ::::", cleanType);
    let tags = ["busybuddybundles", cleanType];
    const tagsUpdateResult = await updateProductTags(client, session, productId, tags);
    // 5. Get updated product data (optional, for response)
    const updatedProductData = await getUpdatedProductData(client, session, productId);

    // 6. Add bundle to your app's DB
    const shopDomain = res.locals.shopify.session.shop;
    let shopData = await Shop.findOne({ shopDomain }); // Assuming shopDomain is the correct field
    if (!shopData) {
      // Handle case where shop is not found in your DB, perhaps create it or return error
      console.error(`Shop not found in DB: ${shopDomain}`);
      // return res.status(404).json({ status: false, error: "Shop not found in local database." });
    }

    // Structure products for DB storage based on type
    let productsToStoreInDb;
    if (type === "Buy One Get One") {
      productsToStoreInDb = { x: productsX, y: productsY };
    } else {
      productsToStoreInDb = products; // Store the general products array for other types
    }
    console.log("productsToStoreInDb:", JSON.stringify(productsToStoreInDb, null, 2));
    // 🧩 When type is "Volume Discount", attach variant IDs to quantityBreaks
    if (type === "Volume Discount" && Array.isArray(quantityBreaks)) {
      const bundleVariantIds = bundleProductVariants.map((v) => v.id);
      quantityBreaks = quantityBreaks.map((qb, index) => ({
        ...qb,
        variantId: bundleVariantIds[index] || null, // store matching variantId if available
      }));
    }
    let CreateBundle = await Bundle.create({
      title,
      type,
      products: productsToStoreInDb,
      quantityBreaks: type === "Volume Discount" ? quantityBreaks : undefined,
      discountType,
      discountValue,
      internalName,
      priority: bundlePriority,
      status, // Store the string status
      widgetAppearance,
      startDate,
      endDate,
      shopId: shopData ? shopData._id : null, // Handle if shopData is null
      shopifyBundleId: productId, // Store the Shopify product ID of the bundle
      productsX: productsX,
      productsY: productsY,
    });
    // fetch collection if dont exist  then insert
    const clients = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2025-07", // Ensure this is a valid and supported API version
    });
    const resultcollection = await clients.request(GET_COLLECTION, { session });
    if (
      resultcollection?.data?.collections?.nodes &&
      resultcollection?.data?.collections?.nodes?.length == 0
    ) {
      const getpublications = await clients.request(GET_publications, {
        session,
      });
      if (getpublications?.data?.publications?.nodes) {
        let publicationsData = getpublications?.data?.publications?.nodes;
        let publicationId = null;
        for (let Pub of publicationsData) {
          if (Pub.name === "Online Store") {
            publicationId = Pub.id;
            break;
          }
        }
        if (publicationId) {
          const createcollection = await clients.request(CREATE_COLLECTIONV2(publicationId), { session });
        }
      }
    }

    // Log activity for bundle creation
    let widgetType = "bundle";
    let widgetName = "Bundle Discount";
    if (type === "Buy One Get One") {
      widgetType = "bogo";
      widgetName = "BOGO offer";
    } else if (type === "Volume Discount") {
      widgetType = "volume";
      widgetName = "Volume discount";
    }

    await activityLogService.logActivity({
      shopId: session.shop,
      type: "created",
      widget: widgetType,
      title: `New ${widgetName.toLowerCase()} created`,
      meta: title || internalName,
      offerId: CreateBundle._id,
    });

    return res.status(201).json({
      status: true,
      message: "Bundle created successfully.",
      bundleId: CreateBundle._id, // Your app's bundle ID
      shopifyBundleId: productId, // Shopify's bundle product ID
      bundleData: completedOperation, // Raw data from Shopify bundle creation
      priceUpdate: priceUpdateResult
        ? {
            discountType,
            discountValue,
            updatedVariants: updatedProductData?.data?.product?.variants?.nodes || bundleProductVariants,
          }
        : "No price update applied or needed",
      statusUpdate: statusUpdateResult?.data?.productUpdate?.product?.status
        ? { newStatus: statusUpdateResult.data.productUpdate.product.status }
        : "Status update issue or no update applied",
    });
  } catch (error) {
    console.error("Error creating product bundle:", error);
    // Check for GraphQL errors from Shopify response
    if (error.response && error.response.errors) {
      console.error("Shopify GraphQL Errors:", JSON.stringify(error.response.errors, null, 2));
      return res.status(500).json({
        status: false,
        error: "Shopify API error during bundle creation.",
        details: error.response.errors,
      });
    }
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
}

/**
 * Creates a product bundle with optional discounting
 * @param {Object} req - Request object containing bundle details
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response with bundle creation status
 */
async function createMixAndMatchBundle(req, res) {
  try {
    const session = res.locals.shopify.session;
    console.log(" createMixAndMatchBundle | session:", session);
    const client = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2024-10", // Ensure this is a valid and supported API version
    });
    let {
      title,
      products, // General products array, may not be used for BOGO if productsX/Y are present
      discountType,
      quantityBreaks, // for Volume Discount
      discountValue,
      status, // boolean: true for ACTIVE, false for DRAFT
      internalName,
      type, // "Bundle Discount", "Volume Discount", "Buy One Get One"
      bundlePriority,
      widgetAppearance,
      startDate,
      endDate,
      tierDiscounts, // for mix and match
      // BOGO specific product arrays
      productsX, // [{ productId, title, quantity, optionSelections:[{componentOptionId, name, uniqueName, values}] }]
      productsY, // same structure as productsX
      originalVariantPrices, // Array of {productId, title, price} from frontend
    } = req.body;

    /*
        
        mutation mixMatchProductCreate {
    productCreate(
      input: {title: "mix and match", metafields: [
        {key: "bundle_discount_type", namespace: "busy-buddy", value: "percentage", type: "single_line_text_field"}, // type of discount, can be percentage or fixed
        {key: "bundle_discount_value", namespace: "busy-buddy", value: "10,20", type: "single_line_text_field"}, // in value , will be used for percentage discount based on number of products in bundle
        {key: "bundle_discount_products", namespace: "busy-buddy", value: "51011200123156:10.00,51011200123156:20.00", type: "single_line_text_field"}, // productId: productPrice, productId: productPrice
    ], status: ACTIVE, productPublications: {channelHandle: "online_store"}}
    ) {
      product {
        id
        variants(first: 10) {
          nodes {
            id
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }

mutation setPriceForMixAndMatchProduct {
    productVariantsBulkUpdate(
        productId: "gid://shopify/Product/9833549201684"
    variants: [
        {
            id: "gid://shopify/ProductVariant/50396722888980",
            price: "1000"
        }
    ]
    ) {
    product {
            id
        }
    }
}
        */

    // fetch variantIds and price for each variant for products
    const productIds = products.map((p) => p.productId);
    const fetchedProductDetailsMap = await fetchProductDetailsByIds(client, session, productIds);

    // 1. Create the bundle
    const bundleProductCreateMutation = `
            mutation mixMatchProductCreate($input: ProductInput!) {
                productCreate(input: $input) {
                    product {
                        id
                        variants(first: 10) {
                            nodes {
                                id
                            }
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`;
    const bundleInput = {
      title,
      metafields: [
        {
          key: "bundle_discount_type",
          namespace: "busy-buddy",
          value: discountType || "percentage", // Default to percentage if not provided
          type: "single_line_text_field",
        },
        {
          key: "bundle_discount_value",
          namespace: "busy-buddy",
          //   value: discountValue || "10,20", // Default values for example
          value: Object.values(tierDiscounts).join(","),
          type: "single_line_text_field",
        },
        {
          key: "bundle_discount_products",
          namespace: "busy-buddy",
          // get all variant Id and price for products
          value: products
            .map((p) => {
              const productDetail = fetchedProductDetailsMap[p.productId];
              if (!productDetail || !productDetail.variants || productDetail.variants.nodes.length === 0) {
                console.warn(`Product ${p.productId} has no variants or details.`);
                return `${p.productId}:0`; // Default to 0 if no variants found
              }
              const variants = productDetail.variants.nodes;
              return variants
                .map((v) => `${v.id.split("gid://shopify/ProductVariant/")[1]}:${v.price}`)
                .join(","); // Format as "variantId:price"
            })
            .join(","),
          type: "single_line_text_field",
        },
      ],
      status: status ? "ACTIVE" : "DRAFT", // Convert boolean to string
      productPublications: {
        channelHandle: "online_store", // Assuming you want to publish to online store
      },
      tags: ["busybuddybundles", "mixAndMatch"],
    };
    const result = await client.request(bundleProductCreateMutation, {
      session,
      variables: { input: bundleInput },
    });

    console.log("Mix and Match Bundle creation initiated:", JSON.stringify(result, null, 2));

    if (result?.data?.productCreate?.userErrors?.length > 0) {
      console.error("User errors on bundle creation:", result.data.productCreate.userErrors);
      throw new Error(
        `Shopify User Errors: ${result.data.productCreate.userErrors.map((e) => e.message).join(", ")}`
      );
    }

    if (!result?.data?.productCreate?.product?.id) {
      console.error("Failed to get product ID from bundle creation:", result);
      throw new Error("Failed to initiate Mix and Match bundle creation on Shopify.");
    }

    const productId = result.data.productCreate.product.id;
    const bundleProductVariants = result.data.productCreate.product.variants.nodes;
    // console.log("Mix and Match Bundle product variants:", JSON.stringify(bundleProductVariants, null, 2));

    // 2. Update prices and set it to 1000 for default variant of mix and match product
    let priceUpdateResult = null;
    const bundleProductPriceUpdateMutation = `
            mutation setPriceForMixAndMatchProduct($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                    product {
                        id
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`;
    const variantUpdates = bundleProductVariants.map((variant) => ({
      id: variant.id, // This is the variant ID
      price: "1000", // Set to 1000 as per your requirement
    }));
    priceUpdateResult = await client.request(bundleProductPriceUpdateMutation, {
      session,
      variables: {
        productId: productId,
        variants: variantUpdates.map((v) => ({
          id: v.id,
          price: v.price,
        })),
      },
    });
    // console.log("Mix and Match Bundle price update result:", JSON.stringify(priceUpdateResult, null, 2));
    if (priceUpdateResult?.data?.productVariantsBulkUpdate?.userErrors?.length > 0) {
      console.error(
        "User errors on price update:",
        priceUpdateResult.data.productVariantsBulkUpdate.userErrors
      );
      throw new Error(
        `Shopify User Errors: ${priceUpdateResult.data.productVariantsBulkUpdate.userErrors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    if (!priceUpdateResult?.data?.productVariantsBulkUpdate?.product?.id) {
      console.error("Failed to update product price:", priceUpdateResult);
      throw new Error("Failed to update Mix and Match bundle prices on Shopify.");
    }
    const shopDomain = res.locals.shopify.session.shop;
    let shopData = await Shop.findOne({ shopDomain }); // Assuming shopDomain is the correct field
    if (!shopData) {
      // Handle case where shop is not found in your DB, perhaps create it or return error
      console.error(`Shop not found in DB: ${shopDomain}`);
      // return res.status(404).json({ status: false, error: "Shop not found in local database." });
    }
    let CreateBundle = await Bundle.create({
      title,
      type,
      products: products,
      quantityBreaks: type === "Volume Discount" ? quantityBreaks : undefined,
      tierDiscounts: type === "Mix and Match" ? tierDiscounts : undefined,
      discountType,
      discountValue,
      internalName,
      priority: bundlePriority,
      status, // Store the string status
      widgetAppearance,
      startDate,
      endDate,
      shopId: shopData ? shopData._id : null, // Handle if shopData is null
      shopifyBundleId: productId, // Store the Shopify product ID of the bundle
    });

    return res.status(201).json({
      status: true,
      message: "Mix and Match Bundle created successfully.",
      bundleId: productId, // Shopify's bundle product ID
    });
  } catch (error) {
    console.error("Error creating Mix and Match bundle:", error);
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
}
async function updateMixAndMatchBundle(req, res) {
  try {
    const session = res.locals.shopify.session;
    console.log(" createMixAndMatchBundle | session:", session);
    const client = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2024-10", // Ensure this is a valid and supported API version
    });
    const { id } = req.params;
    // Find existing bundle in database
    const existingBundle = await Bundle.findById(id);
    if (!existingBundle) {
      return res.status(404).json({
        status: false,
        error: "Bundle not found in database",
      });
    }
    let {
      title,
      products, // General products array, may not be used for BOGO if productsX/Y are present
      discountType,
      quantityBreaks, // for Volume Discount
      tierDiscounts,
      discountValue,
      status, // boolean: true for ACTIVE, false for DRAFT
      internalName,
      type, // "Bundle Discount", "Volume Discount", "Buy One Get One"
      bundlePriority,
      widgetAppearance,
      startDate,
      endDate,
      // BOGO specific product arrays
      productsX, // [{ productId, title, quantity, optionSelections:[{componentOptionId, name, uniqueName, values}] }]
      productsY, // same structure as productsX
      originalVariantPrices, // Array of {productId, title, price} from frontend
    } = req.body;

    /*
        
        mutation mixMatchProductCreate {
    productCreate(
      input: {title: "mix and match", metafields: [
        {key: "bundle_discount_type", namespace: "busy-buddy", value: "percentage", type: "single_line_text_field"}, // type of discount, can be percentage or fixed
        {key: "bundle_discount_value", namespace: "busy-buddy", value: "10,20", type: "single_line_text_field"}, // in value , will be used for percentage discount based on number of products in bundle
        {key: "bundle_discount_products", namespace: "busy-buddy", value: "51011200123156:10.00,51011200123156:20.00", type: "single_line_text_field"}, // productId: productPrice, productId: productPrice
    ], status: ACTIVE, productPublications: {channelHandle: "online_store"}}
    ) {
      product {
        id
        variants(first: 10) {
          nodes {
            id
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }

mutation setPriceForMixAndMatchProduct {
    productVariantsBulkUpdate(
        productId: "gid://shopify/Product/9833549201684"
    variants: [
        {
            id: "gid://shopify/ProductVariant/50396722888980",
            price: "1000"
        }
    ]
    ) {
    product {
            id
        }
    }
}
        */

    // fetch variantIds and price for each variant for products
    const productIds = products.map((p) => p.productId);
    const fetchedProductDetailsMap = await fetchProductDetailsByIds(client, session, productIds);

    // 1. Update the bundle
    const bundleProductUpdateMutation = `
            mutation mixMatchProductUpdate($input: ProductInput!) {
                productUpdate(input: $input) {
                    product {
                        id
                        variants(first: 10) {
                            nodes {
                                id
                            }
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`;
    const bundleInput = {
      id: existingBundle.shopifyBundleId,
      title,
      metafields: [
        {
          key: "bundle_discount_type",
          namespace: "busy-buddy",
          value: discountType || "percentage", // Default to percentage if not provided
          type: "single_line_text_field",
        },
        {
          key: "bundle_discount_value",
          namespace: "busy-buddy",
          //   value: discountValue || "10,20", // Default values for example
          value: Object.values(tierDiscounts).join(","),
          type: "single_line_text_field",
        },
        {
          key: "bundle_discount_products",
          namespace: "busy-buddy",
          // get all variant Id and price for products
          value: products
            .map((p) => {
              const productDetail = fetchedProductDetailsMap[p.productId];
              if (!productDetail || !productDetail.variants || productDetail.variants.nodes.length === 0) {
                console.warn(`Product ${p.productId} has no variants or details.`);
                return `${p.productId}:0`; // Default to 0 if no variants found
              }
              const variants = productDetail.variants.nodes;
              return variants
                .map((v) => `${v.id.split("gid://shopify/ProductVariant/")[1]}:${v.price}`)
                .join(","); // Format as "variantId:price"
            })
            .join(","),
          type: "single_line_text_field",
        },
      ],
      status: status ? "ACTIVE" : "DRAFT", // Convert boolean to string
      productPublications: {
        channelHandle: "online_store", // Assuming you want to publish to online store
      },
      tags: ["busybuddybundles", "mixAndMatch"],
    };
    const result = await client.request(bundleProductUpdateMutation, {
      session,
      variables: { input: bundleInput },
    });

    console.log("Mix and Match Bundle creation initiated:", JSON.stringify(result, null, 2));

    if (result?.data?.productUpdate?.userErrors?.length > 0) {
      console.error("User errors on bundle creation:", result.data.productUpdate.userErrors);
      throw new Error(
        `Shopify User Errors: ${result.data.productUpdate.userErrors.map((e) => e.message).join(", ")}`
      );
    }

    if (!result?.data?.productUpdate?.product?.id) {
      console.error("Failed to get product ID from bundle creation:", result);
      throw new Error("Failed to initiate Mix and Match bundle creation on Shopify.");
    }

    const productId = result.data.productUpdate.product.id;
    const bundleProductVariants = result.data.productUpdate.product.variants.nodes;
    // console.log("Mix and Match Bundle product variants:", JSON.stringify(bundleProductVariants, null, 2));

    // 2. Update prices and set it to 1000 for default variant of mix and match product
    let priceUpdateResult = null;
    const bundleProductPriceUpdateMutation = `
            mutation setPriceForMixAndMatchProduct($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                    product {
                        id
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`;
    const variantUpdates = bundleProductVariants.map((variant) => ({
      id: variant.id, // This is the variant ID
      price: "1000", // Set to 1000 as per your requirement
    }));
    priceUpdateResult = await client.request(bundleProductPriceUpdateMutation, {
      session,
      variables: {
        productId: productId,
        variants: variantUpdates.map((v) => ({
          id: v.id,
          price: v.price,
        })),
      },
    });
    // console.log("Mix and Match Bundle price update result:", JSON.stringify(priceUpdateResult, null, 2));
    if (priceUpdateResult?.data?.productVariantsBulkUpdate?.userErrors?.length > 0) {
      console.error(
        "User errors on price update:",
        priceUpdateResult.data.productVariantsBulkUpdate.userErrors
      );
      throw new Error(
        `Shopify User Errors: ${priceUpdateResult.data.productVariantsBulkUpdate.userErrors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    if (!priceUpdateResult?.data?.productVariantsBulkUpdate?.product?.id) {
      console.error("Failed to update product price:", priceUpdateResult);
      throw new Error("Failed to update Mix and Match bundle prices on Shopify.");
    }
    const shopDomain = res.locals.shopify.session.shop;
    let shopData = await Shop.findOne({ shopDomain }); // Assuming shopDomain is the correct field
    if (!shopData) {
      // Handle case where shop is not found in your DB, perhaps create it or return error
      console.error(`Shop not found in DB: ${shopDomain}`);
      // return res.status(404).json({ status: false, error: "Shop not found in local database." });
    }
    // let CreateBundle = await Bundle.create({
    //   title,
    //   type,
    //   products: products,
    //   discountType,
    //   discountValue,
    //   internalName,
    //   priority: bundlePriority,
    //   status, // Store the string status
    //   widgetAppearance,
    //   startDate,
    //   endDate,
    //   shopId: shopData ? shopData._id : null, // Handle if shopData is null
    //   shopifyBundleId: productId, // Store the Shopify product ID of the bundle
    // });

    await Bundle.findByIdAndUpdate(id, {
      title,
      type,
      products: products,
      discountType,
      discountValue,
      internalName,
      priority: bundlePriority,
      status, // Store the string status
      widgetAppearance,
      startDate,
      endDate,
      shopId: shopData ? shopData._id : null, // Handle if shopData is null
      shopifyBundleId: productId, // Store the Shopify product ID of the bundle
    });
    return res.status(201).json({
      status: true,
      message: "Mix and Match Bundle created successfully.",
      bundleId: productId, // Shopify's bundle product ID
    });
  } catch (error) {
    console.error("Error creating Mix and Match bundle:", error);
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
}

/**
 * Creates the initial bundle
 * @param {Object} client - GraphQL client
 * @param {Object} session - Shopify session
 * @param {string} title - Bundle title
 * @param {Array} products - Products to include in bundle (already structured with optionSelections)
 * @param {string} type - Bundle type ("Volume Discount", "Bundle Discount", "Buy One Get One")
 * @param {Array} quantityBreaks - Quantity breaks for volume discount
 * @returns {Promise<string>} - Bundle operation ID
 */
async function createBundle(client, session, title, products, type, quantityBreaks) {
  try {
    let componentsString = "";
    if (type === "Volume Discount") {
      // Ensure products for volume discount are correctly formatted if they differ
      componentsString = formatComponentsStringForVolumeDiscount(products, quantityBreaks);
    } else {
      // For "Bundle Discount" and "Buy One Get One"
      componentsString = formatComponentsString(products);
    }
    const bundleCreateMutation = getCreateBundlesMutation(title, componentsString);

    const result = await client.request(bundleCreateMutation, { session });
    // console.log("Bundle creation initiated:", JSON.stringify(result, null, 2));

    if (result?.data?.productBundleCreate?.userErrors?.length > 0) {
      console.error("User errors on bundle creation:", result.data.productBundleCreate.userErrors);
      throw new Error(
        `Shopify User Errors: ${result.data.productBundleCreate.userErrors.map((e) => e.message).join(", ")}`
      );
    }
    if (!result?.data?.productBundleCreate?.productBundleOperation?.id) {
      console.error("Failed to get operation ID from bundle creation:", result);
      throw new Error("Failed to initiate bundle creation on Shopify.");
    }

    return result.data.productBundleCreate.productBundleOperation.id;
  } catch (error) {
    console.error("Error in createBundle function:", error);
    throw error; // Re-throw to be caught by createProductBundleV2
  }
}

/**
 * Formats the component string for GraphQL mutation (for Bundle Discount & BOGO).
 * Each product in the `products` array should have `productId`, `quantity`, and `optionSelections`.
 * Each `optionSelection` should have `componentOptionId`, `name` (this is the `uniqueName` from frontend like "Product Title Option Name"), and `values`.
 * @param {Array} products - Products to include in bundle
 * @returns {string} - Formatted components string
 */
function formatComponentsString(products) {
  return products
    .map((product) => {
      // Ensure optionSelections exist and is an array, default to empty if not
      const optionSelections = Array.isArray(product.optionSelections) ? product.optionSelections : [];

      const optionsString = optionSelections
        .map((option) => {
          // Ensure values exist and is an array, default to empty if not
          const values = Array.isArray(option.values) ? option.values : [];
          return `{
                        componentOptionId: "${option.componentOptionId}", 
                        name: "${option.uniqueName}", 
                        values: ${JSON.stringify(values)}
                    }`;
        })
        .join(", ");

      return `{
                productId: "${product.productId}",
                quantity: ${product.quantity || 1},
                optionSelections: [${optionsString}]
            }`;
    })
    .join(", ");
}

/**
 * Formats the component string for GraphQL mutation for Volume Discount.
 * @param {Array} products - Products to include in bundle
 * @param {Array} quantityBreaks - Quantity breaks for volume discount
 * @returns {string} - Formatted components string
 */
function formatComponentsStringForVolumeDiscount(products, quantityBreaks) {
  return products
    .map((product) => {
      const optionSelections = Array.isArray(product.optionSelections) ? product.optionSelections : [];
      const optionsString = optionSelections
        .map((option) => {
          const values = Array.isArray(option.values) ? option.values : [];
          return `{
                        componentOptionId: "${option.componentOptionId}",
                        name: "${option.uniqueName}", 
                        values: ${JSON.stringify(values)}
                    }`;
        })
        .join(", ");

      const quantityBreaksString = quantityBreaks
        .map((breakItem) => {
          return `{
                        name: "${breakItem.uniqueName}", 
                        quantity: ${parseInt(breakItem.quantity)},
                    }`;
        })
        .join(", ");

      return `{
                productId: "${product.productId}",
                optionSelections: [${optionsString}],
                quantityOption: {
                    name: "Quantity", 
                    values: [${quantityBreaksString}],
                }
            }`;
    })
    .join(", ");
}

/**
 * Polls bundle operation status until completion or failure
 * @param {Object} client - GraphQL client
 * @param {Object} session - Shopify session
 * @param {string} operationId - Bundle operation ID
 * @returns {Promise<Object>} - Completed operation data
 */
async function pollBundleStatus(client, session, operationId) {
  const MAX_RETRIES = 30; // 30 seconds
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

    try {
      const query = getBundleStatusMutation(operationId);
      const response = await client.request(query, { session });
      const operation = response.data.productOperation;

      if (!operation) {
        console.error("Polling error: productOperation is null", response);
        throw new Error("Polling error: productOperation data is missing from Shopify response.");
      }

      const status = operation.status;
      console.log(`Bundle operation status (attempt ${attempts}): ${status}`);

      if (status === "COMPLETE") {
        if (operation.product) {
          return operation; // Success
        } else {
          // This case should ideally not happen if status is COMPLETE
          console.error("Bundle operation COMPLETE but no product data returned.", operation);
          throw new Error("Bundle creation reported COMPLETE by Shopify, but product data is missing.");
        }
      } else if (status === "FAILED") {
        console.error("Bundle creation failed on Shopify.", operation.userErrors);
        const errorMessages = operation.userErrors.map((err) => err.message).join(", ");
        throw new Error(`Bundle creation failed on Shopify: ${errorMessages}`);
      }
      // If status is PENDING or RUNNING, continue polling.
    } catch (error) {
      console.error(`Error polling bundle status (attempt ${attempts}):`, error);
      // Don't re-throw immediately for transient network issues, let loop retry.
      // If it's a definitive failure from Shopify (like FAILED status), it's already thrown.
      if (attempts >= MAX_RETRIES) throw error; // Throw if max retries reached
    }
  }

  throw new Error("Bundle creation timed out after maximum retries.");
}

/**
 * Calculates new prices for variants based on discount (for standard Bundle Discount)
 * @param {Array} variants - Product variants from the created bundle
 * @param {string} discountType - Type of discount (percentage, fixed amount, price)
 * @param {string|number} discountValue - Discount amount
 * @returns {Array} - Updated variant price information
 */
function calculateVariantPrices(variants, discountType, discountValue) {
  const amount = parseFloat(discountValue);

  return variants.map((variant) => {
    const originalPrice = parseFloat(variant.price);
    let newPrice = originalPrice;
    let compareAtPrice = null; // Shopify sets compareAtPrice if newPrice < originalPrice

    if (discountType.toLowerCase() === "percentage") {
      newPrice = originalPrice * (1 - amount / 100);
    } else if (discountType.toLowerCase() === "fixed amount") {
      newPrice = Math.max(0, originalPrice - amount);
    } else if (discountType.toLowerCase() === "price") {
      // Sets a new absolute price
      newPrice = amount;
    }

    newPrice = parseFloat(newPrice.toFixed(2));

    if (newPrice < originalPrice) {
      compareAtPrice = originalPrice.toString();
    }

    return {
      id: variant.id,
      price: newPrice.toString(),
      compareAtPrice: compareAtPrice, // Will be null if not applicable
    };
  });
}

/**
 * Calculates new prices for variants based on Volume Discount.
 * @param {Array} variants - Product variants from the created bundle.
 * @param {string} discountType - Type of discount (percentage, fixed, price).
 * @param {Array} quantityBreaks - Quantity breaks [{uniqueName, quantity, discount}].
 * @returns {Array} - Updated variant price information.
 */
function calculateVariantPricesUsingVolumeDiscount(variants, discountType, quantityBreaks) {
  return variants.map((variant) => {
    const originalPrice = parseFloat(variant.price);
    let newPrice = originalPrice;
    let compareAtPrice = null;
    const variantTitle = variant.title; // e.g., "ProductA Option1 ValueX / Quantity: 10-Pack"
    console.log(`Calculating price for variant: "${variantTitle}" with original price: ${originalPrice}`);
    // Find the quantity break that applies to this variant by matching uniqueName in title
    const quantityBreak = quantityBreaks.find((qb) => variantTitle.includes(qb.uniqueName));

    if (!quantityBreak) {
      console.log(`No quantity break found for variant: "${variantTitle}". Using original price.`);
      return {
        id: variant.id,
        price: originalPrice.toString(),
        compareAtPrice: null,
      };
    }

    const discountAmount = parseFloat(quantityBreak.discount);

    if (discountType.toLowerCase() === "percentage") {
      newPrice = originalPrice * (1 - discountAmount / 100);
    } else if (discountType.toLowerCase() === "fixed amount") {
      // Per-unit discount for volume
      newPrice = Math.max(0, originalPrice - discountAmount);
    } else if (discountType.toLowerCase() === "price") {
      // Sets a new absolute price for this quantity tier
      newPrice = discountAmount;
    }

    newPrice = parseFloat(newPrice.toFixed(2));
    if (newPrice < originalPrice) {
      compareAtPrice = originalPrice.toString();
    }

    return {
      id: variant.id,
      price: newPrice.toString(),
      compareAtPrice: compareAtPrice,
    };
  });
}

/**
 * Updates variant prices in Shopify.
 * @param {Object} client - GraphQL client.
 * @param {Object} session - Shopify session.
 * @param {string} productId - Product ID of the bundle.
 * @param {Array} variantUpdates - Array of {id, price, compareAtPrice} for variants.
 * @returns {Promise<Object>} - Price update result from Shopify.
 */
async function updateVariantPrices(client, session, productId, variantUpdates) {
  if (!variantUpdates || variantUpdates.length === 0) {
    console.log("No variant updates to apply.");
    return null;
  }
  try {
    const variantsString = variantUpdates
      .map((variant) => {
        let variantString = `{
                    id: "${variant.id}",
                    price: "${variant.price}"`;

        // Only include compareAtPrice if it's a valid string (not null or empty)
        if (variant.compareAtPrice && variant.compareAtPrice.trim() !== "") {
          variantString += `,
                    compareAtPrice: "${variant.compareAtPrice}"`;
        }

        variantString += `
                }`;
        return variantString;
      })
      .join(", ");

    const updatePriceMutation = getBundlePriceUpdateMutation(productId, variantsString);
    const result = await client.request(updatePriceMutation, { session });
    // console.log("Price update result:", JSON.stringify(result, null, 2));

    if (result?.data?.productVariantsBulkUpdate?.userErrors?.length > 0) {
      console.error("User errors on price update:", result.data.productVariantsBulkUpdate.userErrors);
      throw new Error(
        `Shopify User Errors on price update: ${result.data.productVariantsBulkUpdate.userErrors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    return result;
  } catch (error) {
    console.error("Error updating variant prices:", error);
    throw error;
  }
}

/**
 * Updates product status (e.g., to ACTIVE or DRAFT).
 * @param {Object} client - GraphQL client.
 * @param {Object} session - Shopify session.
 * @param {string} productId - Product ID.
 * @param {string} statusString - "ACTIVE" or "DRAFT".
 * @returns {Promise<Object>} - Status update result.
 */
async function updateProductStatus(client, session, productId, statusString) {
  try {
    const updateStatusMutation = getProductStatusUpdateMutation(productId, statusString);
    const result = await client.request(updateStatusMutation, { session });
    // console.log("Status update result:", JSON.stringify(result, null, 2));
    if (result?.data?.productUpdate?.userErrors?.length > 0) {
      console.error("User errors on status update:", result.data.productUpdate.userErrors);
      throw new Error(
        `Shopify User Errors on status update: ${result.data.productUpdate.userErrors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    return result;
  } catch (error) {
    console.error("Error updating product status:", error);
    throw error;
  }
}

async function updateProductTags(client, session, productId, statusString) {
  try {
    const updateStatusMutation = getProductTagsUpdateMutation(productId, statusString);
    const result = await client.request(updateStatusMutation, { session });
    // console.log("tags update result:", JSON.stringify(result, null, 2));
    if (result?.data?.productUpdate?.userErrors?.length > 0) {
      console.error("User errors on status update:", result.data.productUpdate.userErrors);
      throw new Error(
        `Shopify User Errors on status update: ${result.data.productUpdate.userErrors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    return result;
  } catch (error) {
    console.error("Error updating product tags:", error);
    throw error;
  }
}

/**
 * Gets updated product data from Shopify.
 * @param {Object} client - GraphQL client.
 * @param {Object} session - Shopify session.
 * @param {string} productId - Product ID.
 * @returns {Promise<Object>} - Updated product data.
 */
async function getUpdatedProductData(client, session, productId) {
  try {
    const query = getUpdatedBundleMutation(productId); // This should fetch the product by ID
    const result = await client.request(query, { session });
    if (result?.data?.product?.userErrors?.length > 0) {
      // Check if the query itself had errors
      console.error("User errors on fetching updated product data:", result.data.product.userErrors);
    }
    return result;
  } catch (error) {
    console.error("Error getting updated product data:", error);
    throw error;
  }
}

/**
 * Gets active bundles from the local database.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @returns {Promise<Object>} - Bundles data.
 */
async function getActiveBundles(req, res) {
  try {
    const shopDomain = res.locals.shopify.session.shop;
    // Ensure you are querying by the correct field for shop domain, e.g., 'shopDomain' or 'myshopify_domain'
    let findShop = await Shop.findOne({ shopDomain: shopDomain });
    if (!findShop) {
      return res.status(404).json({ status: false, message: "Shop not found in local database." });
    }
    // Fetch bundles associated with this shopId
    let findBundles = await Bundle.find({ shopId: findShop._id });
    return res.status(200).json({ status: true, data: findBundles });
  } catch (error) {
    console.error("Error getting bundles from DB:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
}
async function getShopBundles(req, res) {
  try {
    const shopDomain = res.locals.shopify.session.shop;
    console.log("shopDomain", shopDomain);
    let shopData = await Shop.findOne({ shopDomain });
    if (!shopData) {
      return res.status(400).json({ status: false, message: "Shop not found" });
    }
    let findBundles = await Bundle.find({ shopId: shopData._id });
    console.log("findBundles", findBundles.length);
    return res.status(200).json({ status: true, data: findBundles });
  } catch (error) {
    console.error("Error getting updated product data:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
}

// DELETE endpoint
async function deleteBundle(req, res) {
  try {
    const { id } = req.params;
    const session = res.locals.shopify.session;

    // First delete from Shopify if needed
    if (req.body.shopifyBundleId) {
      const client = new shopify.api.clients.Graphql({ session });
      await client.query({
        data: {
          query: `mutation productDelete($input: ProductDeleteInput!) {
            productDelete(input: $input) {
              deletedProductId
              userErrors {
                field
                message
              }
            }
          }`,
          variables: {
            input: {
              id: req.body.shopifyBundleId,
            },
          },
        },
      });
    }

    // Then delete from your database
    const deletedBundle = await Bundle.findByIdAndDelete(id);

    if (!deletedBundle) {
      return res.status(404).json({ status: false, error: "Bundle not found" });
    }

    // Log activity for bundle deletion
    let widgetType = "bundle";
    let widgetName = "Bundle";
    if (deletedBundle.type === "Buy One Get One") {
      widgetType = "bogo";
      widgetName = "BOGO offer";
    } else if (deletedBundle.type === "Volume Discount") {
      widgetType = "volume";
      widgetName = "Volume discount";
    } else if (deletedBundle.type === "Mix and Match") {
      widgetType = "mix-match";
      widgetName = "Mix & Match";
    }

    await activityLogService.logActivity({
      shopId: session.shop,
      type: "deleted",
      widget: widgetType,
      title: `${widgetName} deleted`,
      meta: deletedBundle.title || deletedBundle.internalName,
      offerId: deletedBundle._id,
    });

    return res.json({ status: true, message: "Bundle deleted successfully" });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return res.status(500).json({ status: false, error: error.message });
  }
}

// PUT endpoint
async function updateBundle(req, res) {
  try {
    const { id } = req.params;
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2024-10",
    });

    // Find existing bundle in database
    const existingBundle = await Bundle.findById(id);
    if (!existingBundle) {
      return res.status(404).json({
        status: false,
        error: "Bundle not found in database",
      });
    }

    const {
      title,
      products,
      discountType,
      discountValue,
      quantityBreaks,
      status,
      internalName,
      type,
      bundlePriority,
      widgetAppearance,
      startDate,
      endDate,
      productsX,
      productsY,
      originalVariantPrices,
      priority
    } = req.body;
    console.log("Update bundle request body:", widgetAppearance);
    // 1. Update Shopify bundle product if title changed
    let shopifyUpdateResult = null;
    if (title && title !== existingBundle.title) {
      shopifyUpdateResult = await updateShopifyProduct(client, session, existingBundle.shopifyBundleId, {
        title,
      });
    }

    // 2. Update prices if discount information changed
    let priceUpdateResult = null;
    let variantUpdates = null;

    const discountChanged =
      discountType !== existingBundle.discountType || discountValue !== existingBundle.discountValue;

    const quantityBreaksChanged =
      JSON.stringify(quantityBreaks) !== JSON.stringify(existingBundle.quantityBreaks);

    if (discountChanged || quantityBreaksChanged) {
      // Get current product data from Shopify to get variants
      const currentProductData = await getUpdatedProductData(client, session, existingBundle.shopifyBundleId);
      const bundleProductVariants = currentProductData?.data?.product?.variants?.nodes;

      if (bundleProductVariants) {
        if (type === "Bundle Discount" && discountType && discountValue) {
          variantUpdates = calculateVariantPrices(bundleProductVariants, discountType, discountValue);
        } else if (type === "Volume Discount" && quantityBreaks) {
          variantUpdates = calculateVariantPricesUsingVolumeDiscount(
            bundleProductVariants,
            discountType,
            quantityBreaks
          );
        } else if (type === "Buy One Get One" && productsX && productsY && discountType && discountValue) {
          variantUpdates = calculateBogoVariantPrices(
            bundleProductVariants,
            productsX,
            productsY,
            discountType,
            discountValue,
            originalVariantPrices
          );
        }

        if (variantUpdates && variantUpdates.length > 0) {
          priceUpdateResult = await updateVariantPrices(
            client,
            session,
            existingBundle.shopifyBundleId,
            variantUpdates
          );
        }
      }
    }

    // 3. Update status if changed
    let statusUpdateResult = null;
    if (status !== undefined && status !== existingBundle.status) {
      const productStatusString = status ? "ACTIVE" : "DRAFT";
      statusUpdateResult = await updateProductStatus(
        client,
        session,
        existingBundle.shopifyBundleId,
        productStatusString
      );
    }

    // 4. Update tags if type changed
    let tagsUpdateResult = null;
    if (type && type !== existingBundle.type) {
      const cleanType = type.replace(/\s+/g, "");
      const tags = ["busybuddybundles", cleanType];
      tagsUpdateResult = await updateProductTags(client, session, existingBundle.shopifyBundleId, tags);
    }

    // 5. Update bundle in database
    const updateFields = {};

    if (title) updateFields.title = title;
    if (type) updateFields.type = type;
    if (discountType) updateFields.discountType = discountType;
    if (discountValue !== undefined) updateFields.discountValue = discountValue;
    if (quantityBreaks !== undefined) updateFields.quantityBreaks = quantityBreaks;
    if (status !== undefined) updateFields.status = status;
    if (internalName) updateFields.internalName = internalName;
    if (bundlePriority !== undefined) updateFields.priority = bundlePriority;
    if (priority !== undefined) updateFields.priority = priority;
    if (widgetAppearance) updateFields.widgetAppearance = widgetAppearance;
    if (startDate) updateFields.startDate = startDate;
    if (endDate) updateFields.endDate = endDate;

    // Handle products update based on type
    if (type === "Buy One Get One" && productsX && productsY) {
      updateFields.productsX = productsX;
      updateFields.productsY = productsY;
    } else if (products) {
      updateFields.products = products;
    }

    const updatedBundle = await Bundle.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    // 6. Get updated product data for response
    const updatedProductData = await getUpdatedProductData(client, session, existingBundle.shopifyBundleId);

    // Log activity for bundle update
    let widgetType = "bundle";
    let widgetName = "Bundle";
    const bundleType = type || existingBundle.type;
    if (bundleType === "Buy One Get One") {
      widgetType = "bogo";
      widgetName = "BOGO offer";
    } else if (bundleType === "Volume Discount") {
      widgetType = "volume";
      widgetName = "Volume discount";
    } else if (bundleType === "Mix and Match") {
      widgetType = "mix-match";
      widgetName = "Mix & Match";
    }

    // Determine if it was a status change
    const activityType = status !== undefined && status !== existingBundle.status
      ? (status ? "activated" : "deactivated")
      : "updated";

    await activityLogService.logActivity({
      shopId: session.shop,
      type: activityType,
      widget: widgetType,
      title: `${widgetName} ${activityType}`,
      meta: updatedBundle.title || updatedBundle.internalName,
      offerId: updatedBundle._id,
    });

    return res.status(200).json({
      status: true,
      message: "Bundle updated successfully.",
      bundleId: updatedBundle._id,
      shopifyBundleId: existingBundle.shopifyBundleId,
      updatedFields: Object.keys(updateFields),
      shopifyUpdates: {
        product: shopifyUpdateResult ? "Title updated" : "No title update",
        prices: priceUpdateResult ? "Prices updated" : "No price update",
        status: statusUpdateResult ? "Status updated" : "No status update",
        tags: tagsUpdateResult ? "Tags updated" : "No tags update",
      },
      bundleData: updatedProductData?.data?.product || "Could not fetch updated product data",
      bundleRecords: updatedBundle,
    });
  } catch (error) {
    console.error("Error updating product bundle:", error);

    if (error.response && error.response.errors) {
      console.error("Shopify GraphQL Errors:", JSON.stringify(error.response.errors, null, 2));
      return res.status(500).json({
        status: false,
        error: "Shopify API error during bundle update.",
        details: error.response.errors,
      });
    }

    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
}

// Helper function to update Shopify product basic info
async function updateShopifyProduct(client, session, productId, updateData) {
  try {
    let inputFields = [];

    if (updateData.title) {
      inputFields.push(`title: "${updateData.title.replace(/"/g, '\\"')}"`);
    }

    if (updateData.description) {
      inputFields.push(`descriptionHtml: "${updateData.description.replace(/"/g, '\\"')}"`);
    }

    if (inputFields.length === 0) {
      return null; // Nothing to update
    }

    const mutation = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        id: productId,
        ...updateData,
      },
    };

    const result = await client.request(mutation, { session, variables });

    if (result?.data?.productUpdate?.userErrors?.length > 0) {
      console.error("User errors on product update:", result.data.productUpdate.userErrors);
      throw new Error(
        `Shopify User Errors: ${result.data.productUpdate.userErrors.map((e) => e.message).join(", ")}`
      );
    }

    return result;
  } catch (error) {
    console.error("Error updating Shopify product:", error);
    throw error;
  }
}
export {
  createProductBundleV2,
  getActiveBundles,
  getShopBundles,
  createMixAndMatchBundle,
  updateBundle,
  deleteBundle,
  updateMixAndMatchBundle,
};
