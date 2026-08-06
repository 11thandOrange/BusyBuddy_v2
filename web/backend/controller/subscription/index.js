import subscriptionModel from "../../models/subscription.model.js";
import shopify from "../../../shopify.js";
import { billingConfig, cancelSubscriptionPlan, getAppSubscription, isTestPaymentMode } from "../../../billing.js";
import { subscriptionUpdate } from "../../services/subscription.js";
import { subscriptionConfig, appMapping, themeBlockConfig } from "../../configs/subscriptionConfig.js";
import { merchantEventService } from "../../services/merchantEventService.js";

// Short-lived per-shop/per-app cache for theme-extension status so the
// Admin Assets API isn't hit on every homepage load and every toggle
// attempt - Shopify has no webhook for app block/embed toggle changes, so
// this can only ever be "eventually correct" until the caller refetches.
const EXTENSION_STATUS_TTL_MS = 30_000;
const extensionStatusCache = new Map();

function findEnabledBlock(node, blockHandle, depth = 0) {
  if (!node || typeof node !== "object" || depth > 6) return false;
  if (typeof node.type === "string" && node.type.includes(`/blocks/${blockHandle}/`) && node.disabled !== true) {
    return true;
  }
  for (const key of Object.keys(node)) {
    if (findEnabledBlock(node[key], blockHandle, depth + 1)) return true;
  }
  return false;
}

async function isBlockPresentInAsset(client, themeId, assetKey, blockHandle) {
  try {
    const assets = await client.get({
      path: `themes/${themeId}/assets`,
      query: { "asset[key]": assetKey },
    });
    const data = JSON.parse(assets.body.asset.value);
    return findEnabledBlock(data, blockHandle);
  } catch (error) {
    // Asset doesn't exist on this theme, or isn't valid JSON - treat as "not configured" rather than erroring the whole check.
    return false;
  }
}

