import mongoose from "mongoose";
import { Schema } from "mongoose";
const widgetAppearanceSchema = new mongoose.Schema({
  primaryTextColor: { type: String },
  secondaryTextColor: { type: String },
  PrimaryBackgroundColor: { type: String },
  secondaryBackgroundColor: { type: String },
  borderColor: { type: String },
  buttonColor: { type: String },
  offerTagBackgroundColor: { type: String },
  offerTagTextColor: { type: String },
  offerTagTheme: { type: String, default: "classic" },
  isShowCountDownTimer: { type: Boolean, default: false },
  addEmoji: { type: Boolean, default: false },
  topMargin: { type: Number },
  bottomMargin: { type: Number },
  cardCornerRadius: { type: Number },
  addToCartText: { type: String },
  addToCartBgColor: { type: String },
  addToCartTextColor: { type: String },
  showSkipButton: { type: Boolean },
  skipButtonText: { type: String },
  skipButtonBgColor: { type: String },
  skipButtonTextColor: { type: String },
  getYBannerColor: { type: String },
  getYBannerTextColor: { type: String },
});

const bundleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    products: [{ type: Object }],
    productsX: [{ type: Object }],
    productsY: [{ type: Object }],
    quantityBreaks: [{ type: Object }],
    tierDiscounts: [{ type: Object }],
    description: { type: String },
    specs: [{ type: Object }],
    secondaryMessage: { type: String },
    primaryMessage: { type: String },
    selectedEmoji: { type: String },
    emojiPosition: { type: String },
    countdownLabel: { type: String },
    addToCartText: { type: String },
    skipOfferText: { type: String },
    showSkipButton: { type: Boolean },
    selectedTier: { type: Number },
    discountType: { type: String, required: true },
    discountValue: { type: Number },
    internalName: { type: String, required: true },
    priority: { type: Number, required: true },
    status: { type: Boolean, required: true },
    widgetAppearance: { type: widgetAppearanceSchema, default: () => ({}) },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    shopId: { type: Schema.Types.ObjectId, required: true },
    shopifyBundleId: { type: String,  },
  },
  { timestamps: true }
);

const bundleModel = mongoose.model("bundle", bundleSchema);

export default bundleModel;
