import MerchantEventModel from "../models/merchantEvent.model.js";
import MerchantReviewModel from "../models/merchantReview.model.js";
import ShopModel from "../models/shop.model.js";
import SubscriptionModel from "../models/subscription.model.js";
import { emailService } from "./merchantEmailService.js";

const EVENT_CONFIG = {
  app_installed: {
    sendEmail: true,
    updateSegments: true,
    logToDb: true,
  },
  app_uninstalled: {
    sendEmail: true,
    updateSegments: true,
    logToDb: true,
  },
  subscription_upgraded: {
    sendEmail: true,
    updateSegments: true,
    logToDb: true,
  },
  subscription_downgraded: {
    sendEmail: true,
    updateSegments: true,
    logToDb: true,
  },
  review_submitted: {
    sendEmail: true,
    updateSegments: true,
    logToDb: true,
  },
};

class MerchantEventService {
  async processEvent(eventType, eventPayload) {
    const config = EVENT_CONFIG[eventType];
    if (!config) {
      console.warn(`Unknown event type: ${eventType}`);
      return { success: false, error: "Unknown event type" };
    }

    try {
      let merchantEvent = null;
      let emailResult = null;

      // Log event to database
      if (config.logToDb) {
        merchantEvent = await this.logEvent(eventType, eventPayload);
      }

      // Get merchant data for email
      const merchantData = await this.getMerchantData(eventPayload.shopDomain);

      // Send automated email
      if (config.sendEmail && merchantData?.email) {
        emailResult = await emailService.sendEventEmail(eventType, {
          shopId: eventPayload.shopId,
          myshopify_domain: eventPayload.shopDomain,
          email: merchantData.email,
          name: merchantData.name,
          shopName: merchantData.shopName,
          plan: eventPayload.plan || merchantData.plan || "Free",
          rating: eventPayload.rating,
        }, {
          eventId: merchantEvent?._id,
          templateVars: eventPayload.templateVars || {},
        });

        // Update event with email reference
        if (merchantEvent && emailResult.emailLogId) {
          merchantEvent.emailTriggered = true;
          merchantEvent.emailId = emailResult.emailLogId;
          await merchantEvent.save();
        }
      }

      // Mark event as processed
      if (merchantEvent) {
        merchantEvent.processed = true;
        merchantEvent.processedAt = new Date();
        await merchantEvent.save();
      }

      return {
        success: true,
        eventId: merchantEvent?._id,
        emailSent: emailResult?.success || false,
        emailLogId: emailResult?.emailLogId,
      };
    } catch (error) {
      console.error(`Error processing ${eventType} event:`, error);
      return { success: false, error: error.message };
    }
  }

  async logEvent(eventType, payload) {
    const event = new MerchantEventModel({
      shopId: payload.shopId,
      myshopify_domain: payload.shopDomain,
      eventType,
      eventData: payload.eventData || {},
      previousState: payload.previousState || null,
      newState: payload.newState || null,
    });

    await event.save();
    return event;
  }

  async getMerchantData(shopDomain) {
    const shop = await ShopModel.findOne({ myshopify_domain: shopDomain });
    const subscription = await SubscriptionModel.findOne({ myshopify_domain: shopDomain });

    if (!shop) {
      return null;
    }

    const activeSub = subscription?.activeSubscriptions?.find((s) => s.status === "active");

    return {
      shopId: shop.shopId,
      email: shop.data?.email || shop.data?.shop_owner_email || "",
      name: shop.data?.shop_owner || shop.shopName || "",
      shopName: shop.shopName,
      plan: activeSub?.name || "Free",
    };
  }

  // Event handlers for specific events
  async handleAppInstall(payload) {
    return this.processEvent("app_installed", {
      shopId: payload.shopId,
      shopDomain: payload.shopDomain,
      eventData: {
        installedAt: new Date(),
        appVersion: payload.appVersion,
      },
      newState: { status: "installed" },
    });
  }

  async handleAppUninstall(payload) {
    return this.processEvent("app_uninstalled", {
      shopId: payload.shopId,
      shopDomain: payload.shopDomain,
      eventData: {
        uninstalledAt: new Date(),
        reason: payload.reason,
      },
      previousState: { status: "installed" },
      newState: { status: "uninstalled" },
    });
  }

  async handleSubscriptionUpgrade(payload) {
    return this.processEvent("subscription_upgraded", {
      shopId: payload.shopId,
      shopDomain: payload.shopDomain,
      eventData: {
        upgradedAt: new Date(),
      },
      previousState: { plan: payload.previousPlan },
      newState: { plan: payload.newPlan },
      plan: payload.newPlan,
    });
  }

