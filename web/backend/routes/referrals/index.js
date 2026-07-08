import express from "express";
import { adminAuth } from "../../middleware/adminAuth.js";
import { partnerAuth } from "../../middleware/partnerAuth.js";
import {
  createReferral,
  getAllReferrals,
  getReferralByCode,
  getReferralAnalytics,
  getReferralQuery,
  generateReferralUrl,
  trackReferralEvent,
  updateReferral,
  deactivateReferral,
  getMRR,
  getCommission,
  getFraudDetection,
  getDashboardMetrics,
  redirectToAppStore,
} from "../../controller/referrals/index.js";

const router = express.Router();

// ============================================
// ADMIN ROUTES - Require API key authentication
// Include header: x-api-key: <REFERRAL_ADMIN_API_KEY>
// ============================================

// Create a new referral partner (admin only)
router.post("/", adminAuth, createReferral);

// Get all referrals (admin only)
router.get("/", adminAuth, getAllReferrals);

// Update referral (admin only)
router.put("/:code", adminAuth, updateReferral);

// Deactivate referral (admin only)
router.delete("/:code", adminAuth, deactivateReferral);

// Get fraud detection report (admin only)
router.get("/:code/fraud", adminAuth, getFraudDetection);

// Get MongoDB query for referral (admin only)
router.get("/:code/query", adminAuth, getReferralQuery);

// ============================================
// PARTNER ROUTES
// The referral `code` is public (it's embedded in shareable links), so it
// cannot double as a credential. Financial/analytics data requires the
// partner's separate `partner_token` secret via the `x-referral-token`
// header (see middleware/partnerAuth.js). Non-financial lookups that are
// meant to work from the public shareable link stay open.
// ============================================

// Get referral by code
router.get("/:code", getReferralByCode);

// Generate referral URL
router.get("/:code/url", generateReferralUrl);

// Get referral analytics (requires partner token)
router.get("/:code/analytics", partnerAuth, getReferralAnalytics);

// Get MRR metrics (requires partner token)
router.get("/:code/mrr", partnerAuth, getMRR);

// Get commission owed (requires partner token)
router.get("/:code/commission", partnerAuth, getCommission);

// Get dashboard metrics (requires partner token)
router.get("/:code/dashboard", partnerAuth, getDashboardMetrics);

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// Track referral event (clicks, installs, etc.)
router.post("/:code/track", trackReferralEvent);

// Redirect to Shopify App Store (tracks click and redirects)
// This is the URL partners share: /api/referrals/:code/redirect
router.get("/:code/redirect", redirectToAppStore);

export default router;
