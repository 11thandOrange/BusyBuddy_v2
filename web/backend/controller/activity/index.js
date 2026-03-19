import activityLogService from "../../services/activityLogService.js";

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

    const shopId = session.shop;

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

    const stats = await activityLogService.getQuickStats(session.shop);

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
