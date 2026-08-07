import { DeliveryMethod } from "@shopify/shopify-api";
import { merchantEventService } from "./backend/services/merchantEventService.js";
import Shop from "./backend/models/shop.model.js";
import Subscription from "./backend/models/subscription.model.js";
import Bundle from "./backend/models/bundle.model.js";
import AnnouncementBar from "./backend/models/announcementBar.model.js";
import InactiveTab from "./backend/models/inactiveTab.model.js";
import ActivityLog from "./backend/models/activityLog.model.js";
import EmailLog from "./backend/models/emailLog.model.js";
import EmailProvider from "./backend/models/emailProvider.model.js";
import GoogleAnalytics from "./backend/models/googleAnalytics.model.js";
import MerchantEvent from "./backend/models/merchantEvent.model.js";
import MerchantReview from "./backend/models/merchantReview.model.js";
import ShopifySession from "./backend/models/shopify_sessions.model.js";

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [299938, 280263, 220458],
      //   "customer": { "id": 191167, "email": "john@example.com", "phone": "555-625-1199" },
      //   "data_request": { "id": 9999 }
      // }
      try {
        const payload = JSON.parse(body);
        const orderIds = (payload.orders_requested || []).map((id) => String(id));

        // This app does not persist shopper PII (email/name/phone) directly -
        // shopper emails captured via the announcement bar are forwarded to
        // the merchant's own email provider (Mailchimp etc.) and not stored
        // here. The only shopper-linkable data we hold is Shopify order IDs
        // referenced on ActivityLog entries, so collect those for the record.
        const shopData = await Shop.findOne({ myshopify_domain: shop });
        const relatedActivity =
          shopData && orderIds.length
            ? await ActivityLog.find({ shopId: shopData._id.toString(), orderId: { $in: orderIds } }).lean()
            : [];

        console.log(
          `CUSTOMERS_DATA_REQUEST received for ${shop}: customer ${payload.customer?.id}, ` +
            `data_request ${payload.data_request?.id}, ${relatedActivity.length} matching activity record(s) found.`
        );
      } catch (error) {
        console.error(`Error processing CUSTOMERS_DATA_REQUEST webhook for ${shop}:`, error);
      }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": { "id": 191167, "email": "john@example.com", "phone": "555-625-1199" },
      //   "orders_to_redact": [299938, 280263, 220458]
      // }
      try {
        const payload = JSON.parse(body);
        const orderIds = (payload.orders_to_redact || []).map((id) => String(id));

        // No direct shopper PII is stored here; redact the order-ID linkage
        // on activity log entries so they can no longer be tied back to the
        // customer's orders.
        const shopData = await Shop.findOne({ myshopify_domain: shop });
        let redactedCount = 0;
        if (shopData && orderIds.length) {
          const result = await ActivityLog.updateMany(
            { shopId: shopData._id.toString(), orderId: { $in: orderIds } },
            { $set: { orderId: "[redacted]" } }
          );
          redactedCount = result.modifiedCount || 0;
        }

        console.log(
          `CUSTOMERS_REDACT processed for ${shop}: customer ${payload.customer?.id}, ${redactedCount} activity record(s) redacted.`
        );
      } catch (error) {
        console.error(`Error processing CUSTOMERS_REDACT webhook for ${shop}:`, error);
      }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
      try {
        const shopData = await Shop.findOne({ myshopify_domain: shop });
        const shopObjectId = shopData?._id;

        await Promise.all([
          Subscription.deleteMany({ myshopify_domain: shop }),
          InactiveTab.deleteMany({ myshopify_domain: shop }),
          EmailLog.deleteMany({ myshopify_domain: shop }),
          GoogleAnalytics.deleteMany({ shopDomain: shop }),
          MerchantEvent.deleteMany({ myshopify_domain: shop }),
          MerchantReview.deleteMany({ myshopify_domain: shop }),
          ShopifySession.deleteMany({ shop }),
          shopObjectId ? Bundle.deleteMany({ shopId: shopObjectId }) : Promise.resolve(),
          shopObjectId ? AnnouncementBar.deleteMany({ shopId: shopObjectId }) : Promise.resolve(),
          shopObjectId ? EmailProvider.deleteMany({ shopId: shopObjectId }) : Promise.resolve(),
          shopObjectId ? ActivityLog.deleteMany({ shopId: shopObjectId.toString() }) : Promise.resolve(),
        ]);

        if (shopData) {
          await Shop.deleteOne({ _id: shopData._id });
        }

        console.log(`SHOP_REDACT completed for ${shop}: all stored shop data purged.`);
      } catch (error) {
        console.error(`Error processing SHOP_REDACT webhook for ${shop}:`, error);
      }
    },
  },

  /**
   * Triggered when a merchant uninstalls the app.
   * Used to send automated goodbye/survey emails and track uninstall events.
   *
   * https://shopify.dev/docs/api/webhooks#list-of-topics-app_uninstalled
   */
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      try {
        const payload = JSON.parse(body);
        console.log(`APP_UNINSTALLED webhook received for ${shop}`);

        await merchantEventService.handleAppUninstall({
          shopId: payload.id?.toString(),
          shopDomain: shop,
        });

        console.log(`APP_UNINSTALLED event processed successfully for ${shop}`);
      } catch (error) {
        console.error(`Error processing APP_UNINSTALLED webhook for ${shop}:`, error);
      }
    },
  },

  /**
   * Triggered when a subscription billing attempt succeeds.
   * Can be used to track subscription activations and upgrades.
   *
   * https://shopify.dev/docs/api/webhooks#list-of-topics-subscription_billing_attempts_success
   */
  SUBSCRIPTION_BILLING_ATTEMPTS_SUCCESS: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      try {
        const payload = JSON.parse(body);
        console.log(`SUBSCRIPTION_BILLING_ATTEMPTS_SUCCESS webhook received for ${shop}`);
        // Additional billing success handling can be added here
      } catch (error) {
        console.error(`Error processing SUBSCRIPTION_BILLING_ATTEMPTS_SUCCESS webhook for ${shop}:`, error);
      }
    },
  },

  /**
   * Triggered whenever a Shopify-managed app subscription changes status,
   * including cancellations Shopify initiates on its own (e.g. a declined
   * recurring charge). Without this, a merchant whose payment failed would
   * keep paid-plan access locally forever, since our own cancel flow would
   * never run.
   *
   * https://shopify.dev/docs/api/webhooks#list-of-topics-app_subscriptions_update
   */
  APP_SUBSCRIPTIONS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      try {
        const payload = JSON.parse(body);
        const appSubscription = payload.app_subscription;
        if (!appSubscription) return;

        const { name: planName, status } = appSubscription;
        console.log(`APP_SUBSCRIPTIONS_UPDATE received for ${shop}: plan ${planName}, status ${status}`);

        const terminalStatuses = ["CANCELLED", "EXPIRED", "FROZEN", "DECLINED"];
        if (!terminalStatuses.includes(status)) return;

        const currentSubscription = await Subscription.findOne({ myshopify_domain: shop });
        if (!currentSubscription) return;

        const activeSub = currentSubscription.activeSubscriptions.find(
          (sub) => sub.status?.toLowerCase() === "active" && sub.name === planName
        );
        // Already reconciled (e.g. the merchant cancelled through our own
        // flow first) - nothing to do.
        if (!activeSub) return;

        const updatedSubscriptions = currentSubscription.activeSubscriptions.map((sub) => {
          if (sub.status?.toLowerCase() === "active" && sub.name === planName) {
            return { ...sub, status: "cancelled", cancelledAt: new Date() };
          }
          return sub;
        });
        updatedSubscriptions.push({ name: "Free", status: "active", createdAt: new Date() });

        // Mirror subscribeToPlan's downgrade-to-Free behavior: keep only the
        // first enabled app, since Free only allows one.
        let enabledApps = currentSubscription.enabledApps || [];
        let enabledAppsCount = currentSubscription.enabledAppsCount || 0;
        if (enabledAppsCount > 1) {
          enabledApps = enabledApps.map((app, index) => ({
            ...app,
            enabled: index === 0 ? app.enabled : false,
            enabledAt: index === 0 ? app.enabledAt : null,
          }));
          enabledAppsCount = enabledApps.filter((app) => app.enabled).length;
        }

        await Subscription.findOneAndUpdate(
          { myshopify_domain: shop },
          {
            activeSubscriptions: updatedSubscriptions,
            currentPlan: "Free",
            maxAppsAllowed: 1,
            enabledAppsCount,
            enabledApps,
          },
          { new: true }
        );

        merchantEventService
          .handleSubscriptionDowngrade({
            shopId: currentSubscription._id?.toString(),
            shopDomain: shop,
            previousPlan: planName,
            newPlan: "Free",
          })
          .catch((err) => console.error("Error triggering downgrade event from APP_SUBSCRIPTIONS_UPDATE:", err));
      } catch (error) {
        console.error(`Error processing APP_SUBSCRIPTIONS_UPDATE webhook for ${shop}:`, error);
      }
    },
  },
};
