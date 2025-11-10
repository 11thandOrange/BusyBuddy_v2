import mongoose from "mongoose";
import { subscriptionConfig } from "../configs/subscriptionConfig.js";
const SubscriptionSchema = mongoose.Schema(
  {
    myshopify_domain: {
      type: String,
      required: true,
    },
    activeSubscriptions: {
      type: Array,
      default: [],
    },
    currentPlan: {
      type: String,
      default: "Free",
    },
    billingHistory: [
      {
        planName: String,
        action: {
          type: String,
          // enum: ["upgrade", "downgrade", "cancellation", "renewal", "activation"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: mongoose.Schema.Types.Mixed, // Store additional info like payment details, errors, etc.
        shopifySubscriptionId: String, // Reference to Shopify subscription if applicable
      },
    ],
    trialEndsAt: Date, // If you offer trials
    gracePeriodEndsAt: Date, // Grace period after cancellation
    enabledApps: [
      {
        appId: {
          type: String,
          enum: [
            "announcement_bar",
            "inactive_tab",
            "bundle_discount",
            "buy_one_get_one",
            "volume_discounts",
            "mix_match",
          ],
        },
        appName: String,
        enabled: Boolean,
        enabledAt: Date,
        settings: mongoose.Schema.Types.Mixed, // Store app-specific settings
      },
    ],
    maxAppsAllowed: {
      type: Number,
      default: 1,
    },
    enabledAppsCount: {
      type: Number,
      default: 0,
    },
    appLimits: {
      announcement_bar: { type: Boolean, default: false },
      inactive_tab: { type: Boolean, default: false },
      bundle_discount: { type: Boolean, default: false },
      buy_one_get_one: { type: Boolean, default: false },
      volume_discounts: { type: Boolean, default: false },
      mix_match: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);
// Method to check if app can be enabled
SubscriptionSchema.methods.canEnableApp = function (appId) {
  const planConfig =
    subscriptionConfig[
      this.activeSubscriptions.find((s) => s.status === "active").name
    ];

  // Check if app is allowed in current plan
  if (!planConfig.allowedApps.includes(appId)) {
    return { canEnable: false, reason: "Feature not available in your current plan" };
  }

  // Check if user has reached app limit
  if (this.enabledAppsCount >= planConfig.maxApps) {
    return {
      canEnable: false,
      reason: `Upgrade to enable more apps (${this.enabledAppsCount}/${planConfig.maxApps} used)`,
    };
  }

  return { canEnable: true };
};
const SubscriptionModel = mongoose.model("Subscription", SubscriptionSchema);

export default SubscriptionModel;
