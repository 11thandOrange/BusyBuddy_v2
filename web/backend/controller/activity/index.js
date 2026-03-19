import Shop from "../../models/shop.model.js";
import Bundle from "../../models/bundles.model.js";
import AnnouncementBar from "../../models/announcementBar.model.js";
import shopify from "../../../shopify.js";

/**
 * Get dashboard analytics for the history card
 * Shows end-user metrics: revenue, views, clicks
 * GET /api/activity/recent
 */
async function getRecentActivity(req, res) {
  try {
    const session = res.locals.shopify?.session;

    if (!session?.shop) {
      return res.status(401).json({
        status: "ERROR",
        message: "Unauthorized - No shop session",
      });
    }

    const shopData = await Shop.findOne({ shopDomain: session.shop });
    if (!shopData) {
      return res.status(200).json({
        status: "SUCCESS",
        data: {
          activities: [],
          stats: { activeOffers: 0, totalViews: 0 },
        },
      });
    }

    // Fetch analytics in parallel
    const [announcementMetrics, bundleMetrics, activeCounts] = await Promise.all([
      getAnnouncementMetrics(shopData._id),
      getBundleMetrics(session),
      getActiveCounts(shopData._id),
    ]);

    // Combine and sort by value
    const activities = [...announcementMetrics, ...bundleMetrics]
      .sort((a, b) => b.rawValue - a.rawValue)
      .slice(0, 15);

    const stats = {
      activeOffers: activeCounts.bundles + activeCounts.announcements,
      totalViews: announcementMetrics.reduce(
        (sum, m) => (m.metricType === "views" ? sum + m.rawValue : sum),
        0
      ),
    };

    res.json({
      status: "SUCCESS",
      data: { activities, stats },
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to fetch analytics",
    });
  }
}

/**
 * Get activity stats only
 * GET /api/activity/stats
 */
async function getActivityStats(req, res) {
  try {
    const session = res.locals.shopify?.session;

    if (!session?.shop) {
      return res.status(401).json({
        status: "ERROR",
        message: "Unauthorized - No shop session",
      });
    }

    const shopData = await Shop.findOne({ shopDomain: session.shop });
    if (!shopData) {
      return res.json({ status: "SUCCESS", data: { activeOffers: 0, totalViews: 0 } });
    }

    const [bundles, announcements, totalViews] = await Promise.all([
      Bundle.countDocuments({ shopId: shopData._id, status: true }),
      AnnouncementBar.countDocuments({ shopId: shopData._id, status: "active" }),
      AnnouncementBar.aggregate([
        { $match: { shopId: shopData._id } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
    ]);

    res.json({
      status: "SUCCESS",
      data: {
        activeOffers: bundles + announcements,
        totalViews: totalViews[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to fetch stats",
    });
  }
}

/**
 * Get announcement bar metrics (views, clicks)
 */
async function getAnnouncementMetrics(shopId) {
  const announcements = await AnnouncementBar.find({ shopId })
    .select("title views clicks conversions status")
    .sort({ views: -1 })
    .limit(10);

  const metrics = [];

  announcements.forEach((bar) => {
    const title = bar.title || "Announcement Bar";

    if (bar.views > 0) {
      metrics.push({
        id: `${bar._id}-views`,
        widget: "announcement",
        metricType: "views",
        title: title,
        meta: `${formatNumber(bar.views)} views`,
        amount: null,
        rawValue: bar.views,
        time: "Total",
        iconClass: "views",
      });
    }

    if (bar.clicks > 0) {
      metrics.push({
        id: `${bar._id}-clicks`,
        widget: "announcement",
        metricType: "clicks",
        title: title,
        meta: `${formatNumber(bar.clicks)} clicks`,
        amount: null,
        rawValue: bar.clicks,
        time: bar.views > 0 ? `${((bar.clicks / bar.views) * 100).toFixed(1)}% CTR` : "",
        iconClass: "clicks",
      });
    }
  });

  return metrics;
}

/**
 * Get bundle revenue metrics from Shopify orders
 */
async function getBundleMetrics(session) {
  try {
    const client = new shopify.api.clients.Graphql({
      session: session,
      apiVersion: "2025-01",
    });

    const GET_ORDERS = `{
      orders(first: 50, sortKey: CREATED_AT, reverse: true) {
        nodes {
          id
          createdAt
          lineItems(first: 50) {
            nodes {
              quantity
              discountedTotalSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItemGroup {
                productId
                title
              }
            }
          }
        }
      }
    }`;

    const data = await client.request(GET_ORDERS);
    const orders = data?.data?.orders?.nodes || [];

    // Aggregate bundle revenue
    const bundleRevenue = {};
    let currency = "USD";

    orders.forEach((order) => {
      const lineItems = order.lineItems?.nodes || [];
      lineItems.forEach((item) => {
        if (item.lineItemGroup) {
          const bundleName = item.lineItemGroup.title || "Bundle";
          const amount = parseFloat(item.discountedTotalSet?.shopMoney?.amount || 0);
          currency = item.discountedTotalSet?.shopMoney?.currencyCode || currency;

          if (!bundleRevenue[bundleName]) {
            bundleRevenue[bundleName] = 0;
          }
          bundleRevenue[bundleName] += amount;
        }
      });
    });

    return Object.entries(bundleRevenue)
      .filter(([_, revenue]) => revenue > 0)
      .map(([name, revenue]) => ({
        id: `bundle-${name}`,
        widget: "bundle",
        metricType: "revenue",
        title: name,
        meta: "Bundle revenue",
        amount: formatCurrency(revenue, currency),
        rawValue: revenue,
        time: "Total",
        iconClass: "revenue",
      }))
      .sort((a, b) => b.rawValue - a.rawValue)
      .slice(0, 10);
  } catch (error) {
    console.error("Error fetching bundle metrics:", error);
    return [];
  }
}

/**
 * Get counts of active offers
 */
async function getActiveCounts(shopId) {
  const [bundles, announcements] = await Promise.all([
    Bundle.countDocuments({ shopId, status: true }),
    AnnouncementBar.countDocuments({ shopId, status: "active" }),
  ]);
  return { bundles, announcements };
}

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export { getRecentActivity, getActivityStats };