// Checks whether the given appId's theme block/embed is actually enabled on
// the shop's live theme. Body-target blocks (app embeds) are a single global
// toggle stored in config/settings_data.json; section-target blocks have no
// canonical location, so we scan the template(s) each app is expected on.
async function checkExtensionStatus(session, appId) {
  const config = themeBlockConfig[appId];
  if (!config) return false;

  const cacheKey = `${session.shop}:${appId}`;
  const cached = extensionStatusCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.enabled;

  const client = new shopify.api.clients.Rest({ session });
  const themes = await client.get({ path: "themes" });
  const mainTheme = themes.body.themes.find((theme) => theme.role === "main");
  if (!mainTheme) return false;

  let enabled = false;
  if (config.target === "body") {
    enabled = await isBlockPresentInAsset(client, mainTheme.id, "config/settings_data.json", config.handle);
  } else {
    for (const assetKey of config.scanAssets) {
      if (await isBlockPresentInAsset(client, mainTheme.id, assetKey, config.handle)) {
        enabled = true;
        break;
      }
    }
  }

  extensionStatusCache.set(cacheKey, { enabled, expiresAt: Date.now() + EXTENSION_STATUS_TTL_MS });
  return enabled;
}
async function getUsersubscription(_req, res) {
  try {
    const session = res.locals.shopify.session;
    const subscriptionData = await subscriptionModel.findOne({
      myshopify_domain: session.shop,
    });

    let planName = "Free";
    let maxAppsAllowed = 1;
    let enabledAppsCount = 0;
    let enabledApps = [];

    if (subscriptionData && subscriptionData.activeSubscriptions.length > 0) {
      const activeSub = subscriptionData.activeSubscriptions.find((sub) => sub.status === "active");

      if (activeSub) {
        planName = activeSub.name;
        maxAppsAllowed = subscriptionConfig[planName].maxApps;
        enabledAppsCount = subscriptionData.enabledAppsCount;
        enabledApps = subscriptionData.enabledApps || [];
      }
    }

    res.json({
      status: "SUCCESS",
      data: {
        planName,
        maxAppsAllowed,
        enabledAppsCount,
        enabledApps,
        subscriptionConfig,
      },
    });
  } catch (error) {
    console.log("Error::", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}
async function subscribeToPlan(_req, res) {
  console.log("subscribeToPlan::", _req.body);
  const session = res.locals.shopify.session;
  const { planName } = _req.body;

  try {
    // Check current subscription
    const currentSubscription = await subscriptionModel.findOne({
      myshopify_domain: session.shop,
    });

    const currentActiveSub = currentSubscription?.activeSubscriptions.find((sub) => sub.status === "active");
    const currentPlan = currentActiveSub?.name || "Free";

    // Get configuration for the new plan
    const newPlanConfig = subscriptionConfig[planName];
    const maxAppsAllowed = newPlanConfig.maxApps;

    // If switching from paid to free plan
    if (currentPlan !== "Free" && planName === "Free") {
      // Cancel the existing paid subscription in Shopify
      try {
        const cancellationResult = await cancelSubscriptionPlan(session, currentPlan);
        console.log("Cancellation result:", cancellationResult);
      } catch (cancelError) {
        console.warn("Could not cancel Shopify subscription:", cancelError);
        // Continue anyway - we'll still update our database
      }

      // Update database to Free plan - mark current as cancelled and add Free
      const updatedSubscriptions = currentSubscription.activeSubscriptions.map((sub) => {
        if (sub.status === "active") {
          return { ...sub, status: "cancelled", cancelledAt: new Date() };
        }
        return sub;
      });

      updatedSubscriptions.push({
        name: "Free",
        status: "active",
        createdAt: new Date(),
      });

      // For Free plan, disable all apps except the first one if any are enabled
      let enabledApps = currentSubscription.enabledApps || [];
      let enabledAppsCount = currentSubscription.enabledAppsCount || 0;

      if (enabledAppsCount > 1) {
        // Keep only the first enabled app, disable the rest
        enabledApps = enabledApps.map((app, index) => ({
          ...app,
          enabled: index === 0 ? app.enabled : false,
          enabledAt: index === 0 ? app.enabledAt : null,
        }));
        enabledAppsCount = enabledApps.filter((app) => app.enabled).length;
      }

      // Reset app limits for Free plan (only allow announcement_bar and inactive_tab)
      const updatedAppLimits = {
        announcement_bar: enabledApps.find((a) => a.appId === "announcement_bar")?.enabled || false,
        inactive_tab: enabledApps.find((a) => a.appId === "inactive_tab")?.enabled || false,
        bundle_discount: false,
        buy_one_get_one: false,
        volume_discounts: false,
        mix_match: false,
      };

      await subscriptionModel.findOneAndUpdate(
        { myshopify_domain: session.shop },
        {
          activeSubscriptions: updatedSubscriptions,
          currentPlan: "Free",
          maxAppsAllowed: 1,
          enabledAppsCount: enabledAppsCount,
          enabledApps: enabledApps,
          appLimits: updatedAppLimits,
        },
        { upsert: true, new: true }
      );

      // Trigger downgrade event webhook
      merchantEventService.handleSubscriptionDowngrade({
        shopId: session.id,
        shopDomain: session.shop,
        previousPlan: currentPlan,
        newPlan: "Free",
      }).catch((err) => console.error("Error triggering downgrade event:", err));

      return res.json({
        status: "SUCCESS",
        data: {
          message: "Successfully downgraded to Free plan",
          url: null,
        },
      });
    }

    // Handle free to paid upgrade, paid to paid change, or paid to paid downgrade
    if (planName !== "Free") {
      // Check specifically against the target plan, not "any paid plan" -
      // otherwise switching between two different paid plans (e.g. Starter ->
      // Advanced) would be mistaken for "already subscribed" since the shop
      // does have an active subscription among the checked plans, just not
      // the one being requested. That skipped the charge entirely and left
      // the old plan's Shopify subscription running, undercharging the
      // merchant for the upgraded features.
      let isSubscribedToTargetPlan = await shopify.api.billing.check({
        session,
        plans: [planName],
        isTest: isTestPaymentMode(),
      });

      if (!isSubscribedToTargetPlan) {
        // Cancel any existing paid subscription for a different plan before
        // charging for the new one, so the merchant isn't billed for both.
        if (currentPlan !== "Free" && currentPlan !== planName) {
          try {
            const cancellationResult = await cancelSubscriptionPlan(session, currentPlan);
            console.log("Cancellation result (plan change):", cancellationResult);
          } catch (cancelError) {
            console.warn("Could not cancel previous Shopify subscription before plan change:", cancelError);
          }
        }

        const redirectObj = await shopify.api.billing.request({
          session,
          plan: planName,
          isTest: isTestPaymentMode(),
        });

        return res.json({
          status: "SUCCESS",
          data: {
            message: "Redirect to payment",
            url: redirectObj,
          },
        });
      } else {
        // Already subscribed to this exact plan, just sync our database
        const updatedSubscriptions =
          currentSubscription?.activeSubscriptions.map((sub) => {
            if (sub.status === "active") {
              return { ...sub, status: "cancelled", cancelledAt: new Date() };
            }
            return sub;
          }) || [];

        updatedSubscriptions.push({
          name: planName,
          status: "active",
          createdAt: new Date(),
        });

        // Preserve existing enabled apps and counts when upgrading
        const enabledApps = currentSubscription?.enabledApps || [];
        const enabledAppsCount = currentSubscription?.enabledAppsCount || 0;

        await subscriptionModel.findOneAndUpdate(
          { myshopify_domain: session.shop },
          {
            activeSubscriptions: updatedSubscriptions,
            currentPlan: planName,
            maxAppsAllowed: maxAppsAllowed,
            enabledAppsCount: enabledAppsCount,
            enabledApps: enabledApps,
          },
          { upsert: true, new: true }
        );

        // Trigger upgrade event webhook
        merchantEventService.handleSubscriptionUpgrade({
          shopId: session.id,
          shopDomain: session.shop,
          previousPlan: currentPlan,
          newPlan: planName,
        }).catch((err) => console.error("Error triggering upgrade event:", err));

        return res.json({
          status: "SUCCESS",
          data: {
            message: `Plan updated to ${planName}`,
            url: null,
          },
        });
      }
    }

    // If already on free and selecting free
    return res.json({
      status: "SUCCESS",
      data: {
        message: "Already on Free plan",
        url: null,
      },
    });
  } catch (error) {
    console.error("Error in subscribeToPlan:", error);
    return res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}
async function cancelSubscribe(_req, res) {
  console.log("subscribeToPlan::", _req.body);
  const session = res.locals.shopify.session;
  const { planName } = _req.body;
  try {
    const resData = await cancelSubscriptionPlan(session, planName);
    // console.log("resData:::")
    const currentSubscription = await subscriptionModel.findOne({
      myshopify_domain: session.shop,
    });
    if (currentSubscription) {
      const updatedSubscriptions = currentSubscription.activeSubscriptions.map((sub) => {
        if (sub.name === planName && sub.status === "active") {
          return { ...sub, status: "cancelled", cancelledAt: new Date() };
        }
        return sub;
      });

      // Add Free plan if cancelling a paid plan
      if (planName !== "Free") {
        updatedSubscriptions.push({
          name: "Free",
          status: "active",
          createdAt: new Date(),
        });
      }

      await subscriptionModel.findOneAndUpdate(
        { myshopify_domain: session.shop },
        { activeSubscriptions: updatedSubscriptions },
        { new: true }
      );
    }
    subscriptionUpdate(session);
    return res.json({
      status: "SUCCESS",
      data: {
        message: "Plan cancelled",
        status: "SUCCESS",
        data: resData,
      },
    });
  } catch (error) {
    console.log("error::", error);
    return res.json({
      status: "ERROR",
      error: error,
    });
  }
}

async function getExtensionStatus(req, res) {
  const session = res.locals.shopify.session;
  const { appId } = req.query;

  if (!appId || !themeBlockConfig[appId]) {
    return res.status(400).json({
      status: "ERROR",
      error: "A valid appId query param is required",
    });
  }

  try {
    const enabled = await checkExtensionStatus(session, appId);
    return res.json({
      status: "SUCCESS",
      data: { appId, extensionEnabled: enabled },
    });
  } catch (error) {
    console.error("Error checking extension status:", error);
    return res.status(500).json({
      status: "ERROR",
      error: "Could not determine extension status",
      details: error.message,
    });
  }
}

async function getThemeEditorUrl(req, res) {
  const session = res.locals.shopify.session;
  const appId = req.query.appId || "announcement_bar";
  const config = themeBlockConfig[appId];

  if (!config) {
    return res.status(400).json({
      status: "ERROR",
      error: `Unknown appId: ${appId}`,
    });
  }

  try {
    // Shopify's theme-editor deep-link scheme identifies the app by its
    // Client ID, not by the extension's own `uid` from shopify.extension.toml
    // (that uid is for the CLI's config-sync/registry, unrelated to this) -
    // SHOPIFY_API_KEY is that Client ID, already relied on elsewhere (e.g.
    // web/index.js for App Bridge init) so it's guaranteed to be set.
    const uid = process.env.SHOPIFY_API_KEY;
    let themeEditorUrl;

    if (config.target === "body") {
      // App embeds are a single global toggle - no template needed.
      themeEditorUrl = `https://${session.shop}/admin/themes/current/editor?context=apps&activateAppId=${uid}/${config.handle}`;
    } else {
      themeEditorUrl = `https://${session.shop}/admin/themes/current/editor?template=${config.editorTemplate}&addAppBlockId=${uid}/${config.handle}&target=${config.editorSectionTarget}`;
    }

    return res.json({
      status: "SUCCESS",
      data: { appId, url: themeEditorUrl },
    });
  } catch (error) {
    console.error("Error getting theme editor URL:", error);
    return res.status(500).json({
      status: "ERROR",
      error: "Could not get theme editor URL",
    });
  }
}

async function toggleApp(req, res) {
  try {
    const session = res.locals.shopify.session;
    const { appId, enable } = req.body;

    // Try to find subscription data, if not found assume free plan
    let subscriptionData = await subscriptionModel.findOne({
      myshopify_domain: session.shop,
    });

    // If no subscription data found, create a free plan structure
    if (!subscriptionData) {
      subscriptionData = {
        myshopify_domain: session.shop,
        activeSubscriptions: [
          {
            name: "Free",
            status: "active",
          },
        ],
        enabledApps: [],
        enabledAppsCount: 0,
        appLimits: {},
      };

      // If you want to save this as a new document, uncomment the next line
      subscriptionData = await subscriptionModel.create(subscriptionData);
    }

    const activeSub = subscriptionData.activeSubscriptions?.find((sub) => sub.status === "active");

    // If no active subscription, assume free plan
    if (!activeSub) {
      subscriptionData.activeSubscriptions = [
        {
          name: "Free",
          status: "active",
        },
      ];
    }

    console.log("activeSub.name:::", activeSub?.name || "Free");

    // Use the active subscription name or default to "Free"
    const planName = activeSub?.name || "Free";
    const planConfig = subscriptionConfig[planName] || subscriptionConfig.Free;
    const currentEnabledCount = subscriptionData.enabledAppsCount || 0;

    // Check if app is allowed in current plan
    if (!planConfig.allowedApps.includes(appId)) {
      return res.status(403).json({
        status: "ERROR",
        error: "This app is not available in your current plan. Please upgrade to access premium features.",
      });
    }

    // Check if user is trying to enable beyond their limit
    if (enable && currentEnabledCount >= planConfig.maxApps) {
      return res.status(403).json({
        status: "ERROR",
        error: `You have reached the maximum of ${planConfig.maxApps} apps for your ${planName} plan. Please upgrade to enable more apps.`,
      });
    }

    // Special validation for Free plan
    if (planName === "Free") {
      const enabledApps = subscriptionData.enabledApps || [];
      const currentlyEnabled = enabledApps.filter((app) => app.enabled);

      // Free plan can only have one app enabled at a time
      if (enable && currentlyEnabled.length >= 1) {
        return res.status(403).json({
          status: "ERROR",
          error:
            "Free plan allows only one app at a time. Please disable the current app or upgrade your plan.",
        });
      }
    }

    // Initialize enabledApps if it doesn't exist
    if (!subscriptionData.enabledApps) {
      subscriptionData.enabledApps = [];
    }

    // Update app status in root level enabledApps
    const appInfo = appMapping[appId];
    const appIndex = subscriptionData.enabledApps.findIndex((app) => app.appId === appId);

    if (appIndex > -1) {
      subscriptionData.enabledApps[appIndex].enabled = enable;
      subscriptionData.enabledApps[appIndex].enabledAt = enable ? new Date() : null;
    } else {
      subscriptionData.enabledApps.push({
        appId,
        appName: appInfo.name,
        enabled: enable,
        enabledAt: enable ? new Date() : null,
      });
    }
    console.log("subscriptionData.enabledApps:::::",subscriptionData.enabledApps)
    // Update counts and limits
    const newEnabledCount = enable ? currentEnabledCount + 1 : Math.max(0, currentEnabledCount - 1);
    subscriptionData.enabledAppsCount = newEnabledCount;

    if (!subscriptionData.appLimits) {
      subscriptionData.appLimits = {};
    }
    subscriptionData.appLimits[appId] = enable;

    // Save only if it's a MongoDB document (not a plain object)
    if (subscriptionData instanceof subscriptionModel) {
      await subscriptionData.save();
    }

    res.json({
      status: "SUCCESS",
      data: {
        enabledAppsCount: newEnabledCount,
        maxAppsAllowed: planConfig.maxApps,
        enabledApps: subscriptionData.enabledApps.filter((app) => app.enabled),
        appLimits: subscriptionData.appLimits,
        plan: planName,
      },
    });
  } catch (error) {
    console.log("Error toggling app:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}
async function getAppStatus(req, res) {
  try {
    const session = res.locals.shopify.session;
    const { appId } = req.query;

    const subscriptionData = await subscriptionModel.findOne({
      myshopify_domain: session.shop,
    });

    let isEnabled = false;

    if (subscriptionData && subscriptionData.enabledApps) {
      const appStatus = subscriptionData.enabledApps.find((app) => app.appId === appId);
      isEnabled = appStatus ? appStatus.enabled : false;
    }

    res.json({
      status: "SUCCESS",
      data: { isEnabled },
    });
  } catch (error) {
    console.log("Error in getAppStatus:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
    });
  }
}
export {
  getUsersubscription,
  subscribeToPlan,
  cancelSubscribe,
  getExtensionStatus,
  getThemeEditorUrl,
  toggleApp,
  getAppStatus,
};
