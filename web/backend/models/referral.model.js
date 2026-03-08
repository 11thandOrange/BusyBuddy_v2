import mongoose from "mongoose";
import crypto from "crypto";

const referralSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
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

// Generate unique referral code before save
referralSchema.pre("save", function (next) {
  if (!this.code) {
    this.code = crypto.randomBytes(6).toString("hex");
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
