import mongoose from "mongoose";
import { Schema } from "mongoose";

const emailListSchema = new mongoose.Schema(
  {
    listId: { type: String, required: true },
    listName: { type: String, required: true },
    memberCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const emailTemplateSchema = new mongoose.Schema(
  {
    templateId: { type: String, required: true },
    templateName: { type: String, required: true },
    type: { type: String, default: "regular" },
  },
  { _id: false }
);

const emailProviderSchema = new mongoose.Schema(
  {
    shopId: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      ref: 'Shop',
      unique: true 
    },
    provider: { 
      type: String, 
      enum: ['mailchimp', 'klaviyo', 'sendgrid', 'mailerlite', 'none'],
      required: true,
      default: 'none'
    },
    apiKey: { 
      type: String, 
      required: function() { return this.provider !== 'none'; }
    },
    serverPrefix: { 
      type: String,
      default: "" 
    }, // For Mailchimp (e.g., us1, us2, etc.)
    isConnected: { 
      type: Boolean, 
      default: false 
    },
    connectedAt: { 
      type: Date 
    },
    lastSyncedAt: { 
      type: Date 
    },
    lists: [emailListSchema],
    templates: [emailTemplateSchema],
    defaultListId: { 
      type: String, 
      default: "" 
    },
    subscriptionCount: { 
      type: Number, 
      default: 0 
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
emailProviderSchema.index({ shopId: 1 });
emailProviderSchema.index({ shopId: 1, isConnected: 1 });

const EmailProvider = mongoose.model("EmailProvider", emailProviderSchema);

export default EmailProvider;
