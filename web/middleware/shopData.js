import shopify from "../shopify.js";
import shop from "../backend/models/shop.model.js";
import referralEventModel from "../backend/models/referralEvent.model.js";
import referralModel from "../backend/models/referral.model.js";

const shopData = async (req, res, next) => {
  // This is the one place a Shop document normally ever gets created (on
  // OAuth install). It used to run unguarded - any error here (a transient
  // Admin API hiccup, etc.) would throw past this middleware entirely,
  // breaking the install redirect AND permanently skipping Shop creation
  // for that shop with no retry anywhere else. Every endpoint that later
  // did a bare Shop.findOne for that shop would then behave as if it was
  // never installed. Catching here means the shop still gets into the app
  // even if this step fails; getOrCreateShop (services/shopService.js)
  // separately self-heals a missing Shop doc lazily on read where it matters.
  try {
    let shopCreateObject;
    let shopId;
    let shopData = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    });

    // Extract referral params from query string
    const referralCode = req.query.ref || null;
    const referralSource = req.query.source || null;
    const referralCampaign = req.query.campaign || null;

    for (const data of shopData.data) {
      shopId = data.id;
      shopCreateObject = {
        shopId: data.id,
        shopName: data.name,
        shopDomain: data.domain,
        shopCountry: data.country,
        status: "active",
        myshopify_domain: data.myshopify_domain,
        data: data,
        // Add referral tracking if present
        ...(referralCode && { referral_code: referralCode }),
        ...(referralSource && { referral_source: referralSource }),
        ...(referralCampaign && { referral_campaign: referralCampaign }),
        installed_at: new Date(),
      };
    }

    let getShop = await shop.findOne({ myshopify_domain: shopData.data[0].myshopify_domain });
    if (!getShop) {
      await shop.create({ ...shopCreateObject });

      // Track referral install event if referral code is present
      if (referralCode) {
        try {
          const referral = await referralModel.findOne({ code: referralCode, is_active: true });
          if (referral) {
            await referralEventModel.create({
              referral_code: referralCode,
              event_type: "install",
              shop_domain: shopCreateObject.shopDomain,
              myshopify_domain: shopCreateObject.myshopify_domain,
              source: referralSource,
              campaign: referralCampaign,
            });
            console.log("Referral install event tracked for code:", referralCode);
          }
        } catch (error) {
          console.error("Error tracking referral install event:", error);
        }
      }
    } else if (referralCode && !getShop.referral_code) {
      // Update existing shop with referral info if not already set
      await shop.findOneAndUpdate(
        { myshopify_domain: shopData.data[0].myshopify_domain },
        {
          referral_code: referralCode,
          referral_source: referralSource,
          referral_campaign: referralCampaign,
        }
      );
    }
  } catch (error) {
    console.error("Error creating/updating Shop document during install callback:", error);
  }
  next();
};

export default {
  shopData,
};
