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
});

const shopModel = mongoose.model("shop", shopSchema);

export default shopModel;
