import express from "express";
import { adminAuth } from "../../middleware/adminAuth.js";
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
// PARTNER ROUTES - Accessible with referral code
// Code acts as authentication (know the code = access)
// ============================================

// Get referral by code
router.get("/:code", getReferralByCode);

// Get referral analytics
router.get("/:code/analytics", getReferralAnalytics);

// Generate referral URL
router.get("/:code/url", generateReferralUrl);

// Get MRR metrics
router.get("/:code/mrr", getMRR);

// Get commission owed
router.get("/:code/commission", getCommission);

// Get dashboard metrics
router.get("/:code/dashboard", getDashboardMetrics);

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// Track referral event (clicks, installs, etc.)
router.post("/:code/track", trackReferralEvent);

export default router;
