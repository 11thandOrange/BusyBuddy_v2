import AnnouncementBar from "../../models/announcementBar.model.js";
import Shop from "../../models/shop.model.js";
import activityLogService from "../../services/activityLogService.js";

const MAX_MESSAGE_LENGTH = 500;
const SAFE_CSS_COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\s]+\)|transparent|[a-zA-Z]{3,20})$/;

// Walks any nested settings object and flags string values under a
// *color*-named key that don't look like a real CSS color - covers every
// nested color schema (colorSettings, timerColorSettings, saveBoxSettings,
// emailButtonStyles, ...) without needing per-schema validators.
function collectInvalidColorFields(obj, path = "") {
  const invalid = [];
  if (!obj || typeof obj !== "object") return invalid;

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (value && typeof value === "object") {
      invalid.push(...collectInvalidColorFields(value, currentPath));
    } else if (/color/i.test(key) && typeof value === "string" && value.trim() !== "") {
      if (!SAFE_CSS_COLOR.test(value.trim())) {
        invalid.push(currentPath);
      }
    }
  }
  return invalid;
}

function isSafeHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// The editor UI (AnnouncementBarEditor.jsx) sends flat field names that don't
// match the Mongoose schema's nested sub-documents (colorSettings,
// messageDesktopFontSettings, saveBoxSettings, shopNowButtonSettings, ...) or
// the `type` enum's casing - so those fields were being silently stripped by
// Mongoose's strict mode, or in the case of `type`, throwing a validation
// error and blocking every save. This maps the editor's flat payload onto the
// schema shape the storefront extension actually reads, without touching the
// extension or the schema.
const BAR_TYPE_TO_SCHEMA_TYPE = {
  text: "Text",
  countdown: "Countdown Timer",
  freeshipping: "Free Shipping",
  orders: "Orders Counter",
  Email: "Email",
};

function mapEditorPayloadToSchema(body) {
  const mapped = { ...body };

  if (body.barType !== undefined) {
    mapped.type = BAR_TYPE_TO_SCHEMA_TYPE[body.barType] || body.type;
  }

  if (body.backgroundColor !== undefined) {
    mapped.colorSettings = { ...body.colorSettings, "Background Color": body.backgroundColor };
    mapped.generalColorSettings = {
      ...body.generalColorSettings,
      "Background Color": body.backgroundColor,
    };
  }
  if (body.textColor !== undefined) {
    mapped.generalColorSettings = {
      ...mapped.generalColorSettings,
      "Message Font Color": body.textColor,
    };
  }

  if (body.fontSize !== undefined || body.fontFamily !== undefined || body.fontWeight !== undefined) {
    mapped.messageDesktopFontSettings = {
      ...body.messageDesktopFontSettings,
      ...(body.fontSize !== undefined && { fontSize: `${body.fontSize}px` }),
      ...(body.fontFamily !== undefined && { fontFamily: body.fontFamily }),
      ...(body.fontWeight !== undefined && { fontWeight: body.fontWeight }),
    };
  }

  if (body.saveBoxBgColor !== undefined || body.saveBoxTextColor !== undefined) {
    mapped.saveBoxSettings = {
      ...body.saveBoxSettings,
      ...(body.saveBoxBgColor !== undefined && { backgroundColor: body.saveBoxBgColor }),
      ...(body.saveBoxTextColor !== undefined && { fontColor: body.saveBoxTextColor }),
    };
  }

  if (body.shopNowButtonBgColor !== undefined || body.shopNowButtonColor !== undefined) {
    mapped.shopNowButtonSettings = {
      ...body.shopNowButtonSettings,
      ...(body.shopNowButtonBgColor !== undefined && { backgroundColor: body.shopNowButtonBgColor }),
      ...(body.shopNowButtonColor !== undefined && { fontColor: body.shopNowButtonColor }),
    };
  }

  if (body.timerEndDate !== undefined) mapped.targetDate = body.timerEndDate;
  if (body.timerEndTime !== undefined) mapped.targetTime = body.timerEndTime;
  if (body.animationSpeed !== undefined) mapped.messageAnimationSpeed = body.animationSpeed;

  if (body.timerBgColor !== undefined) {
    mapped.timerColorSettings = {
      ...body.timerColorSettings,
      "Timer Block Background Color": body.timerBgColor,
    };
  }

  return mapped;
}

