import { GET_PRODUCTS, GET_PRODUCT_BY_IDS } from "../../services/mutations.js";
import shopify from "../../../shopify.js";
import Bundle from "../../models/bundle.model.js";
import InactiveTab from "../../models/inactiveTab.model.js";
import AnnouncementBar from "../../models/announcementBar.model.js";
import Shop from "../../models/shop.model.js";
import EmailProvider from "../../models/emailProvider.model.js";
import EmailService, { EmailServiceError } from "../../services/emailService.js";
import { checkSubscriptionAccess, getFeatureNameFromEndpoint } from "../../configs/subscriptionUtils.js";
// async function getActiveBundle(req, res) {
//   // In your backend route handler
//   try {
//     const productId = req.query.product_id;
//     console.log("productId", productId);
//     // Query your database for bundles containing this product
//     const bundles = await Bundle.find({
//       $or: [
//         { "products.productId": `gid://shopify/Product/${productId}` },
//         { "products.x.productId": `gid://shopify/Product/${productId}` },
//         { "products.y.productId": `gid://shopify/Product/${productId}` },
//       ],
//     //   status: "ACTIVE", // Only active bundles
//     //   startDate: { $lte: new Date() }, // Started already
//     //   endDate: { $gte: new Date() }, // Not expired
//     }).lean();

//     if (!bundles || bundles.length === 0) {
//       return res.json({ bundles: [] });
//     }
//     console.log("bundles", bundles);
//     // Get all product IDs from these bundles (excluding the current product)
//     // const allProductIds = bundles.flatMap((bundle) => {
//     //   let products = [];
//     //   if (bundle.type === "Buy One Get One") {
//     //     products = [...bundle.products.x, ...bundle.products.y];
//     //   } else {
//     //     products = bundle.products;
//     //   }
//     //   return products.map((p) => p.productId).filter((id) => id !== productId);
//     // });
//   const allProductIds = bundles.flatMap((bundle) => {
//       let products = [];
//       if (bundle.type === "Buy One Get One") {
//         products = [...bundle.products.x, ...bundle.products.y];
//       } else {
//         products = bundle.products;
//       }
//       return products.map((p) => p.productId.replace('gid://shopify/Product/', ''))
//                     .filter((id) => id !== productId);
//     });
//     // Get unique product IDs
//      const uniqueProductIds = [...new Set(allProductIds)];

//     if (uniqueProductIds.length === 0) {
//       return res.json({ bundles: [] });
//     }
//     // const products = await shopify.product.list({
//     //   ids: uniqueProductIds.join(","),
//     //   limit: 10,
//     //   fields: "id,title,images,variants",
//     // });

//     // // Map products to a more usable format
//     // const productMap = products.reduce((map, product) => {
//     //   map[product.id] = {
//     //     id: product.id,
//     //     title: product.title,
//     //     price: product.variants[0]?.price,
//     //     compare_at_price: product.variants[0]?.compare_at_price,
//     //     image: product.images[0]?.src,
//     //     variant_id: product.variants[0]?.id,
//     //     available: product.variants[0]?.inventory_quantity > 0,
//     //   };
//     //   return map;
//     // }, {});

//     // Enhance bundles with product data
//     // const enhancedBundles = bundles.map((bundle) => {
//     //   let products = [];
//     //   if (bundle.type === "Buy One Get One") {
//     //     products = {
//     //       x: bundle.products.x.map((p) => ({
//     //         ...p,
//     //         ...(productMap[p.productId] || {}),
//     //       })),
//     //       y: bundle.products.y.map((p) => ({
//     //         ...p,
//     //         ...(productMap[p.productId] || {}),
//     //       })),
//     //     };
//     //   } else {
//     //     products = bundle.products.map((p) => ({
//     //       ...p,
//     //       ...(productMap[p.productId] || {}),
//     //     }));
//     //   }

//     //   return {
//     //     ...bundle,
//     //     products,
//     //   };
//     // });

