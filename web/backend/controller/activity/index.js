import activityLogService from "../../services/activityLogService.js";
import Shop from "../../models/shop.model.js";

/**
 * Get recent activity and stats for the dashboard history card
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

    // Fetch data in parallel
    const [activities, stats] = await Promise.all([
      activityLogService.getRecentActivities(shopId, 20),
      activityLogService.getQuickStats(shopId),
    ]);

    // Format activities for frontend
    const formattedActivities = activities.map((activity) => ({
      id: activity._id,
      type: activity.type,
      widget: activity.widget,
      iconClass: activityLogService.getIconClass(activity.type),
      title: activity.title,
      meta: activity.meta || "",
      amount: activity.amount ? `+$${activity.amount.toFixed(2)}` : null,
      time: activityLogService.formatTimeAgo(activity.createdAt),
      createdAt: activity.createdAt,
    }));

    res.json({
      status: "SUCCESS",
      data: {
        activities: formattedActivities,
        stats: {
          activeOffers: stats.activeOffers,
          usesToday: stats.usesToday,
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
 * Get activity stats only (lighter endpoint)
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

    const shopId = session.shop;
    const stats = await activityLogService.getQuickStats(shopId);

    res.json({
      status: "SUCCESS",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to fetch activity stats",
    });
  }
}

export { getRecentActivity, getActivityStats };
