import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Megaphone,
  Package,
  Gift,
  Layers,
  Shuffle,
  Plus,
  Settings,
  DollarSign,
  Eye,
  ExternalLink,
  Zap,
  TrendingUp,
  TrendingDown,
  Lock,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import "./DashboardHome.css";

// Widget configuration: routes, plus the visual identity (icon/colors) and
// short subtitle from the "Mockup A: Performance-first dashboard" reference,
// and the subscriptionConfig app id used to read real plan-access/enabled
// state from the subscription API. Order matches the reference layout.
const widgetConfig = [
  {
    id: "announcement-bar",
    appId: "announcement_bar",
    title: "Announcement Bar",
    subtitle: "Top-of-store alerts & promos",
    icon: Megaphone,
    iconBg: "#eef0ff",
    accent: "#4f46e5",
    editorRoute: "/announcement-bar/editor",
    manageRoute: "/announcement-bar",
  },
  {
    id: "bundle-discount",
    appId: "bundle_discount",
    title: "Bundle Discounts",
    subtitle: "Product bundles · auto discounts",
    icon: Package,
    iconBg: "#eaf3ff",
    accent: "#0b76ef",
    editorRoute: "/bundle-discount/editor",
    manageRoute: "/bundle-discount",
  },
  {
    id: "buy-one-get-one",
    appId: "buy_one_get_one",
    title: "Buy One Get One",
    subtitle: "BOGO deals & free gifts",
    icon: Gift,
    iconBg: "#e8fbee",
    accent: "#0f7a3b",
    editorRoute: "/buy-one-get-one/editor",
    manageRoute: "/buy-one-get-one",
  },
  {
    id: "volume-discounts",
    appId: "volume_discounts",
    title: "Volume Discounts",
    subtitle: "Quantity tiers & bulk savings",
    icon: Layers,
    iconBg: "#fdecec",
    accent: "#d63535",
    editorRoute: "/volume-discounts/editor",
    manageRoute: "/volume-discounts",
  },
  {
    id: "mix-and-match",
    appId: "mix_match",
    title: "Mix & Match",
    subtitle: "Customer-built custom bundles",
    icon: Shuffle,
    iconBg: "#f2e8ff",
    accent: "#7c3aed",
    editorRoute: "/mix-and-match/editor",
    manageRoute: "/mix-and-match",
  },
  {
    id: "inactive-tab-message",
    appId: "inactive_tab",
    title: "Inactive Tab Message",
    subtitle: "Re-engage tab-switchers",
    icon: Eye,
    iconBg: "#f4f4f2",
    accent: "#6b7280",
    settingsRoute: "/inactive-tab-message?tab=settings",
    manageRoute: "/inactive-tab-message",
  },
];

// Mirrors controller/dashboard/index.js#IMPRESSION_TRACKED_SLUGS - used only
// as a safe default while the summary request is in flight.
const IMPRESSION_TRACKED_WIDGET_IDS = ["announcement-bar"];

// Maps ActivityLog widget slugs (returned by /api/activity/recent) to widget
// ids, so "Recently edited" can rank widgets by their real last-touched event
// instead of a fabricated timestamp.
const ACTIVITY_SLUG_TO_WIDGET_ID = {
  bundle: "bundle-discount",
  bogo: "buy-one-get-one",
  volume: "volume-discounts",
  "mix-match": "mix-and-match",
  announcement: "announcement-bar",
  "inactive-tab": "inactive-tab-message",
};

const RANGE_OPTIONS = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
];

const SORT_OPTIONS = [
  { id: "revenue", label: "Revenue ↓" },
  { id: "impressions", label: "Impressions" },
  { id: "recent", label: "Recently edited" },
];

const ACTIVITY_REFRESH_MS = 30000;
const ACTIVITY_VISIBLE_COUNT = 5;

const EMPTY_WIDGET_METRICS = {
  revenue: { amount: 0, purchaseCount: 0, hasData: false, trend: [] },
  impressions: { tracked: false, hasData: false, views: null, clicks: null, ctr: null },
};

function formatMoney(amount) {
  const rounded = Math.round(Number(amount) || 0);
  return `$${rounded.toLocaleString("en-US")}`;
}

function formatCompactNumber(n) {
  const value = Number(n) || 0;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}

