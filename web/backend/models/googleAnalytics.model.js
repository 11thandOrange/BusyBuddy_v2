import mongoose from "mongoose";

const googleAnalyticsSchema = new mongoose.Schema({
  shopDomain: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  googleEmail: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  tokenExpiresAt: {
    type: Date,
    required: true,
  },
  propertyId: {
    type: String,
    default: null,
  },
  propertyName: {
    type: String,
    default: null,
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
googleAnalyticsSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const GoogleAnalytics = mongoose.model("GoogleAnalytics", googleAnalyticsSchema);

export default GoogleAnalytics;
