import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  shopId: {
    type: String,
  },
  myshopify_domain: {
    type: String,
  },
  shopName: {
    type: String,
  },
  shopDomain: {
    type: String,
  },
  shopCountry: {
    type: String,
  },
  status: {
    type: String,
  },
  data: {
    type: Object,
    default: {},
  },
  // Referral tracking fields
  referral_code: {
    type: String,
    index: true,
  },
  referral_source: {
    type: String,
  },
  referral_campaign: {
    type: String,
  },
  installed_at: {
    type: Date,
  },
  paid_at: {
    type: Date,
  },
});

const shopModel = mongoose.model("shop", shopSchema);

export default shopModel;
