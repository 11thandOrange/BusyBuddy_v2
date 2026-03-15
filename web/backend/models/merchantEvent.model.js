import mongoose from "mongoose";

const merchantEventSchema = new mongoose.Schema({
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
  eventType: {
    type: String,
    enum: [
      "app_installed",
      "app_uninstalled",
      "subscription_upgraded",
      "subscription_downgraded",
      "review_submitted",
    ],
    required: true,
    index: true,
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  previousState: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  newState: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  emailTriggered: {
    type: Boolean,
    default: false,
  },
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmailLog",
    default: null,
  },
  processed: {
    type: Boolean,
    default: false,
  },
  processedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

merchantEventSchema.index({ myshopify_domain: 1, eventType: 1, createdAt: -1 });

const MerchantEventModel = mongoose.model("MerchantEvent", merchantEventSchema);

export default MerchantEventModel;