  async handleSubscriptionDowngrade(payload) {
    return this.processEvent("subscription_downgraded", {
      shopId: payload.shopId,
      shopDomain: payload.shopDomain,
      eventData: {
        downgradedAt: new Date(),
      },
      previousState: { plan: payload.previousPlan },
      newState: { plan: payload.newPlan },
      plan: payload.newPlan,
    });
  }

  async handleReviewSubmitted(payload) {
    // First, update or create the merchant review record
    const review = await MerchantReviewModel.findOneAndUpdate(
      { myshopify_domain: payload.shopDomain },
      {
        shopId: payload.shopId,
        hasLeftReview: true,
        rating: payload.rating,
        reviewText: payload.reviewText || "",
        reviewDate: new Date(),
        source: payload.source || "shopify_app_store",
        merchantEmail: payload.merchantEmail || "",
        merchantName: payload.merchantName || "",
      },
      { upsert: true, new: true }
    );

    const result = await this.processEvent("review_submitted", {
      shopId: payload.shopId,
      shopDomain: payload.shopDomain,
      eventData: {
        reviewId: review._id,
        rating: payload.rating,
        reviewText: payload.reviewText,
      },
      newState: {
        hasReview: true,
        rating: payload.rating,
      },
      rating: payload.rating,
    });

    // Update review with email log reference
    if (result.emailLogId) {
      review.emailSentOnReview = true;
      review.emailLogId = result.emailLogId;
      await review.save();
    }

    return result;
  }

  // Query to get merchants with comprehensive data (for acceptance criteria)
  async getMerchantsAnalytics(filters = {}) {
    const pipeline = [
      // Start with shops collection
      {
        $lookup: {
          from: "subscriptions",
          localField: "myshopify_domain",
          foreignField: "myshopify_domain",
          as: "subscription",
        },
      },
      { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },

      // Get merchant reviews
      {
        $lookup: {
          from: "merchantreviews",
          localField: "myshopify_domain",
          foreignField: "myshopify_domain",
          as: "review",
        },
      },
      { $unwind: { path: "$review", preserveNullAndEmptyArrays: true } },

      // Get email logs
      {
        $lookup: {
          from: "emaillogs",
          localField: "myshopify_domain",
          foreignField: "myshopify_domain",
          as: "emails",
        },
      },

      // Get events for install status
      {
        $lookup: {
          from: "merchantevents",
          let: { shopDomain: "$myshopify_domain" },
          pipeline: [
            { $match: { $expr: { $eq: ["$myshopify_domain", "$$shopDomain"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "latestEvent",
        },
      },
      { $unwind: { path: "$latestEvent", preserveNullAndEmptyArrays: true } },

      // Project the required fields
      {
        $project: {
          _id: 1,
          shopId: 1,
          myshopify_domain: 1,
          shopName: 1,
          installStatus: {
            $cond: {
              if: { $eq: ["$latestEvent.eventType", "app_uninstalled"] },
              then: "uninstalled",
              else: "installed",
            },
          },
          subscriptionPlan: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$subscription.activeSubscriptions",
                      cond: { $eq: ["$$this.status", "active"] },
                    },
                  },
                  0,
                ],
              },
              { name: "Free" },
            ],
          },
          hasLeftReview: { $ifNull: ["$review.hasLeftReview", false] },
          reviewStars: { $ifNull: ["$review.rating", null] },
          reviewText: { $ifNull: ["$review.reviewText", ""] },
          reviewDate: { $ifNull: ["$review.reviewDate", null] },
          emailsSent: {
            $map: {
              input: "$emails",
              as: "email",
              in: {
                title: "$$email.emailTitle",
                sentAt: "$$email.sentAt",
                status: "$$email.status",
                eventTrigger: "$$email.eventTrigger",
              },
            },
          },
          lastEmailSentAt: {
            $max: "$emails.sentAt",
          },
          lastEmailTitle: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$emails",
                      cond: { $eq: ["$$this.sentAt", { $max: "$emails.sentAt" }] },
                    },
                  },
                  as: "lastEmail",
                  in: "$$lastEmail.emailTitle",
                },
              },
              0,
            ],
          },
        },
      },
    ];

    // Apply filters if provided
    if (filters.installStatus) {
      pipeline.push({
        $match: { installStatus: filters.installStatus },
      });
    }

    if (filters.hasReview !== undefined) {
      pipeline.push({
        $match: { hasLeftReview: filters.hasReview },
      });
    }

    if (filters.plan) {
      pipeline.push({
        $match: { "subscriptionPlan.name": filters.plan },
      });
    }

    return ShopModel.aggregate(pipeline);
  }
}

export const merchantEventService = new MerchantEventService();
