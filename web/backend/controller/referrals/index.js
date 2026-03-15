import * as referralService from "../../services/referral.js";

/**
 * Create a new referral partner
 */
async function createReferral(req, res) {
  try {
    const referral = await referralService.createReferral(req.body);
    const url = referralService.generateReferralUrl(referral);

    res.status(201).json({
      status: "SUCCESS",
      data: {
        referral,
        url,
      },
    });
  } catch (error) {
    console.error("Error creating referral:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Get all referrals (admin)
 */
async function getAllReferrals(req, res) {
  try {
    const referrals = await referralService.getAllReferrals();
    res.json({
      status: "SUCCESS",
      data: referrals,
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Get referral by code
 */
async function getReferralByCode(req, res) {
  try {
    const { code } = req.params;
    const referral = await referralService.getReferralByCode(code);

    if (!referral) {
      return res.status(404).json({
        status: "ERROR",
        error: "Referral not found",
      });
    }

    res.json({
      status: "SUCCESS",
      data: referral,
    });
  } catch (error) {
    console.error("Error fetching referral:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Get referral analytics
 */
async function getReferralAnalytics(req, res) {
  try {
    const { code } = req.params;
    const analytics = await referralService.getReferralAnalytics(code);

    res.json({
      status: "SUCCESS",
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Get MongoDB query for referral
 */
async function getReferralQuery(req, res) {
  try {
    const { code } = req.params;
    const query = referralService.getReferralQuery(code);

    res.json({
      status: "SUCCESS",
      data: query,
    });
  } catch (error) {
    console.error("Error generating query:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Generate referral URL
 */
async function generateReferralUrl(req, res) {
  try {
    const { code } = req.params;
    const referral = await referralService.getReferralByCode(code);

    if (!referral) {
      return res.status(404).json({
        status: "ERROR",
        error: "Referral not found",
      });
    }

    const url = referralService.generateReferralUrl(referral);

    res.json({
      status: "SUCCESS",
      data: { url },
    });
  } catch (error) {
    console.error("Error generating URL:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Track referral event
 */
async function trackReferralEvent(req, res) {
  try {
    const { code } = req.params;
    const { event_type, shop_domain, myshopify_domain, plan_name, metadata } = req.body;

    const event = await referralService.trackReferralEvent(code, event_type, {
      shop_domain,
      myshopify_domain,
      plan_name,
      metadata,
    });

    res.status(201).json({
      status: "SUCCESS",
      data: event,
    });
  } catch (error) {
    console.error("Error tracking event:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Update referral
 */
async function updateReferral(req, res) {
  try {
    const { code } = req.params;
    const referral = await referralService.updateReferral(code, req.body);

    if (!referral) {
      return res.status(404).json({
        status: "ERROR",
        error: "Referral not found",
      });
    }

    res.json({
      status: "SUCCESS",
      data: referral,
    });
  } catch (error) {
    console.error("Error updating referral:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Deactivate referral
 */
async function deactivateReferral(req, res) {
  try {
    const { code } = req.params;
    const referral = await referralService.deactivateReferral(code);

    if (!referral) {
      return res.status(404).json({
        status: "ERROR",
        error: "Referral not found",
      });
    }

    res.json({
      status: "SUCCESS",
      data: { message: "Referral deactivated successfully" },
    });
  } catch (error) {
    console.error("Error deactivating referral:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Get MRR metrics for a referral
 */
async function getMRR(req, res) {
  try {
    const { code } = req.params;
    const mrr = await referralService.calculateMRR(code);

    res.json({
      status: "SUCCESS",
      data: mrr,
    });
  } catch (error) {
    console.error("Error calculating MRR:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Get commission owed to a referral partner
 */
async function getCommission(req, res) {
  try {
    const { code } = req.params;
    const commission = await referralService.calculateCommission(code);

    res.json({
      status: "SUCCESS",
      data: commission,
    });
  } catch (error) {
    console.error("Error calculating commission:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Get fraud detection report for a referral
 */
async function getFraudDetection(req, res) {
  try {
    const { code } = req.params;
    const fraud = await referralService.detectFraud(code);

    res.json({
      status: "SUCCESS",
      data: fraud,
    });
  } catch (error) {
    console.error("Error detecting fraud:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Get dashboard metrics for a referral
 */
async function getDashboardMetrics(req, res) {
  try {
    const { code } = req.params;
    const metrics = await referralService.getDashboardMetrics(code);

    res.json({
      status: "SUCCESS",
      data: metrics,
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}

/**
 * Redirect endpoint for referral tracking
 * Tracks the click event and redirects to Shopify App Store
 */
async function redirectToAppStore(req, res) {
  try {
    const { code } = req.params;
    const referral = await referralService.getReferralByCode(code);

    if (!referral) {
      // Redirect to app store anyway, just don't track
      const appStoreUrl = referralService.getShopifyAppStoreUrl();
      return res.redirect(302, appStoreUrl);
    }

    // Track the click event
    await referralService.trackReferralEvent(code, "click", {
      metadata: {
        user_agent: req.headers["user-agent"],
        ip: req.ip,
        referer: req.headers["referer"],
      },
    });

    // Redirect to Shopify App Store
    const appStoreUrl = referralService.getShopifyAppStoreUrl(
      referral.code,
      referral.source,
      referral.campaign
    );

    res.redirect(302, appStoreUrl);
  } catch (error) {
    console.error("Error in referral redirect:", error);
    // Still redirect to app store on error
    const appStoreUrl = referralService.getShopifyAppStoreUrl();
    res.redirect(302, appStoreUrl);
  }
}

export {
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
};
