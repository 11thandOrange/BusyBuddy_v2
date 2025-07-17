import mongoose from "mongoose";
import { Schema } from "mongoose";

const fontSettingsSchema = new mongoose.Schema({
  fontSize: { type: String, default: "16px" },
  fontFamily: { type: String, default: "Inter" },
  fontWeight: { type: String, default: "600" },
  letterSpacing: { type: String, default: "0px" },
  lineHeight: { type: String, default: "1.2" },
  fontCase: { type: String, enum: ["uppercase", "lowercase", "capitalize", "none"], default: "none" }
}, { _id: false });

const colorSettingsSchema = new mongoose.Schema({
  "Background Color": { type: String, default: "#a18c8c" }
}, { _id: false });

const generalColorSettingsSchema = new mongoose.Schema({
  "Background Color": { type: String, default: "#007bff" },
  "Message Font Color": { type: String, default: "#ffffff" }
}, { _id: false });

const timerColorSettingsSchema = new mongoose.Schema({
  "Timer Numbers Font Color": { type: String, default: "#ffffff" },
  "Timer Labels Font Color": { type: String, default: "#ffffff" },
  "Timer Separator Color": { type: String, default: "#ffffff" },
  "Timer Block Background Color": { type: String, default: "transparent" },
  "Timer Block Border Color": { type: String, default: "transparent" }
}, { _id: false });

const timerLabelSettingsSchema = new mongoose.Schema({
  showDaysLabel: { type: Boolean, default: true },
  showHoursLabel: { type: Boolean, default: true },
  showMinutesLabel: { type: Boolean, default: true },
  showSecondsLabel: { type: Boolean, default: true },
  fontSize: { type: String, default: "10px" },
  fontFamily: { type: String, default: "Inter" },
  fontWeight: { type: String, default: "400" },
  fontCase: { type: String, enum: ["uppercase", "lowercase", "capitalize", "none"], default: "uppercase" }
}, { _id: false });

const timerBlockSettingsSchema = new mongoose.Schema({
  showSeparators: { type: Boolean, default: true },
  roundedCorners: { type: String, default: "4px" },
  spacing: { type: String, default: "10px" }
}, { _id: false });

const endSaleMessageSettingsSchema = new mongoose.Schema({
  backgroundColor: { type: String, default: "#FF0000" },
  fontColor: { type: String, default: "#FFFFFF" },
  fontSize: { type: String, default: "16px" },
  fontFamily: { type: String, default: "Inter" },
  fontWeight: { type: String, default: "700" }
}, { _id: false });

const shopNowButtonSettingsSchema = new mongoose.Schema({
  backgroundColor: { type: String, default: "#000000" },
  fontColor: { type: String, default: "#FFFFFF" },
  fontSize: { type: String, default: "14px" },
  fontFamily: { type: String, default: "Inter" },
  fontWeight: { type: String, default: "600" },
  padding: { type: String, default: "8px 15px" },
  borderRadius: { type: String, default: "5px" },
  borderColor: { type: String, default: "#000000" }
}, { _id: false });

const saveBoxSettingsSchema = new mongoose.Schema({
  backgroundColor: { type: String, default: "#FFFF00" },
  fontColor: { type: String, default: "#000000" },
  fontSize: { type: String, default: "14px" },
  fontFamily: { type: String, default: "Inter" },
  fontWeight: { type: String, default: "700" },
  padding: { type: String, default: "5px 10px" },
  borderRadius: { type: String, default: "3px" },
  borderColor: { type: String, default: "#FFFF00" }
}, { _id: false });

const waveAnimationSettingsSchema = new mongoose.Schema({
  waveHeight: { type: Number, default: 10 },
  waveFrequency: { type: Number, default: 2 },
  waveCurvature: { type: Number, default: 0.5 }
}, { _id: false });

const countdownSettingsSchema = new mongoose.Schema({
  days: { type: String, default: "00" },
  hours: { type: String, default: "00" },
  minutes: { type: String, default: "00" },
  seconds: { type: String, default: "00" }
}, { _id: false });

const announcementBarSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    status: { type: String, enum: ["active", "inactive"], default: "active" }, 
    message: { type: String, required: true, default: "Text is ticking" }, 
    
    internalName: { type: String }, 
    priority: { type: Number, default: 1 },
    isBundleActive: { type: Boolean, default: true }, 
    
    barPosition: { type: String, default: "top" },
    barWidth: { type: Number, default: 100 },
    barHeight: { type: Number, default: 60 },
    
    showMessage: { type: Boolean, default: true }, 
    animateMessage: { type: Boolean, default: true },
    messageAnimationSpeed: { type: Number, default: 20 },
    
    selectedTheme: { 
      type: String, 
      enum: ["solid", "sunshine", "watercolor", "abstract", "christmas", "circles", "holidays", "squares", "image-upload"], 
      default: "solid" 
    },
    uploadedImage: { type: String }, 
    customCSS: { type: String, default: "" },
    isCustomCSSEnabled: { type: Boolean, default: false },
    
    waveAnimationSettings: { type: waveAnimationSettingsSchema, default: () => ({}) },
    
    colorSettings: { type: colorSettingsSchema, default: () => ({ "Background Color": "#a18c8c" }) },
    generalColorSettings: { type: generalColorSettingsSchema, default: () => ({ "Background Color": "#007bff", "Message Font Color": "#ffffff" }) },
    
    messageDesktopFontSettings: { 
      type: fontSettingsSchema, 
      default: () => ({ fontSize: "18px", fontFamily: "Inter", fontWeight: "600", letterSpacing: "0px", lineHeight: "1.2" }) 
    },
    messageMobileFontSettings: { 
      type: fontSettingsSchema, 
      default: () => ({ fontSize: "16px", fontFamily: "Inter", fontWeight: "600", letterSpacing: "0px", lineHeight: "1.2" }) 
    },
    desktopFontSettings: { 
      type: fontSettingsSchema, 
      default: () => ({ fontSize: "18px", fontFamily: "Inter", fontWeight: "600", letterSpacing: "0px", lineHeight: "1.2" }) 
    },
    mobileFontSettings: { 
      type: fontSettingsSchema, 
      default: () => ({ fontSize: "16px", fontFamily: "Inter", fontWeight: "600", letterSpacing: "0px", lineHeight: "1.2" }) 
    },
    desktopMessageFontSettings: { 
      type: fontSettingsSchema, 
      default: () => ({ fontSize: "18px", fontFamily: "Inter", fontWeight: "600", letterSpacing: "0px", lineHeight: "1.2" }) 
    },
    mobileMessageFontSettings: { 
      type: fontSettingsSchema, 
      default: () => ({ fontSize: "16px", fontFamily: "Inter", fontWeight: "600", letterSpacing: "0px", lineHeight: "1.2" }) 
    },
    
    showTimer: { type: Boolean, default: true }, 
    showCountdown: { type: Boolean, default: false },
    isTimerActive: { type: Boolean, default: false },
    targetDate: { type: String, default: "" },
    targetTime: { type: String, default: "" },
    countdown: { type: countdownSettingsSchema, default: () => ({}) },
    startDate: { type: Date, default: Date.now }, 
    endDate: { type: Date, default: Date.now }, 
    timezone: { type: String, default: "GMT" }, 
    showTimerBlockBackground: { type: Boolean, default: false }, 
    showTimerBlockBorder: { type: Boolean, default: false }, 
    
    timerDesktopFontSettings: { 
      type: fontSettingsSchema, 
      default: () => ({ fontSize: "32px", fontFamily: "Inter", fontWeight: "700", letterSpacing: "0px", lineHeight: "1.2" }) 
    },
    timerMobileFontSettings: { 
      type: fontSettingsSchema, 
      default: () => ({ fontSize: "24px", fontFamily: "Inter", fontWeight: "700", letterSpacing: "0px", lineHeight: "1.2" }) 
    },
    timerLabelSettings: { type: timerLabelSettingsSchema, default: () => ({}) },
    timerBlockSettings: { type: timerBlockSettingsSchema, default: () => ({}) },
    timerColorSettings: { type: timerColorSettingsSchema, default: () => ({}) },
    
    showEndSaleMessage: { type: Boolean, default: false }, 
    endSaleMessage: { type: String, default: "End Sale in" }, 
    endSaleMessageSettings: { type: endSaleMessageSettingsSchema, default: () => ({}) },
    
    showShopNowButton: { type: Boolean, default: true }, 
    shopNowButtonText: { type: String, default: "Shop Now" }, 
    animateShopNowButton: { type: Boolean, default: false }, 
    shopNowButtonSettings: { type: shopNowButtonSettingsSchema, default: () => ({}) },
    
    showSaveBox: { type: Boolean, default: false }, 
    saveBoxText: { type: String, default: "SAVE 30%" }, 
    saveBoxSettings: { type: saveBoxSettingsSchema, default: () => ({}) },
    
    showEditMessageOptions: { type: Boolean, default: false },
    showMessageOptions: { type: Boolean, default: false },
    showsaveOptions: { type: Boolean, default: false },
    showendsaleOptions: { type: Boolean, default: false },
    showTimerOptions: { type: Boolean, default: false },
    showEmojiPickerMessage: { type: Boolean, default: false },
    showEmojiPickerEndSale: { type: Boolean, default: false },
    
    selectedIndex: { type: Number, default: 0 }, 
    
    count: { type: Number, default: 50 }, 
    isAvailableLongTime: { type: Boolean, default: false }, 
    
    shopId: { type: Schema.Types.ObjectId, required: true },
    
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

announcementBarSchema.virtual('ctr').get(function() {
  return this.views > 0 ? ((this.clicks / this.views) * 100).toFixed(2) : 0;
});

announcementBarSchema.virtual('conversionRate').get(function() {
  return this.clicks > 0 ? ((this.conversions / this.clicks) * 100).toFixed(2) : 0;
});

announcementBarSchema.index({ shopId: 1, status: 1 });
announcementBarSchema.index({ shopId: 1, isActive: 1 });
announcementBarSchema.index({ priority: 1 });
announcementBarSchema.index({ scheduleStart: 1, scheduleEnd: 1 });

const AnnouncementBar = mongoose.model("AnnouncementBar", announcementBarSchema);

export default AnnouncementBar; 