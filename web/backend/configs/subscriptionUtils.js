import subscriptionModel from '../models/subscription.model.js';

export async function checkSubscriptionAccess(shopDomain, featureName) {
  try {
    const subscriptionData = await subscriptionModel.findOne({
      myshopify_domain: shopDomain,
    });

    if (!subscriptionData) {
      return { 
        hasAccess: false, 
        reason: 'No subscription found',
        shouldReturnBlank: true
      };
    }

    let planName = "Free";
    let enabledAppsCount = 0;
    let enabledApps = [];
    let hasActiveSubscription = false;

    if (subscriptionData && subscriptionData.activeSubscriptions.length > 0) {
      const activeSub = subscriptionData.activeSubscriptions.find(
        (sub) => sub.status === "active"
      );

      if (activeSub) {
        planName = activeSub.name;
        enabledAppsCount = subscriptionData.enabledAppsCount;
        enabledApps = subscriptionData.enabledApps || [];
        hasActiveSubscription = true;
      }
    }

    // Define which features are available for each plan
    const planFeatures = {
      Free: ["Announcement Bar", "Inactive Tab Message"],
      Starter: [
        "Announcement Bar",
        "Inactive Tab Message",
        "Bundle Discount",
        "Buy One Get One",
        "Volume Discounts",
      ],
      Advanced: [
        "Announcement Bar",
        "Inactive Tab Message",
        "Bundle Discount",
        "Buy One Get One",
        "Volume Discounts",
        "Mix & Match",
      ],
    };

    // Check if feature is available in the plan
    const hasPlanAccess = planFeatures[planName]?.includes(featureName) || false;
    
    // Check if the app is enabled for this shop - must check `.enabled`
    // itself, not just that a record exists: once an app has been toggled
    // on, its entry in enabledApps stays in the array forever (toggleApp
    // updates enabled: false in place rather than removing it), so matching
    // on presence alone made disabling an app after enabling it once have
    // no effect on what the storefront shows.
    const isAppEnabled = enabledApps.find(app => app.appName === featureName && app.enabled) ? true : false;

    // Return blank data if:
    // 1. No active subscription OR
    // 2. Plan doesn't have access OR  
    // 3. App is not enabled
    const shouldReturnBlank = !hasActiveSubscription || !hasPlanAccess || !isAppEnabled;
    
    return {
      hasAccess: hasPlanAccess && isAppEnabled && hasActiveSubscription,
      planName,
      featureName,
      isAppEnabled,
      hasActiveSubscription,
      shouldReturnBlank,
      reason: !hasActiveSubscription ? 'No active subscription' : 
              !hasPlanAccess ? `Feature not available in ${planName} plan` : 
              !isAppEnabled ? 'App is not enabled' : 'Access granted'
    };

  } catch (error) {
    console.error('Error checking subscription access:', error);
    return { 
      hasAccess: false, 
      reason: 'Error checking subscription',
      shouldReturnBlank: true
    };
  }
}

// Map API endpoints to feature names
export function getFeatureNameFromEndpoint(endpoint) {
  const featureMap = {
    // getActiveBundle intentionally omitted: it serves 4 different bundle
    // types (Bundle Discount / Volume Discounts / Buy One Get One /
    // Mix & Match) behind one route, so a single static feature name here
    // would incorrectly gate the other 3. The controller itself checks
    // access using the specific bundle's own type via
    // getFeatureNameFromBundleType() once it knows which bundle matched.
    '/getInactiveTab': 'Inactive Tab Message',
    '/getAnnouncementBar': 'Announcement Bar',
  };

  return featureMap[endpoint] || null;
}

// Maps a Bundle document's `type` field (e.g. "Volume Discount") to the
// subscription feature name used for plan gating (e.g. "Volume Discounts").
// These differ for 2 of the 4 bundle types - keep this as the single
// source of truth for that mapping rather than duplicating it.
export function getFeatureNameFromBundleType(bundleType) {
  const typeToFeatureMap = {
    'Bundle Discount': 'Bundle Discount',
    'Volume Discount': 'Volume Discounts',
    'Buy One Get One': 'Buy One Get One',
    'Mix and Match': 'Mix & Match',
  };

  return typeToFeatureMap[bundleType] || null;
}