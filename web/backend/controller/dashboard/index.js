import ActivityLog from "../../models/activityLog.model.js";

// GET /api/dashboard/summary?range=7d|30d|90d
// Aggregates real per-widget performance from ActivityLog - no placeholder
// numbers. Fields with no underlying data come back with hasData:false so
// the frontend can render an explicit "no data" message instead of a 0.

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };

// Widget slugs as stored on ActivityLog.widget
const WIDGET_SLUGS = ["bundle", "bogo", "volume", "mix-match", "announcement", "inactive-tab"];

// Maps ActivityLog widget slugs to the frontend widget ids
const SLUG_TO_WIDGET_ID = {
  bundle: "bundle-discount",
  bogo: "buy-one-get-one",
  volume: "volume-discounts",
  "mix-match": "mix-and-match",
  announcement: "announcement-bar",
  "inactive-tab": "inactive-tab-message",
};

// Only the Announcement Bar has storefront view/click tracking wired up
// today (see controller/announcementBars/index.js#trackAnnouncementBarAnalytics).
// Bundle-type widgets and the Inactive Tab Message have no impression
// instrumentation, so their impressions/CTR are reported as untracked
// rather than a misleading 0.
const IMPRESSION_TRACKED_SLUGS = ["announcement"];

function resolveRange(rangeParam) {
  return RANGE_DAYS[rangeParam] ? rangeParam : "7d";
}

async function aggregateTotalsByWidget(shopDomain, start, end) {
  const rows = await ActivityLog.aggregate([
    {
      $match: {
        shopId: shopDomain,
        createdAt: { $gte: start, $lt: end },
        type: { $in: ["purchase", "view", "click"] },
      },
    },
    {
      $group: {
        _id: "$widget",
        revenue: { $sum: { $cond: [{ $eq: ["$type", "purchase"] }, { $ifNull: ["$amount", 0] }, 0] } },
        purchaseCount: { $sum: { $cond: [{ $eq: ["$type", "purchase"] }, 1, 0] } },
        views: { $sum: { $cond: [{ $eq: ["$type", "view"] }, 1, 0] } },
        clicks: { $sum: { $cond: [{ $eq: ["$type", "click"] }, 1, 0] } },
      },
    },
  ]);

  const bySlug = {};
  for (const row of rows) {
    bySlug[row._id] = row;
  }
  return bySlug;
}

async function aggregateDailyRevenueByWidget(shopDomain, start, end) {
  const rows = await ActivityLog.aggregate([
    {
      $match: {
        shopId: shopDomain,
        createdAt: { $gte: start, $lt: end },
        type: "purchase",
      },
    },
    {
      $group: {
        _id: { widget: "$widget", day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
        revenue: { $sum: { $ifNull: ["$amount", 0] } },
      },
    },
    { $sort: { "_id.day": 1 } },
  ]);

  const byWidget = {};
  const allWidgetsByDay = {};
  for (const row of rows) {
    const { widget, day } = row._id;
    if (!byWidget[widget]) byWidget[widget] = [];
    byWidget[widget].push({ date: day, revenue: row.revenue });
    allWidgetsByDay[day] = (allWidgetsByDay[day] || 0) + row.revenue;
  }

  const overallTrend = Object.keys(allWidgetsByDay)
    .sort()
    .map((day) => ({ date: day, revenue: allWidgetsByDay[day] }));

  return { byWidget, overallTrend };
}

function buildRevenueSummary(currentTotal, previousTotal, trend) {
  let change = null;
  if (previousTotal > 0) {
    change = {
      pct: ((currentTotal - previousTotal) / previousTotal) * 100,
      kind: currentTotal >= previousTotal ? "up" : "down",
    };
  } else if (currentTotal > 0) {
    change = { pct: null, kind: "new" };
  }

  return {
    amount: currentTotal,
    hasData: currentTotal > 0,
    change,
    trend,
  };
}

function buildWidgetSummary(slug, totals = {}, trend = []) {
  const revenueAmount = totals.revenue || 0;
  const purchaseCount = totals.purchaseCount || 0;
  const tracked = IMPRESSION_TRACKED_SLUGS.includes(slug);
  const views = totals.views || 0;
  const clicks = totals.clicks || 0;

  return {
    id: SLUG_TO_WIDGET_ID[slug],
    revenue: {
      amount: revenueAmount,
      purchaseCount,
      hasData: purchaseCount > 0,
      trend: purchaseCount > 0 ? trend : [],
    },
    impressions: {
      tracked,
      hasData: tracked && views > 0,
      views: tracked ? views : null,
      clicks: tracked ? clicks : null,
      ctr: tracked && views > 0 ? (clicks / views) * 100 : null,
    },
  };
}

async function getDashboardSummary(req, res) {
  try {
    const session = res.locals.shopify?.session;
    if (!session?.shop) {
      return res.status(401).json({
        status: "ERROR",
        message: "Unauthorized - No shop session",
      });
    }

    const shopDomain = session.shop;
    const range = resolveRange(req.query.range);
    const days = RANGE_DAYS[range];
    const now = new Date();
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

    const [currentTotals, previousTotals, dailyRevenue] = await Promise.all([
      aggregateTotalsByWidget(shopDomain, currentStart, now),
      aggregateTotalsByWidget(shopDomain, previousStart, currentStart),
      aggregateDailyRevenueByWidget(shopDomain, currentStart, now),
    ]);

    const widgets = WIDGET_SLUGS.map((slug) =>
      buildWidgetSummary(slug, currentTotals[slug], dailyRevenue.byWidget[slug])
    );

    const currentRevenueTotal = widgets.reduce((sum, w) => sum + w.revenue.amount, 0);
    const previousRevenueTotal = WIDGET_SLUGS.reduce((sum, slug) => sum + (previousTotals[slug]?.revenue || 0), 0);
    const purchaseCountTotal = widgets.reduce((sum, w) => sum + w.revenue.purchaseCount, 0);

    const trackedViews = IMPRESSION_TRACKED_SLUGS.reduce((sum, slug) => sum + (currentTotals[slug]?.views || 0), 0);
    const trackedClicks = IMPRESSION_TRACKED_SLUGS.reduce((sum, slug) => sum + (currentTotals[slug]?.clicks || 0), 0);

    res.json({
      status: "SUCCESS",
      data: {
        range,
        revenue: buildRevenueSummary(currentRevenueTotal, previousRevenueTotal, dailyRevenue.overallTrend),
        avgOrderValue: purchaseCountTotal > 0 ? currentRevenueTotal / purchaseCountTotal : null,
        purchaseCount: purchaseCountTotal,
        impressions: {
          hasData: trackedViews > 0,
          views: trackedViews,
          clicks: trackedClicks,
          ctr: trackedViews > 0 ? (trackedClicks / trackedViews) * 100 : null,
          trackedWidgetIds: IMPRESSION_TRACKED_SLUGS.map((slug) => SLUG_TO_WIDGET_ID[slug]),
        },
        widgets,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to fetch dashboard summary",
    });
  }
}

export { getDashboardSummary };
