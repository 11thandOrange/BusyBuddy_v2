import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Megaphone,
  Package,
  Gift,
  Layers,
  Shuffle,
  TrendingUp,
  Plus,
  Settings,
  DollarSign,
  Eye,
  MousePointer,
} from "lucide-react";
import "./DashboardHome.css";

// Widget configuration with routes and colors
const widgetConfig = [
  {
    id: "announcement-bar",
    title: "Announcement Bar",
    description: "Display alerts and promotions at the top of your store",
    icon: Megaphone,
    color: "orange",
    editorRoute: "/announcement-bar/editor",
    manageRoute: "/announcement-bar",
  },
  {
    id: "bundle-discount",
    title: "Bundle Discounts",
    description: "Create product bundles with automatic discounts",
    icon: Package,
    color: "blue",
    editorRoute: "/bundle-discount/editor",
    manageRoute: "/bundle-discount",
  },
  {
    id: "buy-one-get-one",
    title: "Buy One Get One",
    description: "BOGO deals, free gifts, and special offers",
    icon: Gift,
    color: "green",
    editorRoute: "/buy-one-get-one/editor",
    manageRoute: "/buy-one-get-one",
  },
  {
    id: "volume-discounts",
    title: "Volume Discounts",
    description: "Quantity-based pricing tiers and bulk savings",
    icon: Layers,
    color: "pink",
    editorRoute: "/volume-discounts/editor",
    manageRoute: "/volume-discounts",
  },
  {
    id: "mix-and-match",
    title: "Mix & Match",
    description: "Let customers build their own custom bundles",
    icon: Shuffle,
    color: "purple",
    editorRoute: "/mix-and-match/editor",
    manageRoute: "/mix-and-match",
  },
  {
    id: "upsell-cross-sell",
    title: "Upsell & Cross-sell",
    description: "Boost AOV with smart product recommendations",
    icon: TrendingUp,
    color: "indigo",
    editorRoute: "/upsell-cross-sell/editor",
    manageRoute: "/upsell-cross-sell",
  },
];

// Plan features mapping
const planFeatures = {
  Free: ["announcement-bar"],
  Starter: [
    "announcement-bar",
    "bundle-discount",
    "buy-one-get-one",
    "volume-discounts",
  ],
  Advanced: [
    "announcement-bar",
    "bundle-discount",
    "buy-one-get-one",
    "volume-discounts",
    "mix-and-match",
    "upsell-cross-sell",
  ],
};

// Icon mapping for metric types
const iconMap = {
  bundle: Package,
  announcement: Megaphone,
  revenue: DollarSign,
  views: Eye,
  clicks: MousePointer,
  default: Package,
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ activeOffers: 0, totalViews: 0 });
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetchUserSubscription();
    fetchAnalyticsData();
  }, []);

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch("/api/subscription/getUserSubscription");
      if (response.ok) {
        const data = await response.json();
        if (data.status === "SUCCESS") {
          setCurrentPlan(data.data.planName);
        }
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch("/api/activity/recent");
      if (response.ok) {
        const data = await response.json();
        if (data.status === "SUCCESS") {
          setActivities(data.data.activities || []);
          setStats(data.data.stats || { activeOffers: 0, totalViews: 0 });
        }
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setActivityLoading(false);
    }
  };

  const isWidgetAccessible = (widgetId) => {
    return planFeatures[currentPlan]?.includes(widgetId) || false;
  };

  const handleCreate = (widget) => {
    if (!isWidgetAccessible(widget.id)) {
      navigate("/plan" + location.search);
      return;
    }
    // Open editor in new tab
    const editorUrl = widget.editorRoute + location.search;
    window.open(editorUrl, "_blank");
  };

  const handleManage = (widget) => {
    if (!isWidgetAccessible(widget.id)) {
      navigate("/plan" + location.search);
      return;
    }
    // Navigate to app homepage
    navigate(widget.manageRoute + location.search);
  };

  return (
    <div className="dashboard-home">
      <div className="dashboard-layout">
        {/* Left Column - Widgets Grid */}
        <div className="widgets-column">
          <div className="widgets-container">
            <div className="section-header">
              <h2 className="section-title">Your Widgets</h2>
            </div>
            <div className="widgets-grid">
              {widgetConfig.map((widget) => {
                const IconComponent = widget.icon;
                const accessible = isWidgetAccessible(widget.id);

                return (
                  <div key={widget.id} className="widget-tile">
                    <div className={`status-indicator ${accessible ? "active" : "inactive"}`}>
                      <span className="status-dot"></span>
                      {accessible ? "Active" : "Inactive"}
                    </div>
                    <div className={`widget-icon-large ${widget.color}`}>
                      <IconComponent size={32} />
                    </div>
                    <div className="widget-name">{widget.title}</div>
                    <div className="widget-desc">{widget.description}</div>
                    <div className="widget-buttons">
                      <button
                        className="widget-btn create"
                        onClick={() => handleCreate(widget)}
                      >
                        <Plus size={12} /> Create
                      </button>
                      <button
                        className="widget-btn manage"
                        onClick={() => handleManage(widget)}
                      >
                        <Settings size={12} /> Manage
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Analytics */}
        <div className="history-column">
          <div className="history-container">
            <div className="history-header">
              <h2 className="history-title">Performance</h2>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="quick-stat">
                <div className="value">{stats.activeOffers}</div>
                <div className="label">Active Offers</div>
              </div>
              <div className="quick-stat">
                <div className="value">{formatStatNumber(stats.totalViews)}</div>
                <div className="label">Total Views</div>
              </div>
            </div>

            {/* Analytics List */}
            <div className="history-list-wrapper">
              <div className="history-list">
                {activityLoading ? (
                  <div className="history-loading">Loading analytics...</div>
                ) : activities.length === 0 ? (
                  <div className="history-empty">No analytics data yet</div>
                ) : (
                  activities.map((item) => {
                    const IconComponent = iconMap[item.iconClass] || iconMap[item.widget] || iconMap.default;
                    return (
                      <div key={item.id} className="history-item">
                        <div className={`history-icon ${item.iconClass}`}>
                          <IconComponent size={18} />
                        </div>
                        <div className="history-content">
                          <div className="history-text">{item.title}</div>
                          <div className="history-meta">{item.meta}</div>
                        </div>
                        {item.amount && (
                          <div className="history-amount">{item.amount}</div>
                        )}
                        <div className="history-time">{item.time}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Format large numbers for display
function formatStatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toLocaleString() || "0";
}
