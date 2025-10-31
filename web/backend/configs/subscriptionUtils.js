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
    
    // Check if the app is enabled for this shop
    const isAppEnabled = enabledApps.find(app=> app.appName=== featureName) ? true : false;

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
    '/getActiveBundle': 'Bundle Discount',
    '/getInactiveTab': 'Inactive Tab Message', 
    '/getAnnouncementBar': 'Announcement Bar',
  };
  
  return featureMap[endpoint] || null;
}