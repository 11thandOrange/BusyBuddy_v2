import mongoose from "mongoose";

const merchantReviewSchema = new mongoose.Schema({
  shopId: {
    type: String,
    required: true,
    index: true,
  },
  myshopify_domain: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  merchantEmail: {
    type: String,
    default: "",
  },
  merchantName: {
    type: String,
    default: "",
  },
  hasLeftReview: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  reviewText: {
    type: String,
    default: "",
  },
  reviewDate: {
    type: Date,
    default: null,
  },
  source: {
    type: String,
    enum: ["shopify_app_store", "in_app", "external"],
    default: "shopify_app_store",
  },
  reviewUrl: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  respondedAt: {
    type: Date,
    default: null,
  },
  responseText: {
    type: String,
    default: null,
  },
  emailSentOnReview: {
    type: Boolean,
    default: false,
  },
  emailLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmailLog",
    default: null,
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

merchantReviewSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const MerchantReviewModel = mongoose.model("MerchantReview", merchantReviewSchema);

export default MerchantReviewModel;
