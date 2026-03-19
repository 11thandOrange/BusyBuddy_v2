import ActivityLog from "../models/activityLog.model.js";
import Bundle from "../models/bundles.model.js";
import AnnouncementBar from "../models/announcementBar.model.js";

/**
 * Activity Log Service
 * Handles logging and retrieving activity events for the dashboard history card
 */
const activityLogService = {
  /**
   * Log a new activity event
   * @param {Object} params - Activity parameters
   * @param {string} params.shopId - Shop identifier
   * @param {string} params.type - Event type (purchase, view, redemption, created, updated, deleted, activated, deactivated)
   * @param {string} params.widget - Widget type (bundle, bogo, volume, mix-match, announcement, upsell, inactive-tab)
   * @param {string} params.title - Display title
   * @param {string} [params.meta] - Additional context
   * @param {number} [params.amount] - Revenue amount
   * @param {string} [params.offerId] - Reference to offer document
   * @param {string} [params.orderId] - Shopify order ID
   * @param {string} [params.discountCode] - Discount code used
   * @returns {Promise<Object>} Created activity log document
   */
  async logActivity({ shopId, type, widget, title, meta, amount, offerId, orderId, discountCode }) {
    try {
      const activity = new ActivityLog({
        shopId,
        type,
        widget,
        title,
        meta,
        amount: amount || null,
        offerId: offerId || null,
        orderId: orderId || null,
        discountCode: discountCode || null,
      });
      await activity.save();
      return activity;
    } catch (error) {
      console.error("Failed to log activity:", error);
      // Don't throw - activity logging should not break main operations
      return null;
    }
  },

  /**
   * Get recent customer activities for a shop (storefront events only)
   * @param {string} shopId - Shop identifier
   * @param {number} [limit=20] - Maximum number of activities to return
   * @returns {Promise<Array>} Array of activity documents
   */
  async getRecentActivities(shopId, limit = 20) {
    try {
      // Only return end-user/customer events, not merchant admin events
      return await ActivityLog.find({
        shopId,
        type: { $in: ["view", "click", "purchase"] },
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error("Failed to get recent activities:", error);
      return [];
    }
  },

  /**
   * Get quick stats for a shop (customer events today, active offers)
   * @param {string} shopId - Shop identifier
   * @returns {Promise<Object>} Stats object with activeOffers and usesToday
   */
  async getQuickStats(shopId) {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Get today's customer event stats (views, clicks, purchases)
      const [usageStats] = await ActivityLog.aggregate([
        {
          $match: {
            shopId,
            createdAt: { $gte: startOfDay },
            type: { $in: ["view", "click", "purchase"] },
          },
        },
        {
          $group: {
            _id: null,
            eventsToday: { $sum: 1 },
            revenueToday: { $sum: { $ifNull: ["$amount", 0] } },
          },
        },
      ]);

      // Get counts of active offers by type
      const { bundles, announcements } = await this.countActiveOffers(shopId);

      return {
        activeBundles: bundles,
        activeAnnouncements: announcements,
        eventsToday: usageStats?.eventsToday || 0,
        revenueToday: usageStats?.revenueToday || 0,
      };
    } catch (error) {
      console.error("Failed to get quick stats:", error);
      return {
        activeBundles: 0,
        activeAnnouncements: 0,
        eventsToday: 0,
        revenueToday: 0,
      };
    }
  },

  /**
   * Count active offers by type for a shop
   * @param {string} shopId - Shop identifier
   * @returns {Promise<Object>} Counts of active bundles and announcements
   */
  async countActiveOffers(shopId) {
    try {
      // Count active bundles (includes bundle, bogo, volume, mix-match)
      const bundles = await Bundle.countDocuments({
        shopId,
        status: true,
      });

      // Count active announcement bars
      const announcements = await AnnouncementBar.countDocuments({
        shopId,
        status: "active",
      });

      return { bundles, announcements };
    } catch (error) {
      console.error("Failed to count active offers:", error);
      return { bundles: 0, announcements: 0 };
    }
  },

  /**
   * Format date to relative time string
   * @param {Date} date - Date to format
   * @returns {string} Formatted relative time (e.g., "2m ago", "1h ago", "Yesterday")
   */
  formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 172800) return "Yesterday";
    return `${Math.floor(seconds / 86400)}d ago`;
  },

  /**
   * Get widget display name
   * @param {string} widget - Widget type
   * @returns {string} Human-readable widget name
   */
  getWidgetDisplayName(widget) {
    const names = {
      bundle: "Bundle Discount",
      bogo: "BOGO offer",
      volume: "Volume discount",
      "mix-match": "Mix & Match",
      announcement: "Announcement bar",
      upsell: "Upsell",
      "inactive-tab": "Inactive Tab",
    };
    return names[widget] || widget;
  },

  /**
   * Get icon class for activity type
   * @param {string} type - Activity type
   * @returns {string} CSS class for icon styling
   */
  getIconClass(type) {
    const classes = {
      purchase: "revenue",
      redemption: "revenue",
      view: "views",
      click: "clicks",
      created: "created",
      updated: "updated",
      deleted: "deleted",
      activated: "activated",
      deactivated: "deactivated",
    };
    return classes[type] || "default";
  },
};

export default activityLogService;