function validateAnnouncementBarData(data) {
  const errors = [];

  if (data.message !== undefined && typeof data.message === "string" && data.message.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`);
  }

  if (data.shopNowButtonUrl && !isSafeHttpUrl(data.shopNowButtonUrl)) {
    errors.push("Shop Now button URL must be a valid http(s) URL");
  }

  const invalidColorFields = collectInvalidColorFields(data);
  if (invalidColorFields.length > 0) {
    errors.push(`Invalid color value for: ${invalidColorFields.join(", ")}`);
  }

  if (data.barWidth !== undefined) {
    if (typeof data.barWidth !== "number") {
      errors.push("Bar width must be between 50 and 100 percent");
    }
  }

  if (data.barHeight !== undefined) {
    if (typeof data.barHeight !== "number") {
      errors.push("Bar height must be between 40 and 150 pixels");
    }
  }

  if (data.messageAnimationSpeed !== undefined) {
    if (
      typeof data.messageAnimationSpeed !== "number" ||
      data.messageAnimationSpeed < 5 ||
      data.messageAnimationSpeed > 60
    ) {
      errors.push("Message animation speed must be between 5 and 60 seconds");
    }
  }

  // if (data.targetDate !== undefined && data.targetDate !== "") {
  //   const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  //   if (!dateRegex.test(data.targetDate)) {
  //     errors.push("Target date must be in YYYY-MM-DD format");
  //   } else {
  //     const date = new Date(data.targetDate);
  //     if (isNaN(date.getTime())) {
  //       errors.push("Target date must be a valid date");
  //     }
  //   }
  // }

  // if (data.targetTime !== undefined && data.targetTime !== "") {
  //   const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  //   if (!timeRegex.test(data.targetTime)) {
  //     errors.push("Target time must be in HH:MM format");
  //   }
  // }

  if (data.waveAnimationSettings) {
    const { waveHeight, waveFrequency, waveCurvature } = data.waveAnimationSettings;

    if (waveHeight !== undefined && (typeof waveHeight !== "number" || waveHeight < 1 || waveHeight > 20)) {
      errors.push("Wave height must be between 1 and 20");
    }

    if (
      waveFrequency !== undefined &&
      (typeof waveFrequency !== "number" || waveFrequency < 1 || waveFrequency > 10)
    ) {
      errors.push("Wave frequency must be between 1 and 10");
    }

    if (
      waveCurvature !== undefined &&
      (typeof waveCurvature !== "number" || waveCurvature < 0.1 || waveCurvature > 0.9)
    ) {
      errors.push("Wave curvature must be between 0.1 and 0.9");
    }
  }

  return errors;
}

async function createAnnouncementBar(req, res) {
  try {
    const { shop } = res.locals.shopify.session;

    const validationErrors = validateAnnouncementBarData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const announcementBarData = {
      ...mapEditorPayloadToSchema(req.body),
      shopId: shopData._id,
    };

    if (!announcementBarData.internalName && announcementBarData.name) {
      announcementBarData.internalName = announcementBarData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (announcementBarData.status === "active" || announcementBarData.isBundleActive === true) {
      await AnnouncementBar.updateMany(
        { shopId: shopData._id, $or: [{ status: "active" }, { isBundleActive: true }] },
        { status: "inactive", isBundleActive: false }
      );
    }

    const announcementBar = new AnnouncementBar(announcementBarData);
    await announcementBar.save();

    // Log activity for announcement bar creation
    await activityLogService.logActivity({
      shopId: shop,
      type: "created",
      widget: "announcement",
      title: "New announcement bar created",
      meta: announcementBar.name || announcementBar.internalName,
      offerId: announcementBar._id,
    });

    res.status(201).json({
      success: true,
      message: "Announcement bar created successfully",
      data: announcementBar,
    });
  } catch (error) {
    console.error("Error creating announcement bar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement bar",
      error: error.message,
    });
  }
}

async function getAnnouncementBars(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { page = 1, limit = 10, status, isBundleActive } = req.query;

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const filter = { shopId: shopData._id };
    if (status !== undefined) filter.status = status;
    if (isBundleActive !== undefined) filter.isBundleActive = isBundleActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const announcementBars = await AnnouncementBar.find(filter)
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AnnouncementBar.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        announcementBars,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching announcement bars:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcement bars",
      error: error.message,
    });
  }
}

async function getAnnouncementBarById(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { id } = req.params;

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const announcementBar = await AnnouncementBar.findOne({
      _id: id,
      shopId: shopData._id,
    });

    if (!announcementBar) {
      return res.status(404).json({
        success: false,
        message: "Announcement bar not found",
      });
    }

    res.status(200).json({
      success: true,
      data: announcementBar,
    });
  } catch (error) {
    console.error("Error fetching announcement bar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcement bar",
      error: error.message,
    });
  }
}

async function updateAnnouncementBar(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { id } = req.params;

    const validationErrors = validateAnnouncementBarData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const updatePayload = mapEditorPayloadToSchema(req.body);

    if (updatePayload.name && !updatePayload.internalName) {
      updatePayload.internalName = updatePayload.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (updatePayload.status === "active" || updatePayload.isBundleActive === true) {
      await AnnouncementBar.updateMany(
        { shopId: shopData._id, _id: { $ne: id }, $or: [{ status: "active" }, { isBundleActive: true }] },
        { status: "inactive", isBundleActive: false }
      );
    }

    const announcementBar = await AnnouncementBar.findOneAndUpdate(
      { _id: id, shopId: shopData._id },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!announcementBar) {
      return res.status(404).json({
        success: false,
        message: "Announcement bar not found",
      });
    }

    // Log activity for announcement bar update
    await activityLogService.logActivity({
      shopId: shop,
      type: "updated",
      widget: "announcement",
      title: "Announcement bar updated",
      meta: announcementBar.name || announcementBar.internalName,
      offerId: announcementBar._id,
    });

    res.status(200).json({
      success: true,
      message: "Announcement bar updated successfully",
      data: announcementBar,
    });
  } catch (error) {
    console.error("Error updating announcement bar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update announcement bar",
      error: error.message,
    });
  }
}

async function deleteAnnouncementBar(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { id } = req.params;

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const announcementBar = await AnnouncementBar.findOneAndDelete({
      _id: id,
      shopId: shopData._id,
    });

    if (!announcementBar) {
      return res.status(404).json({
        success: false,
        message: "Announcement bar not found",
      });
    }

    // Log activity for announcement bar deletion
    await activityLogService.logActivity({
      shopId: shop,
      type: "deleted",
      widget: "announcement",
      title: "Announcement bar deleted",
      meta: announcementBar.name || announcementBar.internalName,
      offerId: announcementBar._id,
    });

    res.status(200).json({
      success: true,
      message: "Announcement bar deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting announcement bar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement bar",
      error: error.message,
    });
  }
}

async function toggleAnnouncementBarStatus(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { id } = req.params;
    const { status, isBundleActive } = req.body;

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
      if (status === "active") {
        await AnnouncementBar.updateMany(
          { shopId: shopData._id, status: "active", _id: { $ne: id } },
          { status: "inactive" }
        );
      }
    }

    if (isBundleActive !== undefined) {
      updateData.isBundleActive = isBundleActive;
      if (isBundleActive === true) {
        await AnnouncementBar.updateMany(
          { shopId: shopData._id, isBundleActive: true, _id: { $ne: id } },
          { isBundleActive: false }
        );
      }
    }

    const announcementBar = await AnnouncementBar.findOneAndUpdate(
      { _id: id, shopId: shopData._id },
      updateData,
      { new: true }
    );

    if (!announcementBar) {
      return res.status(404).json({
        success: false,
        message: "Announcement bar not found",
      });
    }

    // Log activity for status toggle
    const activityType = status === "active" ? "activated" : "deactivated";
    await activityLogService.logActivity({
      shopId: shop,
      type: activityType,
      widget: "announcement",
      title: `Announcement bar ${activityType}`,
      meta: announcementBar.name || announcementBar.internalName,
      offerId: announcementBar._id,
    });

    res.status(200).json({
      success: true,
      message: `Announcement bar status updated successfully`,
      data: announcementBar,
    });
  } catch (error) {
    console.error("Error toggling announcement bar status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle announcement bar status",
      error: error.message,
    });
  }
}

async function getActiveAnnouncementBar(req, res) {
  try {
    const { shop } = res.locals.shopify.session;

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const activeAnnouncementBar = await AnnouncementBar.findOne({
      shopId: shopData._id,
      $or: [{ status: "active" }, { isBundleActive: true }],
    });

    if (!activeAnnouncementBar) {
      return res.status(404).json({
        success: false,
        message: "No active announcement bar found",
      });
    }

    if (
      activeAnnouncementBar.showCountdown &&
      activeAnnouncementBar.startDate &&
      activeAnnouncementBar.endDate
    ) {
      const now = new Date();
      const startDate = new Date(activeAnnouncementBar.startDate);
      const endDate = new Date(activeAnnouncementBar.endDate);

      if (now < startDate) {
        return res.status(404).json({
          success: false,
          message: "Announcement bar countdown not yet started",
        });
      }

      if (now > endDate) {
        return res.status(404).json({
          success: false,
          message: "Announcement bar countdown has expired",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: activeAnnouncementBar,
    });
  } catch (error) {
    console.error("Error fetching active announcement bar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active announcement bar",
      error: error.message,
    });
  }
}

async function updateAnnouncementBarPriority(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { priorities } = req.body;

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const updatePromises = priorities.map(({ id, priority }) =>
      AnnouncementBar.findOneAndUpdate({ _id: id, shopId: shopData._id }, { priority }, { new: true })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Announcement bar priorities updated successfully",
    });
  } catch (error) {
    console.error("Error updating announcement bar priorities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update announcement bar priorities",
      error: error.message,
    });
  }
}

async function trackAnnouncementBarAnalytics(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { id } = req.params;
    const { action } = req.body;

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const updateField = {};
    if (action === "view") updateField.$inc = { views: 1 };
    if (action === "click") updateField.$inc = { clicks: 1 };
    if (action === "conversion") updateField.$inc = { conversions: 1 };

    if (!updateField.$inc) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'view', 'click', or 'conversion'",
      });
    }

    const announcementBar = await AnnouncementBar.findOneAndUpdate(
      { _id: id, shopId: shopData._id },
      updateField,
      { new: true }
    );

    if (!announcementBar) {
      return res.status(404).json({
        success: false,
        message: "Announcement bar not found",
      });
    }

    // Log individual event to activity log for real-time feed
    if (action === "view" || action === "click") {
      await activityLogService.logActivity({
        shopId: shop,
        type: action,
        widget: "announcement",
        title: announcementBar.title || "Announcement Bar",
        meta: action === "view" ? "viewed" : "clicked",
        offerId: announcementBar._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Analytics tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking announcement bar analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track analytics",
      error: error.message,
    });
  }
}

async function getAnnouncementBarAnalytics(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { range = "30d", dateFrom, dateTo } = req.query;

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Build date filter for main analytics
    const dateFilter = { shopId: shopData._id };
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    // Main analytics aggregation
    const analytics = await AnnouncementBar.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalClicks: { $sum: "$clicks" },
          totalAnnouncementBars: { $sum: 1 },
          activeAnnouncementBars: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalViews: 1,
          totalClicks: 1,
          totalAnnouncementBars: 1,
          activeAnnouncementBars: 1,
        },
      },
    ]);

    // NEW: Get trend data
    const trendData = await getTrendData(shopData._id, range, dateFrom, dateTo);

    const result =
      analytics.length > 0
        ? analytics[0]
        : {
            totalViews: 0,
            totalClicks: 0,
            totalAnnouncementBars: 0,
            activeAnnouncementBars: 0,
          };

    // Add trend data to result
    result.trend = trendData;

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching announcement bar analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
}

// NEW: Function to get trend data
async function getTrendData(shopId, range = "30d", dateFrom, dateTo) {
  try {
    // Calculate date range
    let startDate;
    const endDate = dateTo ? new Date(dateTo) : new Date();

    if (dateFrom) {
      startDate = new Date(dateFrom);
    } else {
      // Calculate start date based on range
      const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }

    // Group by date to get daily views and clicks
    const dailyData = await AnnouncementBar.aggregate([
      {
        $match: {
          shopId: shopId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          views: { $sum: "$views" },
          clicks: { $sum: "$clicks" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          date: "$_id",
          views: 1,
          clicks: 1,
          _id: 0,
        },
      },
    ]);

    // Fill in missing dates with zero values
    const filledData = fillMissingDates(dailyData, startDate, endDate);

    return filledData;
  } catch (error) {
    console.error("Error fetching trend data:", error);
    return [];
  }
}

// Helper function to fill missing dates
function fillMissingDates(data, startDate, endDate) {
  const result = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  // Create a map of existing data for easy lookup
  const dataMap = new Map();
  data.forEach((item) => {
    dataMap.set(item.date, item);
  });

  // Iterate through each day in the range
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const existingData = dataMap.get(dateStr);

    if (existingData) {
      result.push(existingData);
    } else {
      result.push({
        date: dateStr,
        views: 0,
        clicks: 0,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}
async function bulkDeleteAnnouncementBars(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "IDs array is required",
      });
    }

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const result = await AnnouncementBar.deleteMany({
      _id: { $in: ids },
      shopId: shopData._id,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} announcement bars deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting announcement bars:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement bars",
      error: error.message,
    });
  }
}

async function updateAnnouncementBarCountdown(req, res) {
  try {
    const { shop } = res.locals.shopify.session;
    const { id } = req.params;
    const { targetDate, targetTime, isTimerActive } = req.body;

    const shopData = await Shop.findOne({ myshopify_domain: shop });
    if (!shopData) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const validationErrors = validateAnnouncementBarData({ targetDate, targetTime });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    let countdown = { days: "00", hours: "00", minutes: "00", seconds: "00" };
    if (targetDate && targetTime) {
      const targetDateTime = new Date(`${targetDate}T${targetTime}:00`);
      const now = new Date();
      const difference = targetDateTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        countdown = {
          days: String(days).padStart(2, "0"),
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0"),
        };
      }
    }

    const announcementBar = await AnnouncementBar.findOneAndUpdate(
      { _id: id, shopId: shopData._id },
      {
        targetDate,
        targetTime,
        isTimerActive,
        countdown,
        showCountdown: isTimerActive && targetDate && targetTime,
      },
      { new: true, runValidators: true }
    );

    if (!announcementBar) {
      return res.status(404).json({
        success: false,
        message: "Announcement bar not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Countdown updated successfully",
      data: {
        targetDate: announcementBar.targetDate,
        targetTime: announcementBar.targetTime,
        isTimerActive: announcementBar.isTimerActive,
        countdown: announcementBar.countdown,
        showCountdown: announcementBar.showCountdown,
      },
    });
  } catch (error) {
    console.error("Error updating countdown:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update countdown",
      error: error.message,
    });
  }
}

export {
  createAnnouncementBar,
  getAnnouncementBars,
  getAnnouncementBarById,
  updateAnnouncementBar,
  deleteAnnouncementBar,
  toggleAnnouncementBarStatus,
  getActiveAnnouncementBar,
  updateAnnouncementBarPriority,
  trackAnnouncementBarAnalytics,
  getAnnouncementBarAnalytics,
  bulkDeleteAnnouncementBars,
  updateAnnouncementBarCountdown,
  validateAnnouncementBarData,
  mapEditorPayloadToSchema,
  BAR_TYPE_TO_SCHEMA_TYPE,
};
