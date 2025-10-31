
import { getAppSubscription } from "../../billing.js"
import sbModel from "../models/subscription.model.js";


const subscriptionUpdate = async (session) => {
  try {
    const allSubscription = await getAppSubscription(session)
    await sbModel.updateOne({ myshopify_domain: session.shop }, {
      $set: {
        myshopify_domain: session.shop,
        activeSubscriptions: allSubscription
      }
    }, { upsert: true });
    console.log("subscription data updated for shop::::", session.shop);
  } catch (error) {
    console.log("error while updating subscription Error :", error);
  }
};

export { subscriptionUpdate }
