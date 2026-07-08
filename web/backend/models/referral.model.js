import mongoose from "mongoose";
import crypto from "crypto";

const referralSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // Separate from `code`: `code` is embedded in public, shareable referral
  // links (/:code/redirect, /:code/url) so it cannot double as a secret.
  // `partner_token` gates access to the partner's own financial data
  // (analytics/mrr/commission/dashboard) and must only ever be given to
  // that partner directly, never included in a shareable URL.
  partner_token: {
    type: String,
    unique: true,
    sparse: true,
    select: false,
  },
  partner_name: {
    type: String,
    required: true,
  },
  payout_percent: {
    type: Number,
    default: 10,
    min: 0,
    max: 100,
  },
  source: {
    type: String,
    default: "partner",
  },
  campaign: {
    type: String,
    default: "default",
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  metadata: {
    type: Object,
    default: {},
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique referral code and partner token before save
referralSchema.pre("save", function (next) {
  if (!this.code) {
    this.code = crypto.randomBytes(6).toString("hex");
  }
  if (!this.partner_token) {
    this.partner_token = crypto.randomBytes(24).toString("hex");
  }
  this.updated_at = new Date();
  next();
});

// Static method to generate a unique code
referralSchema.statics.generateUniqueCode = async function () {
  let code;
  let exists = true;

  while (exists) {
    code = crypto.randomBytes(6).toString("hex");
    exists = await this.findOne({ code });
  }

  return code;
};

const referralModel = mongoose.model("referral", referralSchema);

export default referralModel;
