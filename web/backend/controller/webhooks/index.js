import { merchantEventService } from "../../services/merchantEventService.js";
import MerchantEventModel from "../../models/merchantEvent.model.js";
import EmailLogModel from "../../models/emailLog.model.js";
import MerchantReviewModel from "../../models/merchantReview.model.js";
import { emailService } from "../../services/merchantEmailService.js";
import activityLogService from "../../services/activityLogService.js";
import Bundle from "../../models/bundle.model.js";

// Handler for app install webhook
async function handleAppInstall(req, res) {
  try {
    const { shop_id: shopId, shop_domain: shopDomain } = req.body;

    console.log(`Processing app_install webhook for ${shopDomain}`);

    const result = await merchantEventService.handleAppInstall({
      shopId: shopId?.toString(),
      shopDomain,
      appVersion: process.env.APP_VERSION || "1.0.0",
    });

    res.status(200).json({
      status: "SUCCESS",
      message: "App install event processed",
      data: result,
    });
  } catch (error) {
    console.error("handleAppInstall error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

// Handler for app uninstall webhook
async function handleAppUninstall(req, res) {
  try {
    const { shop_id: shopId, shop_domain: shopDomain } = req.body;

    console.log(`Processing app_uninstall webhook for ${shopDomain}`);

    const result = await merchantEventService.handleAppUninstall({
      shopId: shopId?.toString(),
      shopDomain,
    });

    res.status(200).json({
      status: "SUCCESS",
      message: "App uninstall event processed",
      data: result,
    });
  } catch (error) {
    console.error("handleAppUninstall error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

// Handler for subscription upgrade
async function handleSubscriptionUpgrade(req, res) {
  try {
    const { shopDomain, shopId, previousPlan, newPlan } = req.body;

    console.log(`Processing subscription_upgrade webhook for ${shopDomain}: ${previousPlan} -> ${newPlan}`);

    const result = await merchantEventService.handleSubscriptionUpgrade({
      shopId: shopId?.toString(),
      shopDomain,
      previousPlan,
      newPlan,
    });

    res.status(200).json({
      status: "SUCCESS",
      message: "Subscription upgrade event processed",
      data: result,
    });
  } catch (error) {
    console.error("handleSubscriptionUpgrade error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

// Handler for subscription downgrade
async function handleSubscriptionDowngrade(req, res) {
  try {
    const { shopDomain, shopId, previousPlan, newPlan } = req.body;

    console.log(`Processing subscription_downgrade webhook for ${shopDomain}: ${previousPlan} -> ${newPlan}`);

    const result = await merchantEventService.handleSubscriptionDowngrade({
      shopId: shopId?.toString(),
      shopDomain,
      previousPlan,
      newPlan,
    });

    res.status(200).json({
      status: "SUCCESS",
      message: "Subscription downgrade event processed",
      data: result,
    });
  } catch (error) {
    console.error("handleSubscriptionDowngrade error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

// Handler for merchant review
async function handleMerchantReview(req, res) {
  try {
    const {
      shopDomain,
      shopId,
      rating,
      reviewText,
      merchantEmail,
      merchantName,
      source,
    } = req.body;

    console.log(`Processing review_submitted webhook for ${shopDomain}: ${rating} stars`);

    const result = await merchantEventService.handleReviewSubmitted({
      shopId: shopId?.toString(),
      shopDomain,
      rating,
      reviewText,
      merchantEmail,
      merchantName,
      source: source || "shopify_app_store",
    });

    res.status(200).json({
      status: "SUCCESS",
      message: "Merchant review event processed",
      data: result,
    });
  } catch (error) {
    console.error("handleMerchantReview error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

// Get all merchant events
async function getMerchantEvents(req, res) {
  try {
    const { shopDomain, eventType, limit = 50, page = 1 } = req.query;

    const query = {};
    if (shopDomain) query.myshopify_domain = shopDomain;
    if (eventType) query.eventType = eventType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await MerchantEventModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await MerchantEventModel.countDocuments(query);

    res.status(200).json({
      status: "SUCCESS",
      data: {
        events,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("getMerchantEvents error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

// Get email logs
async function getEmailLogs(req, res) {
  try {
    const { shopDomain, status, eventTrigger, limit = 50, page = 1 } = req.query;

    const query = {};
    if (shopDomain) query.myshopify_domain = shopDomain;
    if (status) query.status = status;
    if (eventTrigger) query.eventTrigger = eventTrigger;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const emails = await EmailLogModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await EmailLogModel.countDocuments(query);

    res.status(200).json({
      status: "SUCCESS",
      data: {
        emails,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("getEmailLogs error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

// Retry failed email
async function retryFailedEmail(req, res) {
  try {
    const { emailLogId } = req.params;

    const result = await emailService.retryFailedEmail(emailLogId);

    res.status(200).json({
      status: result.success ? "SUCCESS" : "ERROR",
      message: result.success ? "Email retry initiated" : result.error,
      data: result,
    });
  } catch (error) {
    console.error("retryFailedEmail error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

// Get merchants analytics (acceptance criteria query)
async function getMerchantsAnalytics(req, res) {
  try {
    const { installStatus, hasReview, plan } = req.query;

    const filters = {};
    if (installStatus) filters.installStatus = installStatus;
    if (hasReview !== undefined) filters.hasReview = hasReview === "true";
    if (plan) filters.plan = plan;

    const analytics = await merchantEventService.getMerchantsAnalytics(filters);

    res.status(200).json({
      status: "SUCCESS",
      data: {
        merchants: analytics,
        total: analytics.length,
      },
    });
  } catch (error) {
    console.error("getMerchantsAnalytics error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

// Get merchant reviews
async function getMerchantReviews(req, res) {
  try {
    const { hasLeftReview, minRating, limit = 50, page = 1 } = req.query;

    const query = {};
    if (hasLeftReview !== undefined) query.hasLeftReview = hasLeftReview === "true";
    if (minRating) query.rating = { $gte: parseInt(minRating) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await MerchantReviewModel.find(query)
      .sort({ reviewDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await MerchantReviewModel.countDocuments(query);

    res.status(200).json({
      status: "SUCCESS",
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("getMerchantReviews error:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Handle orders/paid webhook from Shopify
 * Logs purchase events when orders use app discount codes
 */
async function handleOrderPaid(req, res) {
  try {
    const order = req.body;
    const shopDomain = req.headers["x-shopify-shop-domain"];

    if (!shopDomain) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing shop domain header",
      });
    }

    console.log(`Processing orders/paid webhook for ${shopDomain}, Order ID: ${order.id}`);

    // Check if order used any discount codes
    const discountCodes = order.discount_codes || [];
    const discountApplications = order.discount_applications || [];

    for (const discount of discountCodes) {
      const discountCode = discount.code;
      
      // Try to identify if this is one of our app's discounts
      const discountInfo = await identifyAppDiscount(discountCode, shopDomain);

      if (discountInfo) {
        await activityLogService.logActivity({
          shopId: shopDomain,
          type: "purchase",
          widget: discountInfo.widget,
          title: `${discountInfo.widgetName} purchased`,
          meta: discountInfo.offerName,
          amount: parseFloat(order.total_price) || 0,
          offerId: discountInfo.offerId,
          orderId: order.id?.toString(),
          discountCode: discountCode,
        });

        console.log(`Logged purchase activity for ${discountInfo.widgetName}: ${discountInfo.offerName}`);
      }
    }

    // Also check for automatic discounts (no code) from our bundles
    for (const application of discountApplications) {
      if (application.type === "automatic" || application.type === "script") {
        // Check if this matches any of our bundle products
        const bundleInfo = await identifyBundleFromOrder(order, shopDomain);
        if (bundleInfo) {
          await activityLogService.logActivity({
            shopId: shopDomain,
            type: "purchase",
            widget: bundleInfo.widget,
            title: `${bundleInfo.widgetName} purchased`,
            meta: bundleInfo.offerName,
            amount: parseFloat(order.total_price) || 0,
            offerId: bundleInfo.offerId,
            orderId: order.id?.toString(),
          });
        }
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("handleOrderPaid error:", error);
    // Return 200 to acknowledge receipt even on error (prevent Shopify retries for bad data)
    res.status(200).json({
      status: "ERROR",
      message: error.message,
    });
  }
}

/**
 * Identify if a discount code belongs to our app
 * @param {string} code - Discount code
 * @param {string} shopDomain - Shop domain
 * @returns {Object|null} Discount info or null
 */
async function identifyAppDiscount(code, shopDomain) {
  try {
    // Check bundles - they may have associated discount codes
    // BusyBuddy uses Shopify's native bundle product, so we check by tags
    const bundle = await Bundle.findOne({
      shopId: shopDomain,
      status: true,
    }).lean();

    if (bundle) {
      // Map bundle type to widget
      let widget = "bundle";
      let widgetName = "Bundle Discount";

      if (bundle.type === "Buy One Get One") {
        widget = "bogo";
        widgetName = "BOGO offer";
      } else if (bundle.type === "Volume Discount") {
        widget = "volume";
        widgetName = "Volume discount";
      } else if (bundle.type === "Mix and Match") {
        widget = "mix-match";
        widgetName = "Mix & Match bundle";
      }

      return {
        widget,
        widgetName,
        offerName: bundle.title || bundle.internalName,
        offerId: bundle._id,
      };
    }

    return null;
  } catch (error) {
    console.error("identifyAppDiscount error:", error);
    return null;
  }
}

/**
 * Identify bundle from order line items
 * @param {Object} order - Shopify order object
 * @param {string} shopDomain - Shop domain
 * @returns {Object|null} Bundle info or null
 */
async function identifyBundleFromOrder(order, shopDomain) {
  try {
    const lineItems = order.line_items || [];
    
    for (const item of lineItems) {
      // Check if product has busybuddy bundle tag
      const tags = item.properties?.find(p => p.name === "_tags")?.value || "";
      
      if (tags.includes("busybuddybundles")) {
        // Find the bundle by Shopify product ID
        const bundle = await Bundle.findOne({
          shopId: shopDomain,
          shopifyBundleId: { $regex: item.product_id?.toString() },
        }).lean();

        if (bundle) {
          let widget = "bundle";
          let widgetName = "Bundle Discount";

          if (bundle.type === "Buy One Get One") {
            widget = "bogo";
            widgetName = "BOGO offer";
          } else if (bundle.type === "Volume Discount") {
            widget = "volume";
            widgetName = "Volume discount";
          } else if (bundle.type === "Mix and Match") {
            widget = "mix-match";
            widgetName = "Mix & Match bundle";
          }

          return {
            widget,
            widgetName,
            offerName: bundle.title || bundle.internalName,
            offerId: bundle._id,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error("identifyBundleFromOrder error:", error);
    return null;
  }
}

export {
  handleAppInstall,
  handleAppUninstall,
  handleSubscriptionUpgrade,
  handleSubscriptionDowngrade,
  handleMerchantReview,
  getMerchantEvents,
  getEmailLogs,
  retryFailedEmail,
  getMerchantsAnalytics,
  getMerchantReviews,
  handleOrderPaid,
};