//     return res.status(200).json({ status: true, bundles: enhancedBundles });
//   } catch (error) {
//     console.error("Error fetching bundles:", error);
//     res.status(500).json({ error: "Failed to load bundles" });
//   }
// }
async function getActiveBundle(req, res) {
  try {
    const productId = req.query.product_id;
    // const productId = req.query.product_id;
    console.log("productId", productId);

    // Get session for the shop (required for API calls)
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2024-10", // Ensure this is a valid and supported API version
    });
    const accessCheck = await checkSubscriptionAccess(session.shop, "Bundle Discount");

    // Return blank data if no subscription access
    if (accessCheck.shouldReturnBlank) {
      console.log(`Returning blank bundles. Reason: ${accessCheck.reason}`);
      return res.status(200).json({ status: true, bundles: [] });
    }
    const shopDomain = res.locals.shopify.session.shop;
    let shopData = await Shop.findOne({ shopDomain });
    // Query your database for bundles containing this product
    const bundles = await Bundle.find({
      $or: [
        { "products.productId": `gid://shopify/Product/${productId}` },
        { "productsX.productId": `gid://shopify/Product/${productId}` },
        { "productsY.productId": `gid://shopify/Product/${productId}` },
      ],
      status: true,
      shopId: shopData ? shopData._id : null,
    })
      .sort({ priority: -1 }) // sort first
      .limit(1)
      .lean();

    console.log("bundles", bundles);
    if (!bundles || bundles.length === 0) {
      return res.json({ bundles: [] });
    }

    // Get all product IDs from these bundles (excluding the current product)
    const allProductIds = bundles.flatMap((bundle) => {
      let products = [];
      if (bundle.type === "Buy One Get One") {
        products = [...bundle.productsX, ...bundle.productsY];
      } else {
        products = bundle.products;
      }
      return products
        .map((p) => p.productId.replace("gid://shopify/Product/", ""))
        .filter((id) => id !== productId);
    });

    // Get unique product IDs
    const uniqueProductIds = [...new Set(allProductIds)];
    console.log("uniqueProductIds", uniqueProductIds);
    // if (uniqueProductIds.length === 0) {
    //   return res.json({ bundles: [] });
    // }

    // Create REST client from session
    // const client = new shopify.clients.Rest({ session });

    // Fetch product details from Shopify
    const response = await client.request(GET_PRODUCT_BY_IDS(uniqueProductIds));
    // console.log(" getActiveBundle | response:", response)

    const products = response.data.products.edges.map((edge) => edge.node);
    console.log("Products", products);
    // Map products to a more usable format
    // Use numeric ID as key for consistent lookup (strip GID prefix)
    const productMap = {};
    products.forEach((product) => {
      // Extract numeric ID from GID format (gid://shopify/Product/12345 -> 12345)
      const numericId = product.id.split('/').pop();
      productMap[numericId] = {
        id: product.id,
        title: product.title,
        price: product.variants?.nodes?.[0]?.price,
        compare_at_price: product.variants?.nodes?.[0]?.compare_at_price,
        // Fix: Use featuredMedia.image.url instead of product.images[0].src
        image: product.featuredMedia?.image?.url || null,
        media: product.featuredMedia?.image?.url || null,
        variant_id: product.variants?.nodes?.[0]?.id,
        available: true, // Default to available, actual inventory check requires additional query
        handle: product.handle,
      };
    });

    // Enhance bundles with product data
    const enhancedBundles = bundles.map((bundle) => {
      let products = [];
      if (bundle.type === "Buy One Get One") {
        products = {
          x: bundle.productsX.map((p) => {
            // Extract numeric ID for lookup
            const numericId = p.productId.split('/').pop();
            return {
              ...p,
              ...(productMap[numericId] || {}),
            };
          }),
          y: bundle.productsY.map((p) => {
            const numericId = p.productId.split('/').pop();
            return {
              ...p,
              ...(productMap[numericId] || {}),
            };
          }),
        };
      } else {
        products = bundle.products.map((p) => {
          const numericId = p.productId.split('/').pop();
          return {
            ...p,
            ...(productMap[numericId] || {}),
          };
        });
      }

      return {
        ...bundle,
        products,
      };
    });

    return res.status(200).json({ status: true, bundles: enhancedBundles });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    res.status(500).json({ error: "Failed to load bundles" });
  }
}

