import express from "express";
import {
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
} from "../../controller/webhooks/index.js";

const router = express.Router();

// Webhook endpoints for Shopify events
router.post("/app-installed", handleAppInstall);
router.post("/app-uninstalled", handleAppUninstall);
router.post("/orders-paid", handleOrderPaid);

// Internal webhook endpoints for subscription changes
router.post("/subscription-upgraded", handleSubscriptionUpgrade);
router.post("/subscription-downgraded", handleSubscriptionDowngrade);

// Webhook endpoint for merchant reviews
router.post("/review-submitted", handleMerchantReview);

// Admin endpoints for viewing data
router.get("/events", getMerchantEvents);
router.get("/emails", getEmailLogs);
router.post("/emails/:emailLogId/retry", retryFailedEmail);

// Analytics endpoint (acceptance criteria query)
router.get("/merchants-analytics", getMerchantsAnalytics);

// Reviews endpoint
router.get("/reviews", getMerchantReviews);

export default router;
