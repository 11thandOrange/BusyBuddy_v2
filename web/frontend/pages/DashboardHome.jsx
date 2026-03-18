import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Megaphone,
  Package,
  Gift,
  Layers,
  Shuffle,
  MessageCircle,
  Plus,
  Settings,
  CircleCheck,
  DollarSign,
  Eye,
  TrendingUp,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import "./DashboardHome.css";

// App configuration with routes and colors
const appConfig = [
  {
    id: "announcement-bar",
    title: "Announcement Bar",
    description: "Display alerts and promotions at the top of your store.",
    icon: Megaphone,
    color: "orange",
    editorRoute: "/announcement-bar/editor",
    manageRoute: "/announcement-bar",
    stats: { label1: "Active", label2: "Views" },
  },
  {
    id: "bundle-discount",
    title: "Bundle Discounts",
    description: "Create product bundles with automatic discounts.",
    icon: Package,
    color: "blue",
    editorRoute: "/bundle-discount/editor",
    manageRoute: "/bundle-discount",
    stats: { label1: "Bundles", label2: "Revenue" },
  },
  {
    id: "buy-one-get-one",
    title: "Buy One Get One",
    description: "Set up BOGO deals to boost sales fast.",
    icon: Gift,
    color: "green",
    editorRoute: "/buy-one-get-one/editor",
    manageRoute: "/buy-one-get-one",
    stats: { label1: "Offers", label2: "Revenue" },
  },
  {
    id: "volume-discounts",
    title: "Volume Discounts",
    description: "Tiered pricing to reward bulk buyers.",
    icon: Layers,
    color: "pink",
    editorRoute: "/volume-discounts/editor",
    manageRoute: "/volume-discounts",
    stats: { label1: "Tiers", label2: "Revenue" },
  },
  {
    id: "mix-and-match",
    title: "Mix & Match",
    description: "Let customers build custom bundles.",
    icon: Shuffle,
    color: "purple",
    editorRoute: "/mix-and-match/editor",
    manageRoute: "/mix-and-match",
    stats: { label1: "Groups", label2: "Revenue" },
  },
  {
    id: "inactive-tab-message",
    title: "Inactive Tab",
    description: "Win back visitors with tab messages.",
    icon: MessageCircle,
    color: "indigo",
    editorRoute: "/inactive-tab-message",
    manageRoute: "/inactive-tab-message",
    stats: { label1: "Triggers", label2: "Return" },
  },
];

