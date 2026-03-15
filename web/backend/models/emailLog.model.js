import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema({
  shopId: {
    type: String,
    required: true,
    index: true,
  },
  myshopify_domain: {
    type: String,
    required: true,
    index: true,
  },
  merchantEmail: {
    type: String,
    required: true,
  },
  merchantName: {
    type: String,
    default: "",
  },
  emailType: {
    type: String,
    enum: [
      "welcome",
      "goodbye",
      "upgrade_confirmation",
      "downgrade_confirmation",
      "review_thank_you",
      "onboarding_tips",
      "survey",
      "custom",
    ],
    required: true,
  },
  emailTitle: {
    type: String,
    required: true,
  },
  eventTrigger: {
    type: String,
    enum: [
      "app_installed",
      "app_uninstalled",
      "subscription_upgraded",
      "subscription_downgraded",
      "review_submitted",
      "manual",
    ],
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MerchantEvent",
    default: null,
  },
  mailchimpData: {
    campaignId: { type: String, default: null },
    memberId: { type: String, default: null },
    listId: { type: String, default: null },
    templateId: { type: String, default: null },
  },
  status: {
    type: String,
    enum: ["pending", "sent", "delivered", "failed", "bounced", "opened", "clicked"],
    default: "pending",
    index: true,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  errorCode: {
    type: String,
    default: null,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  maxRetries: {
    type: Number,
    default: 3,
  },
  sentAt: {
    type: Date,
    default: null,
    index: true,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  openedAt: {
    type: Date,
    default: null,
  },
  clickedAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

emailLogSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

emailLogSchema.index({ myshopify_domain: 1, sentAt: -1 });
emailLogSchema.index({ status: 1, createdAt: -1 });

const EmailLogModel = mongoose.model("EmailLog", emailLogSchema);

export default EmailLogModel;