async function getInactiveTab(req, res) {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2024-10", // Ensure this is a valid and supported API version
    });
    // Check subscription access first
    const accessCheck = await checkSubscriptionAccess(session.shop, "Inactive Tab Message");

    // Return blank data if no subscription access
    if (accessCheck.shouldReturnBlank) {
      console.log(`Returning blank inactive tab. Reason: ${accessCheck.reason}`);
      return res.status(200).json({ status: "SUCCESS", data: null });
    }

    const inactiveTabContent = await InactiveTab.findOne({ myshopify_domain: client.session.shop }).lean();
    return res.status(200).json({ status: "SUCCESS", data: inactiveTabContent });
  } catch (error) {
    console.error("Error fetching inactiveTab:", error);
    res.status(500).json({ error: "Failed to load Inactive tab content" });
  }
}
async function getAnnouncementBar(req, res) {
  try {
    const shopDomain = res.locals.shopify.session.shop;
    const accessCheck = await checkSubscriptionAccess(shopDomain, "Announcement Bar");

    // Return blank data if no subscription access
    if (accessCheck.shouldReturnBlank) {
      console.log(`Returning blank announcement bar. Reason: ${accessCheck.reason}`);
      return res.status(200).json({ status: "SUCCESS", data: null });
    }
    let shopData = await Shop.findOne({ shopDomain });
    if (!shopData) {
      return res.status(400).json({ status: false, message: "Shop not found" });
    }
    let inactiveTabContent = await AnnouncementBar.findOne({ shopId: shopData._id, status: "active" }).lean();
    if (inactiveTabContent && inactiveTabContent?.selectedTheme !== "solid") {
      inactiveTabContent.selectedTheme = `${process.env.HOST}/assets/${inactiveTabContent.selectedTheme}.svg`;
    }
    return res.status(200).json({ status: "SUCCESS", data: inactiveTabContent });
  } catch (error) {
    console.error("Error fetching inactiveTab:", error);
    res.status(500).json({ error: "Failed to load Inactive tab content" });
  }
}
/**
 * Subscribe customer email from announcement bar
 */
async function subscribeEmail(req, res) {
  try {
    const { email, announcementBarId, listId } = req.body;
    const shopDomain = res.locals.shopify.session.shop;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Get shop data
    const shopData = await Shop.findOne({ shopDomain });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Get announcement bar
    const announcementBar = await AnnouncementBar.findById(announcementBarId);
    if (!announcementBar) {
      return res.status(404).json({
        success: false,
        message: "Announcement bar not found",
      });
    }

    // Get email provider for this shop
    const emailProvider = await EmailProvider.findOne({ 
      shopId: shopData._id,
      isConnected: true 
    });

    if (!emailProvider) {
      return res.status(400).json({
        success: false,
        message: "Email provider not configured",
      });
    }

    // Determine which list to use
    const targetListId = listId || announcementBar.emailSettings?.listId || emailProvider.defaultListId;
    
    if (!targetListId) {
      return res.status(400).json({
        success: false,
        message: "No email list configured",
      });
    }

    // Subscribe the email
    const options = {};
    if (emailProvider.serverPrefix) {
      options.serverPrefix = emailProvider.serverPrefix;
    }

    await EmailService.subscribe(
      emailProvider.provider,
      emailProvider.apiKey,
      options,
      email,
      targetListId,
      {
        tags: ['announcement-bar', `bar-${announcementBarId}`],
      }
    );

    // Increment subscription count
    await EmailProvider.findByIdAndUpdate(emailProvider._id, {
      $inc: { subscriptionCount: 1 }
    });

    // Track conversion for analytics
    await AnnouncementBar.findByIdAndUpdate(announcementBarId, {
      $inc: { conversions: 1 }
    });

    res.status(200).json({
      success: true,
      message: announcementBar.emailSettings?.emailSuccessMessage || "Thank you for subscribing!",
    });

  } catch (error) {
    console.error("Error subscribing email:", error);

    if (error instanceof EmailServiceError) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again later.",
      error: error.message,
    });
  }
}

export { getActiveBundle, getInactiveTab, getAnnouncementBar, subscribeEmail };
