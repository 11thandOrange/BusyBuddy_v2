// subscriptionConfig.js
// price must match the amounts actually charged via Shopify Billing
// (web/billing.js's planData) and shown to merchants (Plan.jsx's planData) -
// this copy feeds revenue reporting (see referral.js's calculateMRR), so a
// mismatch here silently understates/overstates MRR without affecting what
// merchants are actually billed.
export const subscriptionConfig = {
  Free: {
    maxApps: 1,
    allowedApps: ["announcement_bar", "inactive_tab"],
    price: 0,
    features: ["1 app enabled", "Basic messaging features only"],
  },
  Starter: {
    maxApps: 3,
    allowedApps: [
      "announcement_bar",
      "inactive_tab",
      "bundle_discount",
      "buy_one_get_one",
      "volume_discounts",
      "mix_match",
    ],
    price: 30,
    features: ["3 apps enabled", "All discount apps available", "Priority support"],
  },
  Advanced: {
    maxApps: 6,
    allowedApps: [
      "announcement_bar",
      "inactive_tab",
      "bundle_discount",
      "buy_one_get_one",
      "volume_discounts",
      "mix_match",
    ],
    price: 60,
    features: ["All 6 apps enabled", "Complete feature set", "24/7 support"],
  },
};

// App mapping for frontend display
export const appMapping = {
  announcement_bar: {
    id: "announcement_bar",
    name: "Announcement Bar",
    category: "messaging",
  },
  inactive_tab: {
    id: "inactive_tab",
    name: "Inactive Tab Message",
    category: "messaging",
  },
  bundle_discount: {
    id: "bundle_discount",
    name: "Bundle Discount",
    category: "discount",
  },
  buy_one_get_one: {
    id: "buy_one_get_one",
    name: "Buy One Get One",
    category: "discount",
  },
  volume_discounts: {
    id: "volume_discounts",
    name: "Volume Discounts",
    category: "discount",
  },
  mix_match: {
    id: "mix_match",
    name: "Mix & Match",
    category: "discount",
  },
};

