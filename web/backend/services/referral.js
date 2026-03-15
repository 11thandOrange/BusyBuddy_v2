import referralModel from "../models/referral.model.js";
import referralEventModel from "../models/referralEvent.model.js";
import shopModel from "../models/shop.model.js";
import subscriptionModel from "../models/subscription.model.js";
import { subscriptionConfig } from "../configs/subscriptionConfig.js";

const BASE_URL = process.env.HOST || "https://busybuddy.app";
const SHOPIFY_APP_HANDLE = process.env.SHOPIFY_APP_HANDLE || "busybuddy";

/**
 * Create a new referral partner
 */
export async function createReferral(data) {
  const code = await referralModel.generateUniqueCode();
  const referral = new referralModel({
    code,
    partner_name: data.partner_name,
    payout_percent: data.payout_percent || 10,
    source: data.source || "partner",
    campaign: data.campaign || "default",
    metadata: data.metadata || {},
  });

  await referral.save();
  return referral;
}

/**
 * Generate referral URL with tracking parameters
 * Returns URL to the app's referral landing page which tracks the click
 * and redirects to Shopify app store
 */
export function generateReferralUrl(referral) {
  const params = new URLSearchParams({
    ref: referral.code,
    source: referral.source,
    campaign: referral.campaign,
  });
  
  // URL to referral landing/redirect endpoint
  return `${BASE_URL}/api/referrals/${referral.code}/redirect?${params.toString()}`;
}

/**
 * Get the Shopify App Store install URL
 */
export function getShopifyAppStoreUrl(referralCode, source, campaign) {
  // Shopify App Store URL with referral tracking in URL params
  // Note: Shopify may not pass custom params through, but we track via our redirect
  return `https://apps.shopify.com/${SHOPIFY_APP_HANDLE}`;
}

/**
 * Get referral by code
 */
export async function getReferralByCode(code) {
  return referralModel.findOne({ code, is_active: true });
}

/**
 * Get all referrals (admin)
 */
export async function getAllReferrals() {
  return referralModel.find({ is_active: true }).sort({ created_at: -1 });
}

/**
 * Track a referral event
 */
export async function trackReferralEvent(code, eventType, data = {}) {
  const referral = await getReferralByCode(code);
  if (!referral) {
    throw new Error("Invalid referral code");
  }

  const event = new referralEventModel({
    referral_code: code,
    event_type: eventType,
    shop_domain: data.shop_domain,
    myshopify_domain: data.myshopify_domain,
    plan_name: data.plan_name,
    source: referral.source,
    campaign: referral.campaign,
    metadata: data.metadata || {},
  });

  await event.save();
  return event;
}

/**
 * Get analytics for a referral code
 */
export async function getReferralAnalytics(code) {
  const referral = await getReferralByCode(code);
  if (!referral) {
    throw new Error("Invalid referral code");
  }

  // Get event counts
  const [clicks, installs, paid] = await Promise.all([
    referralEventModel.countDocuments({ referral_code: code, event_type: "click" }),
    referralEventModel.countDocuments({ referral_code: code, event_type: "install" }),
    referralEventModel.countDocuments({ referral_code: code, event_type: "paid" }),
  ]);

  // Get shops that installed via this referral
  const shops = await shopModel.find({ referral_code: code }).select(
    "shopDomain myshopify_domain installed_at paid_at"
  );

  // Get subscription details for referred shops
  const shopSubscriptions = await Promise.all(
    shops.map(async (shop) => {
      const subscription = await subscriptionModel.findOne({
        myshopify_domain: shop.myshopify_domain,
      });
      const activeSub = subscription?.activeSubscriptions?.find(
        (sub) => sub.status === "active"
      );
      return {
        shop_domain: shop.shopDomain,
        myshopify_domain: shop.myshopify_domain,
        installed_at: shop.installed_at,
        paid_at: shop.paid_at,
        plan_name: activeSub?.name || "Free",
      };
    })
  );

  return {
    referral: {
      code: referral.code,
      partner_name: referral.partner_name,
      payout_percent: referral.payout_percent,
      source: referral.source,
      campaign: referral.campaign,
      created_at: referral.created_at,
    },
    stats: {
      total_clicks: clicks,
      total_installs: installs,
      total_paid: paid,
      conversion_rate: installs > 0 ? ((paid / installs) * 100).toFixed(2) : 0,
    },
    merchants: shopSubscriptions,
  };
}

/**
 * Get MongoDB query for fetching all data for a referral URL
 */
export function getReferralQuery(code) {
  return {
    description:
      "MongoDB aggregation query to fetch all data for a referral URL",
    query: [
      {
        collection: "shops",
        operation: "find",
        filter: { referral_code: code },
        projection: {
          shopDomain: 1,
          myshopify_domain: 1,
          installed_at: 1,
          paid_at: 1,
          referral_source: 1,
          referral_campaign: 1,
        },
      },
      {
        collection: "referralevents",
        operation: "aggregate",
        pipeline: [
          { $match: { referral_code: code } },
          {
            $group: {
              _id: "$event_type",
              count: { $sum: 1 },
              events: { $push: "$$ROOT" },
            },
          },
        ],
      },
      {
        collection: "subscriptions",
        operation: "aggregate",
        pipeline: [
          {
            $lookup: {
              from: "shops",
              localField: "myshopify_domain",
              foreignField: "myshopify_domain",
              as: "shop",
            },
          },
          { $unwind: "$shop" },
          { $match: { "shop.referral_code": code } },
          {
            $project: {
              myshopify_domain: 1,
              activeSubscriptions: 1,
              currentPlan: 1,
            },
          },
        ],
      },
    ],
  };
}

/**
 * Update a referral
 */
