import mongoose from "mongoose";

const InactiveTabSchema = mongoose.Schema(
  {
    myshopify_domain: {
      type: String,
      required: true,
      unique: true,
    },
    message: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const InactiveTabModel = mongoose.model("InactiveTab", InactiveTabSchema);

export default InactiveTabModel;
