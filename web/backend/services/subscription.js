
import { getAppSubscription } from "../../billing.js"
import sbModel from "../models/subscription.model.js";


const subscriptionUpdate = async (session) => {
  try {
    const allSubscription = await getAppSubscription(session)
    // Shopify's GraphQL API returns status as an uppercase enum ("ACTIVE"),
    // but every comparison against this field elsewhere in the codebase
    // checks lowercase "active" - normalize on write so a resync (e.g. the
    // billing-confirmation redirect) can't silently make a real paid shop's
    // subscription stop matching those checks.
    const normalizedSubscriptions = (allSubscription || []).map((sub) => ({
      ...sub,
      status: typeof sub.status === "string" ? sub.status.toLowerCase() : sub.status,
    }));
    await sbModel.updateOne({ myshopify_domain: session.shop }, {
      $set: {
        myshopify_domain: session.shop,
        activeSubscriptions: normalizedSubscriptions
      }
    }, { upsert: true });
    console.log("subscription data updated for shop::::", session.shop);
  } catch (error) {
    console.log("error while updating subscription Error :", error);
  }
};

export { subscriptionUpdate }
