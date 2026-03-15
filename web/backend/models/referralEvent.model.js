import mongoose from "mongoose";

const referralEventSchema = new mongoose.Schema({
  referral_code: {
    type: String,
    required: true,
    index: true,
  },
  event_type: {
    type: String,
    required: true,
    enum: ["click", "install", "paid"],
    index: true,
  },
  shop_domain: {
    type: String,
  },
  myshopify_domain: {
    type: String,
  },
  plan_name: {
    type: String,
  },
  source: {
    type: String,
  },
  campaign: {
    type: String,
  },
  metadata: {
    type: Object,
    default: {},
  },
  occurred_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient queries
referralEventSchema.index({ referral_code: 1, event_type: 1 });
referralEventSchema.index({ referral_code: 1, occurred_at: -1 });

const referralEventModel = mongoose.model("referralevent", referralEventSchema);

export default referralEventModel;