// Plan features mapping
const planFeatures = {
  Free: ["announcement-bar", "inactive-tab-message"],
  Starter: [
    "announcement-bar",
    "inactive-tab-message",
    "bundle-discount",
    "buy-one-get-one",
    "volume-discounts",
  ],
  Advanced: [
    "announcement-bar",
    "inactive-tab-message",
    "bundle-discount",
    "buy-one-get-one",
    "volume-discounts",
    "mix-and-match",
  ],
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [loading, setLoading] = useState(true);
  const [appStats, setAppStats] = useState({});

  useEffect(() => {
    fetchUserSubscription();
    fetchAppStats();
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

  const fetchAppStats = async () => {
    // Mock stats for now - can be replaced with actual API calls
    setAppStats({
      "announcement-bar": { value1: "12", value2: "45.2K" },
      "bundle-discount": { value1: "8", value2: "$12.4K" },
      "buy-one-get-one": { value1: "5", value2: "$8.2K" },
      "volume-discounts": { value1: "3", value2: "$4.1K" },
      "mix-and-match": { value1: "4", value2: "$2.8K" },
      "inactive-tab-message": { value1: "12.3K", value2: "15%" },
    });
  };

  const isAppAccessible = (appId) => {
    return planFeatures[currentPlan]?.includes(appId) || false;
  };

  const handleCreate = (app) => {
    if (!isAppAccessible(app.id)) {
      navigate("/plan" + location.search);
      return;
    }
    navigate(app.editorRoute + location.search);
  };

  const handleManage = (app) => {
    if (!isAppAccessible(app.id)) {
      navigate("/plan" + location.search);
      return;
    }
    navigate(app.manageRoute + location.search);
  };

  const totalRevenue = "$27.5K";
  const totalViews = "125K";
  const activeApps = appConfig.filter((app) => isAppAccessible(app.id)).length;

  return (
    <div className="dashboard-home">
      <div className="dashboard-container">
        {/* Widgets Section */}
        <div className="widgets-section">
          <div className="section-header">
            <h2 className="section-title">Your Widgets</h2>
            <div className="status-bar">
              <div className="status-item">
                <CircleCheck size={14} />
                <span>{activeApps} Active</span>
              </div>
              <div className="status-item">
                <DollarSign size={14} />
                <span>{totalRevenue}</span>
              </div>
              <div className="status-item">
                <Eye size={14} />
                <span>{totalViews}</span>
              </div>
            </div>
          </div>

          <div className="widgets-grid">
            {appConfig.map((app) => {
              const IconComponent = app.icon;
              const stats = appStats[app.id] || { value1: "0", value2: "0" };
              const accessible = isAppAccessible(app.id);

              return (
                <div key={app.id} className="widget-card-outer">
                  <div className="widget-wrapper">
                    <div className={`widget-item ${!accessible ? "locked" : ""}`}>
                      <span className={`widget-status ${accessible ? "active" : "inactive"}`}>
                        {accessible ? "Active" : "Locked"}
                      </span>
                      <div className="widget-header">
                        <div className={`widget-icon ${app.color}`}>
                          <IconComponent size={14} />
                        </div>
                        <div className="widget-title">{app.title}</div>
                      </div>
                      <div className="widget-desc">{app.description}</div>
                      <div className="widget-stats">
                        <div className="widget-stat">
                          <div className="value">{stats.value1}</div>
                          <div className="label">{app.stats.label1}</div>
                        </div>
                        <div className="widget-stat">
                          <div className="value">{stats.value2}</div>
                          <div className="label">{app.stats.label2}</div>
                        </div>
                      </div>
                    </div>
                    <div className="widget-actions">
                      <button
                        className="widget-btn create"
                        onClick={() => handleCreate(app)}
                      >
                        <Plus size={10} /> Create
                      </button>
                      <button
                        className="widget-btn manage"
                        onClick={() => handleManage(app)}
                      >
                        <Settings size={10} /> Manage
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="bottom-cards">
          {/* Revenue Chart Card */}
          <div className="card chart-card">
            <div className="card-inner">
              <div className="card-header-row">
                <h3 className="card-title">Revenue by Widget</h3>
                <div className="trend-badge">
                  <TrendingUp size={14} />
                  +18.3%
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-dot blue"></div>
                  <span>Bundle</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot green"></div>
                  <span>BOGO</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot pink"></div>
                  <span>Volume</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot purple"></div>
                  <span>Mix & Match</span>
                </div>
              </div>
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {[65, 80, 70, 90, 85, 95, 100].map((height, i) => (
                    <div key={i} className="chart-bar-group">
                      <div className="chart-bar blue" style={{ height: `${height * 0.4}%` }}></div>
                      <div className="chart-bar green" style={{ height: `${height * 0.3}%` }}></div>
                      <div className="chart-bar pink" style={{ height: `${height * 0.2}%` }}></div>
                      <div className="chart-bar purple" style={{ height: `${height * 0.1}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent History Card */}
          <div className="card history-card">
            <div className="card-inner">
              <div className="card-header-row">
                <h3 className="card-title">Recent History</h3>
              </div>
              <div className="history-list">
                <div className="history-item">
                  <div className="history-icon blue">
                    <ShoppingCart size={16} />
                  </div>
                  <div className="history-text">
                    <p>Bundle Discount purchased</p>
                    <span>2 minutes ago</span>
                  </div>
                  <div className="history-amount">+$89.99</div>
                </div>
                <div className="history-item">
                  <div className="history-icon orange">
                    <Eye size={16} />
                  </div>
                  <div className="history-text">
                    <p>Announcement viewed 1,234 times</p>
                    <span>15 minutes ago</span>
                  </div>
                </div>
                <div className="history-item">
                  <div className="history-icon green">
                    <Gift size={16} />
                  </div>
                  <div className="history-text">
                    <p>BOGO offer redeemed</p>
                    <span>1 hour ago</span>
                  </div>
                  <div className="history-amount">+$45.00</div>
                </div>
                <div className="history-item">
                  <div className="history-icon purple">
                    <Shuffle size={16} />
                  </div>
                  <div className="history-text">
                    <p>Mix & Match bundle sold</p>
                    <span>2 hours ago</span>
                  </div>
                  <div className="history-amount">+$67.50</div>
                </div>
              </div>
              <div className="history-fade">
                <div className="scroll-hint">
                  <ChevronDown size={14} />
                  Scroll for more
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
