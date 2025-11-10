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
  isShowCountDownTimer: { type: Boolean, default: false },
  addEmoji: { type: Boolean, default: false },
  topMargin: { type: Number },
  bottomMargin: { type: Number },
  cardCornerRadius: { type: Number },
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
