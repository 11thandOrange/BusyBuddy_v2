import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    // Shop identifier (Shopify shop domain or MongoDB shop ID)
    shopId: {
      type: String,
      required: true,
      index: true,
    },

    // Event type
    type: {
      type: String,
      enum: ["purchase", "view", "click", "redemption", "created", "updated", "deleted", "activated", "deactivated"],
      required: true,
    },

    // Which widget triggered this event
    widget: {
      type: String,
      enum: ["bundle", "bogo", "volume", "mix-match", "announcement", "upsell", "inactive-tab"],
      required: true,
    },

    // Display title (e.g., "Bundle Discount purchased")
    title: {
      type: String,
      required: true,
    },

    // Additional context (e.g., "Summer Bundle Pack")
    meta: {
      type: String,
    },

    // Revenue amount (if applicable)
    amount: {
      type: Number,
      default: null,
    },

    // Reference to the specific offer/discount document
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // Shopify order ID (for purchase events)
    orderId: {
      type: String,
    },

    // Shopify discount code used
    discountCode: {
      type: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We manually handle createdAt for TTL
  }
);

// Compound index for efficient shop-specific queries sorted by time
activityLogSchema.index({ shopId: 1, createdAt: -1 });

// TTL index: automatically delete documents after 90 days
activityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days in seconds
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
