import { checkSubscriptionAccess, getFeatureNameFromEndpoint } from '../configs/subscriptionUtils.js';

export async function requireSubscriptionAccess(req, res, next) {
  try {
    const session = res.locals.shopify?.session;
    
    if (!session || !session.shop) {
      return res.status(401).json({
        status: 'ERROR',
        error: 'Shop not authenticated'
      });
    }

    const featureName = getFeatureNameFromEndpoint(req.route.path);
    
    if (!featureName) {
      // If no specific feature mapping, allow access (for backward compatibility)
      return next();
    }

    const accessCheck = await checkSubscriptionAccess(session.shop, featureName);

    // If subscription check says to return blank data, skip the controller
    // and return blank response directly from middleware
    if (accessCheck.shouldReturnBlank) {
      console.log(`Returning blank data for ${featureName}. Reason: ${accessCheck.reason}`);
      
      // Return appropriate blank data based on the endpoint
      return returnBlankData(req, res, featureName);
    }

    // Add subscription info to request for use in controllers
    req.subscriptionInfo = {
      planName: accessCheck.planName,
      featureName: featureName,
      shop: session.shop
    };

    next();
  } catch (error) {
    console.error('Subscription middleware error:', error);
    // On error, return blank data instead of error
    return returnBlankData(req, res, 'Unknown');
  }
}

// Helper function to return blank data based on endpoint
function returnBlankData(req, res, featureName) {
  const endpoint = req.route.path;
  
  switch (endpoint) {
    case '/getActiveBundle':
      return res.status(200).json({ 
        status: true, 
        bundles: [] 
      });
      
    case '/getInactiveTab':
      return res.status(200).json({ 
        status: "SUCCESS", 
        data: null 
      });
      
    case '/getAnnouncementBar':
      return res.status(200).json({ 
        status: "SUCCESS", 
        data: null 
      });
      
    default:
      return res.status(200).json({ 
        status: "SUCCESS", 
        data: null 
      });
  }
}