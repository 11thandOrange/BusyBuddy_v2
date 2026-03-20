import activityLogService from "../../services/activityLogService.js";
import Shop from "../../models/shop.model.js";

/**
 * Get real-time activity feed for the dashboard history card
 * Shows individual events: "Summer Bundle purchased", "Free Shipping Banner viewed"
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

    // Look up the Shop to get the MongoDB ObjectId
    const shopData = await Shop.findOne({ shopDomain: session.shop });
    if (!shopData) {
      // Return empty data if shop not found (new install)
      return res.json({
        status: "SUCCESS",
        data: {
          activities: [],
          stats: {
            activeBundles: 0,
            activeAnnouncements: 0,
            eventsToday: 0,
          },
        },
      });
    }

    const shopId = shopData._id;

    // Fetch real-time activities and stats in parallel
    const [activities, stats] = await Promise.all([
      activityLogService.getRecentActivities(shopId, 20),
      activityLogService.getQuickStats(shopId),
    ]);

    // Format activities for frontend display
    const formattedActivities = activities.map((activity) => ({
      id: activity._id,
      widget: activity.widget,
      title: activity.title,
      meta: formatActivityMeta(activity),
      amount: activity.amount ? formatCurrency(activity.amount) : null,
      time: activityLogService.formatTimeAgo(activity.createdAt),
      iconClass: activityLogService.getIconClass(activity.type),
    }));

    res.json({
      status: "SUCCESS",
      data: {
        activities: formattedActivities,
        stats: {
          activeBundles: stats.activeBundles,
          activeAnnouncements: stats.activeAnnouncements,
          eventsToday: stats.eventsToday,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to fetch activity",
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

    // Look up the Shop to get the MongoDB ObjectId
    const shopData = await Shop.findOne({ shopDomain: session.shop });
    if (!shopData) {
      // Return empty stats if shop not found
      return res.json({
        status: "SUCCESS",
        data: {
          activeBundles: 0,
          activeAnnouncements: 0,
          eventsToday: 0,
        },
      });
    }

    const stats = await activityLogService.getQuickStats(shopData._id);

    res.json({
      status: "SUCCESS",
      data: {
        activeBundles: stats.activeBundles,
        activeAnnouncements: stats.activeAnnouncements,
        eventsToday: stats.eventsToday,
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
 * Format activity meta text based on event type
 */
function formatActivityMeta(activity) {
  const typeLabels = {
    purchase: "purchased",
    view: "viewed",
    click: "clicked",
    created: "created",
    updated: "updated",
    deleted: "deleted",
    activated: "activated",
    deactivated: "deactivated",
  };
  return activity.meta || typeLabels[activity.type] || "";
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