export async function updateReferral(code, data) {
  return referralModel.findOneAndUpdate(
    { code },
    {
      partner_name: data.partner_name,
      payout_percent: data.payout_percent,
      source: data.source,
      campaign: data.campaign,
      metadata: data.metadata,
      updated_at: new Date(),
    },
    { new: true }
  );
}

/**
 * Deactivate a referral
 */
export async function deactivateReferral(code) {
  return referralModel.findOneAndUpdate(
    { code },
    { is_active: false, updated_at: new Date() },
    { new: true }
  );
}

/**
 * Calculate MRR (Monthly Recurring Revenue) for a referral code
 */
export async function calculateMRR(code) {
  const shops = await shopModel.find({ referral_code: code });

  let totalMRR = 0;
  const mrrBreakdown = [];

  for (const shop of shops) {
    const subscription = await subscriptionModel.findOne({
      myshopify_domain: shop.myshopify_domain,
    });

    if (subscription) {
      const activeSub = subscription.activeSubscriptions?.find(
        (sub) => sub.status === "active"
      );

      if (activeSub && activeSub.name !== "Free") {
        const planConfig = subscriptionConfig[activeSub.name];
        const monthlyPrice = planConfig?.price || 0;
        totalMRR += monthlyPrice;

        mrrBreakdown.push({
          shop_domain: shop.shopDomain,
          myshopify_domain: shop.myshopify_domain,
          plan_name: activeSub.name,
          monthly_price: monthlyPrice,
          subscribed_at: activeSub.createdAt,
        });
      }
    }
  }

  return {
    total_mrr: totalMRR,
    currency: "USD",
    paying_merchants_count: mrrBreakdown.length,
    breakdown: mrrBreakdown,
  };
}

/**
 * Calculate commission owed to a referral partner
 */
export async function calculateCommission(code) {
  const referral = await getReferralByCode(code);
  if (!referral) {
    throw new Error("Invalid referral code");
  }

  const mrrData = await calculateMRR(code);
  const commissionRate = referral.payout_percent / 100;
  const commissionOwed = mrrData.total_mrr * commissionRate;

  return {
    referral_code: code,
    partner_name: referral.partner_name,
    payout_percent: referral.payout_percent,
    total_mrr: mrrData.total_mrr,
    commission_owed: parseFloat(commissionOwed.toFixed(2)),
    currency: "USD",
    paying_merchants: mrrData.paying_merchants_count,
    breakdown: mrrData.breakdown.map((item) => ({
      ...item,
      commission: parseFloat((item.monthly_price * commissionRate).toFixed(2)),
    })),
  };
}

/**
 * Detect potential fraud patterns
 */
export async function detectFraud(code) {
  const referral = await getReferralByCode(code);
  if (!referral) {
    throw new Error("Invalid referral code");
  }

  const events = await referralEventModel.find({ referral_code: code }).sort({ occurred_at: -1 });
  const shops = await shopModel.find({ referral_code: code });

  const fraudIndicators = [];
  let riskScore = 0;

  // Check for rapid installs (more than 10 in an hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentInstalls = events.filter(
    (e) => e.event_type === "install" && e.occurred_at >= oneHourAgo
  );

  if (recentInstalls.length > 10) {
    fraudIndicators.push({
      type: "rapid_installs",
      description: `${recentInstalls.length} installs in the last hour`,
      severity: "high",
    });
    riskScore += 30;
  }

  // Check for high click-to-install ratio (low conversion might indicate bot clicks)
  const totalClicks = events.filter((e) => e.event_type === "click").length;
  const totalInstalls = events.filter((e) => e.event_type === "install").length;

  if (totalClicks > 100 && totalInstalls < 2) {
    fraudIndicators.push({
      type: "low_conversion",
      description: `${totalClicks} clicks but only ${totalInstalls} installs`,
      severity: "medium",
    });
    riskScore += 20;
  }

  // Check for duplicate shop domains (same shop reinstalling)
  const domainCounts = {};
  shops.forEach((shop) => {
    const domain = shop.myshopify_domain;
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });

  const duplicates = Object.entries(domainCounts).filter(([, count]) => count > 1);
  if (duplicates.length > 0) {
    fraudIndicators.push({
      type: "duplicate_shops",
      description: `${duplicates.length} shops with multiple install records`,
      severity: "medium",
      details: duplicates,
    });
    riskScore += 15;
  }

  // Check for no paid conversions with many installs
  const totalPaid = events.filter((e) => e.event_type === "paid").length;
  if (totalInstalls > 20 && totalPaid === 0) {
    fraudIndicators.push({
      type: "no_conversions",
      description: `${totalInstalls} installs but no paid conversions`,
      severity: "low",
    });
    riskScore += 10;
  }

  return {
    referral_code: code,
    risk_score: Math.min(riskScore, 100),
    risk_level:
      riskScore >= 50 ? "high" : riskScore >= 25 ? "medium" : "low",
    indicators: fraudIndicators,
    summary: {
      total_clicks: totalClicks,
      total_installs: totalInstalls,
      total_paid: totalPaid,
      unique_shops: shops.length,
    },
  };
}

/**
 * Get comprehensive dashboard metrics for a referral
 */
export async function getDashboardMetrics(code) {
  const [analytics, mrr, commission, fraud] = await Promise.all([
    getReferralAnalytics(code),
    calculateMRR(code),
    calculateCommission(code),
    detectFraud(code),
  ]);

  return {
    referral: analytics.referral,
    stats: analytics.stats,
    revenue: {
      mrr: mrr.total_mrr,
      commission_owed: commission.commission_owed,
      currency: "USD",
    },
    fraud_detection: {
      risk_level: fraud.risk_level,
      risk_score: fraud.risk_score,
      indicators_count: fraud.indicators.length,
    },
    merchants: analytics.merchants,
  };
}