function Sparkline({ data, color }) {
  if (!data || data.length === 0) return null;
  const gradientId = `spark-${color.replace("#", "")}`;
  return (
    <div className="widget-spark">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip formatter={(value) => [formatMoney(value), "Revenue"]} labelFormatter={(label) => label} />
          <Area type="monotone" dataKey="revenue" stroke={color} strokeWidth={1.5} fill={`url(#${gradientId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueChangeBadge({ change }) {
  if (!change) return null;
  if (change.kind === "new") {
    return <span className="hero-badge hero-badge-new">New this period</span>;
  }
  const isUp = change.kind === "up";
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span className={`hero-badge ${isUp ? "hero-badge-up" : "hero-badge-down"}`}>
      <Icon size={12} />
      {change.pct >= 0 ? "+" : ""}
      {change.pct.toFixed(1)}%
    </span>
  );
}

const activityIconMap = {
  bundle: Package,
  bogo: Gift,
  volume: Layers,
  "mix-match": Shuffle,
  announcement: Megaphone,
  "inactive-tab": Eye,
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [subscription, setSubscription] = useState({
    planName: "Free",
    maxAppsAllowed: 1,
    enabledAppsCount: 0,
    enabledApps: [],
    subscriptionConfig: null,
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [extensionEnabled, setExtensionEnabled] = useState(null); // null = loading
  const [showExtensionBanner, setShowExtensionBanner] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [extensionBannerFlashing, setExtensionBannerFlashing] = useState(false);
  const [upgradeBannerFlashing, setUpgradeBannerFlashing] = useState(false);
  const [range, setRange] = useState("7d");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [sortBy, setSortBy] = useState("revenue");

  useEffect(() => {
    fetchUserSubscription();
    fetchActivityData();
    checkExtensionStatus();

    // Live activity rail: refresh periodically so "Streaming" is a real claim.
    const activityInterval = setInterval(fetchActivityData, ACTIVITY_REFRESH_MS);

    // Fallback: Force loading to false after 8 seconds if still loading
    const fallbackTimeout = setTimeout(() => {
      setLoading((prev) => (prev ? false : prev));
    }, 8000);

    return () => {
      clearInterval(activityInterval);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  useEffect(() => {
    fetchDashboardSummary(range);
  }, [range]);

  // Handle extension banner visibility with flash animation
  useEffect(() => {
    if (extensionEnabled === null) return; // Still loading

    if (extensionEnabled === false) {
      setShowExtensionBanner(true);
    } else if (showExtensionBanner) {
      // Flash before hiding
      setExtensionBannerFlashing(true);
      const timer = setTimeout(() => {
        setShowExtensionBanner(false);
        setExtensionBannerFlashing(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [extensionEnabled]);

  // Handle upgrade banner visibility with flash animation
  useEffect(() => {
    if (loading) return; // Still loading

    const isHighestPlan = subscription.planName === "Advanced";
    if (!isHighestPlan) {
      setShowUpgradeBanner(true);
    } else if (showUpgradeBanner) {
      // Flash before hiding
      setUpgradeBannerFlashing(true);
      const timer = setTimeout(() => {
        setShowUpgradeBanner(false);
        setUpgradeBannerFlashing(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [subscription.planName, loading]);

  const fetchUserSubscription = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`/api/subscription/getUserSubscription`, {
        signal: controller.signal,
        credentials: "include",
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        if (data.status === "SUCCESS") {
          setSubscription({
            planName: data.data.planName,
            maxAppsAllowed: data.data.maxAppsAllowed,
            enabledAppsCount: data.data.enabledAppsCount,
            enabledApps: data.data.enabledApps || [],
            subscriptionConfig: data.data.subscriptionConfig || null,
          });
        }
      }
    } catch (err) {
      console.error("[DashboardHome] Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    try {
      const response = await fetch("/api/activity/recent");
      if (response.ok) {
        const data = await response.json();
        if (data.status === "SUCCESS") {
          setActivities(data.data.activities || []);
        }
      }
    } catch (err) {
      console.error("Error fetching activity:", err);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchDashboardSummary = async (selectedRange) => {
    setSummaryLoading(true);
    try {
      const response = await fetch(`/api/dashboard/summary?range=${selectedRange}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === "SUCCESS") {
          setSummary(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const checkExtensionStatus = async () => {
    try {
      const response = await fetch("/api/subscription/checkBusyBuddyEnabled");
      if (response.ok) {
        const data = await response.json();
        if (data.status === "SUCCESS") {
          setExtensionEnabled(data.data.enabled !== false);
        } else {
          setExtensionEnabled(true); // Default to enabled if check fails
        }
      } else {
        setExtensionEnabled(true);
      }
    } catch (err) {
      setExtensionEnabled(true); // Default to enabled if check fails
    }
  };

  const getThemeExtensionUrl = () => {
    const params = new URLSearchParams(location.search);
    const shop = params.get("shop");
    if (shop) {
      return `https://${shop}/admin/themes/current/editor`;
    }
    return "#";
  };

  // Real plan-access + enabled/paused state, sourced from
  // /api/subscription/getUserSubscription (subscriptionConfig.allowedApps +
  // enabledApps) rather than a hardcoded, possibly-stale plan/feature map.
  const getWidgetStatus = (widget) => {
    const planConfig = subscription.subscriptionConfig?.[subscription.planName];
    const planAccessible = planConfig?.allowedApps?.includes(widget.appId) || false;

    if (!planAccessible) {
      return { state: "locked", label: "Locked" };
    }

    const entry = subscription.enabledApps.find((app) => app.appId === widget.appId);
    if (entry?.enabled) {
      return { state: "active", label: "Active" };
    }
    if (entry) {
      return { state: "paused", label: "Paused" };
    }
    return { state: "not-set-up", label: "Needs setup" };
  };

  const isWidgetAccessible = (widget) => getWidgetStatus(widget).state !== "locked";

  const handleCreate = (widget) => {
    if (!loading && !isWidgetAccessible(widget)) {
      navigate("/plan" + location.search);
      return;
    }

    if (widget.settingsRoute) {
      navigate(widget.settingsRoute + (location.search ? "&" + location.search.slice(1) : ""));
    } else {
      const params = new URLSearchParams(location.search);
      const shop = params.get("shop");
      const queryString = shop ? `?shop=${shop}` : "";
      window.open(`/editor.html${queryString}#${widget.editorRoute}`, "_blank");
    }
  };

  const handleManage = (widget) => {
    if (!loading && !isWidgetAccessible(widget)) {
      navigate("/plan" + location.search);
      return;
    }
    navigate(widget.manageRoute + location.search);
  };

  const widgetMetrics = (widgetId) => {
    const fromSummary = summary?.widgets?.find((w) => w.id === widgetId);
    if (fromSummary) return fromSummary;
    return {
      id: widgetId,
      ...EMPTY_WIDGET_METRICS,
      impressions: {
        ...EMPTY_WIDGET_METRICS.impressions,
        tracked: IMPRESSION_TRACKED_WIDGET_IDS.includes(widgetId),
      },
    };
  };

  // "Recently edited" ranks widgets by their real most-recent activity event
  // (activities already arrive newest-first from the API) rather than a
  // fabricated edit timestamp.
  const recentActivityRank = () => {
    const rank = {};
    activities.forEach((item, index) => {
      const widgetId = ACTIVITY_SLUG_TO_WIDGET_ID[item.widget];
      if (widgetId && !(widgetId in rank)) rank[widgetId] = index;
    });
    return rank;
  };

  const getSortedWidgets = () => {
    const rank = recentActivityRank();
    return widgetConfig
      .map((widget) => {
        const metrics = widgetMetrics(widget.id);
        let value;
        if (sortBy === "impressions") {
          value = metrics.impressions.tracked ? metrics.impressions.views ?? 0 : -1;
        } else if (sortBy === "recent") {
          value = rank[widget.id] === undefined ? -Infinity : -rank[widget.id];
        } else {
          value = metrics.revenue.amount || 0;
        }
        return { widget, metrics, value };
      })
      .sort((a, b) => b.value - a.value);
  };

  const rangeLabel = RANGE_OPTIONS.find((r) => r.id === range)?.label || range;
  const trackedWidgetNames = (summary?.impressions?.trackedWidgetIds || IMPRESSION_TRACKED_WIDGET_IDS)
    .map((id) => widgetConfig.find((w) => w.id === id)?.title || id)
    .join(", ");

  const visibleActivities = activityExpanded ? activities : activities.slice(0, ACTIVITY_VISIBLE_COUNT);

  return (
    <div className="dashboard-home">
      <div className="dashboard-inner">
        <div className="app-frame">
          {/* Header */}
          <div className="app-header">
            <div className="app-header-brand">
              <span className="logo">🐝</span>
              <span className="name">BusyBuddy</span>
              <span className="app-tag">Home</span>
            </div>
            <div className="app-header-actions">
              <div className="pill-nav">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={range === opt.id ? "active" : ""}
                    onClick={() => setRange(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <a className="help-link" href="https://help.shopify.com" target="_blank" rel="noopener noreferrer">
                Help
              </a>
            </div>
          </div>

          {/* Hero metrics band */}
          <div className="hero-band">
            <div className="hero-tile">
              <div className="hero-label">Attributed revenue &middot; {rangeLabel}</div>
              {summaryLoading ? (
                <div className="hero-loading">Loading&hellip;</div>
              ) : summary?.revenue?.hasData ? (
                <>
                  <div className="hero-value-row">
                    <span className="hero-value">{formatMoney(summary.revenue.amount)}</span>
                    <RevenueChangeBadge change={summary.revenue.change} />
                  </div>
                  <Sparkline data={summary.revenue.trend} color="#111111" />
                </>
              ) : (
                <div className="hero-empty">No attributed revenue recorded in this period yet.</div>
              )}
            </div>

            <div className="hero-tile">
              <div className="hero-label">Avg. attributed order value</div>
              {summaryLoading ? (
                <div className="hero-loading">Loading&hellip;</div>
              ) : summary?.avgOrderValue != null ? (
                <>
                  <div className="hero-value">{formatMoney(summary.avgOrderValue)}</div>
                  <div className="hero-sub">
                    {summary.purchaseCount} attributed order{summary.purchaseCount === 1 ? "" : "s"}
                  </div>
                </>
              ) : (
                <div className="hero-empty">No attributed purchases in this period yet.</div>
              )}
            </div>

            <div className="hero-tile">
              <div className="hero-label">Impressions</div>
              {summaryLoading ? (
                <div className="hero-loading">Loading&hellip;</div>
              ) : summary?.impressions?.hasData ? (
                <>
                  <div className="hero-value">{summary.impressions.views.toLocaleString()}</div>
                  <div className="hero-sub">
                    CTR {summary.impressions.ctr.toFixed(1)}% &middot; tracked from {trackedWidgetNames}
                  </div>
                </>
              ) : (
                <div className="hero-empty">
                  No impressions tracked yet{trackedWidgetNames ? ` (tracked from ${trackedWidgetNames})` : ""}.
                </div>
              )}
            </div>

            <div className="hero-tile">
              <div className="hero-label">Active widgets</div>
              {loading ? (
                <div className="hero-loading">Loading&hellip;</div>
              ) : (
                <>
                  <div className="hero-value">
                    {subscription.enabledAppsCount}
                    <span className="hero-value-sub"> / {subscription.maxAppsAllowed}</span>
                  </div>
                  <div className="hero-sub">On the {subscription.planName} plan</div>
                </>
              )}
            </div>
          </div>

          {/* Main content: widgets (9/12) + activity rail (3/12) */}
          <div className="dashboard-layout">
            <div className="widgets-column">
              <div className="section-header">
                <h2 className="section-title">Your widgets</h2>
                <div className="sort-controls">
                  Sort by
                  {SORT_OPTIONS.map((opt) => (
                    <span
                      key={opt.id}
                      className={`tag ${sortBy === opt.id ? "active" : ""}`}
                      onClick={() => setSortBy(opt.id)}
                    >
                      {opt.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="widgets-grid">
                {getSortedWidgets().map(({ widget, metrics }) => {
                  const IconComponent = widget.icon;
                  const status = getWidgetStatus(widget);

                  return (
                    <div key={widget.id} className="widget-tile">
                      <div className="widget-tile-top">
                        <div className="widget-icon-large" style={{ background: widget.iconBg, color: widget.accent }}>
                          <IconComponent size={20} />
                        </div>
                        <div className={`status-indicator ${status.state}`}>
                          {status.state === "locked" ? <Lock size={9} /> : <span className="status-dot"></span>}
                          {status.label}
                        </div>
                      </div>

                      <div className="widget-name">{widget.title}</div>
                      <div className="widget-desc">{widget.subtitle}</div>
                      <div className="widget-divider"></div>

                      {summaryLoading ? (
                        <div className="widget-metrics-empty">Loading performance&hellip;</div>
                      ) : (
                        <>
                          <div className="widget-metrics-grid">
                            <div className="widget-metric">
                              <div className="metric-label">Rev</div>
                              <div className="metric-value">
                                {metrics.revenue.hasData ? formatMoney(metrics.revenue.amount) : "—"}
                              </div>
                            </div>
                            {metrics.impressions.tracked ? (
                              <>
                                <div className="widget-metric">
                                  <div className="metric-label">Impr</div>
                                  <div className="metric-value">{formatCompactNumber(metrics.impressions.views)}</div>
                                </div>
                                <div className="widget-metric">
                                  <div className="metric-label">CTR</div>
                                  <div className="metric-value">
                                    {metrics.impressions.hasData ? `${metrics.impressions.ctr.toFixed(1)}%` : "—"}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="widget-metric-note">Impressions are not tracked for this widget yet</div>
                            )}
                          </div>
                          {metrics.revenue.hasData && <Sparkline data={metrics.revenue.trend} color={widget.accent} />}
                          {!metrics.revenue.hasData && !metrics.impressions.hasData && (
                            <div className="widget-metrics-empty">No activity recorded in this period yet.</div>
                          )}
                        </>
                      )}

                      <div className="widget-buttons">
                        <button className="widget-btn create" onClick={() => handleCreate(widget)}>
                          <Plus size={12} /> Create
                        </button>
                        <button className="widget-btn manage" onClick={() => handleManage(widget)}>
                          <Settings size={12} /> Manage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity rail */}
            <div className="history-column">
              <div className="history-header">
                <h2 className="history-title">Live activity</h2>
                <span className="app-tag">Streaming</span>
              </div>

              <div className="history-list">
                {activityLoading ? (
                  <div className="history-loading">Loading activity...</div>
                ) : activities.length === 0 ? (
                  <div className="history-empty">No activity yet</div>
                ) : (
                  visibleActivities.map((item) => {
                    const IconComponent = activityIconMap[item.widget] || DollarSign;
                    const accent = widgetConfig.find((w) => w.id === ACTIVITY_SLUG_TO_WIDGET_ID[item.widget])?.accent || "#6b7280";
                    return (
                      <div key={item.id} className="history-item">
                        <div className="history-icon" style={{ background: `${accent}1a`, color: accent }}>
                          <IconComponent size={14} />
                        </div>
                        <div className="history-content">
                          <div className="history-text">
                            <strong>{item.title}</strong>
                          </div>
                          <div className="history-meta">
                            {item.meta}
                            {item.amount && (
                              <>
                                {" "}
                                &middot; <span className="history-amount">{item.amount}</span>
                              </>
                            )}
                          </div>
                          <div className="history-meta">{item.time}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {activities.length > ACTIVITY_VISIBLE_COUNT && (
                <button className="view-all-btn" onClick={() => setActivityExpanded((prev) => !prev)}>
                  {activityExpanded ? "Show less" : "View all activity"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification Banners */}
        {(showExtensionBanner || showUpgradeBanner) && (
          <div className="notification-card">
            {showExtensionBanner && (
              <a
                href={getThemeExtensionUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`notification-banner enable-extension ${extensionBannerFlashing ? "flashing" : ""}`}
              >
                <ExternalLink size={16} className="notification-icon" />
                <span>
                  Enable BusyBuddy: open the theme editor, then{" "}
                  <strong>Add block &gt; Apps &gt; BusyBuddy Announcement</strong>
                </span>
              </a>
            )}
            {showUpgradeBanner && (
              <div
                className={`notification-banner upgrade-plan ${upgradeBannerFlashing ? "flashing" : ""}`}
                onClick={() => navigate("/plan" + location.search)}
              >
                <Zap size={16} className="notification-icon" />
                <span>Upgrade your plan for more features!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
