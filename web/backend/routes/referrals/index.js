import express from "express";
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

// Create a new referral partner
router.post("/", createReferral);

// Get all referrals (admin)
router.get("/", getAllReferrals);

// Get referral by code
router.get("/:code", getReferralByCode);

// Get referral analytics
router.get("/:code/analytics", getReferralAnalytics);

// Get MongoDB query for referral
router.get("/:code/query", getReferralQuery);

// Generate referral URL
router.get("/:code/url", generateReferralUrl);

// Get MRR metrics
router.get("/:code/mrr", getMRR);

// Get commission owed
router.get("/:code/commission", getCommission);

// Get fraud detection report
router.get("/:code/fraud", getFraudDetection);

// Get dashboard metrics
router.get("/:code/dashboard", getDashboardMetrics);

// Track referral event
router.post("/:code/track", trackReferralEvent);

// Update referral
router.put("/:code", updateReferral);

// Deactivate referral
router.delete("/:code", deactivateReferral);

export default router;
