import { merchantEventService } from "../../services/merchantEventService.js";
import MerchantEventModel from "../../models/merchantEvent.model.js";
import EmailLogModel from "../../models/emailLog.model.js";
import MerchantReviewModel from "../../models/merchantReview.model.js";
import { emailService } from "../../services/merchantEmailService.js";

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
};
