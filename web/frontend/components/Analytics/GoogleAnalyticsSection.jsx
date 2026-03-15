import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Table, ButtonGroup, Button } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Google,
  ExclamationTriangle,
  ArrowRight,
  Globe,
  People,
  Clock,
  GraphUp,
} from "react-bootstrap-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge/utilities";

// Color palette for charts
const CHART_COLORS = {
  sessions: "#4285f4",
  pageviews: "#34a853",
  users: "#fbbc04",
  bounceRate: "#ea4335",
  pie: ["#4285f4", "#34a853", "#fbbc04", "#ea4335", "#9333ea", "#f97316"],
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip p-2 bg-white border rounded shadow-sm">
        <p className="fw-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="mb-0">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Empty state component
function EmptyState({ onConnectClick }) {
  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Body className="text-center py-5">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Google size={40} className="text-muted" />
        </div>
        <h5 className="text-muted mb-3">No Google Analytics Data</h5>
        <p className="text-muted mb-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
          Connect your Google Analytics account in the Settings tab to view
          traffic and engagement data alongside your Shopify analytics.
        </p>
        {onConnectClick && (
          <Button
            variant="outline-primary"
            onClick={onConnectClick}
            className="d-inline-flex align-items-center gap-2"
          >
            Go to Settings
            <ArrowRight size={16} />
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default function GoogleAnalyticsSection({ onNavigateToSettings }) {
  const app = useAppBridge();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");

  // Create authenticated fetch function
  const authenticatedFetch = useCallback(async (url, options = {}) => {
    const token = await getSessionToken(app);
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }, [app]);

  const checkConnectionAndFetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // First check if Google Analytics is connected
      const statusResponse = await authenticatedFetch("/api/analytics/google/status");
      const statusResult = await statusResponse.json();
      
      if (!statusResult.success || !statusResult.data?.connected) {
        setIsConnected(false);
        setAnalytics(null);
        return;
      }
      
      setIsConnected(true);
      
      // Fetch Google Analytics data
      const response = await authenticatedFetch(`/api/analytics/google/data?range=${timeRange}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Google Analytics data");
      }

      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, timeRange]);

  // Helper function to format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Prepare traffic trend data
  const getTrafficTrendData = () => {
    if (!analytics || !analytics.trend) return [];
    return analytics.trend.map((day) => ({
      date: formatDate(day.date),
      sessions: day.sessions || 0,
      pageviews: day.pageviews || 0,
      users: day.users || 0,
    }));
  };

  // Prepare traffic source data for pie chart
  const getTrafficSourceData = () => {
    if (!analytics || !analytics.trafficSources) return [];
    return analytics.trafficSources.map((source, index) => ({
      name: source.source,
      value: source.sessions,
      color: CHART_COLORS.pie[index % CHART_COLORS.pie.length],
    }));
  };

  // Loading state
  if (loading) {
    return (
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading Google Analytics data...</p>
        </Card.Body>
      </Card>
    );
  }

  // Not connected state - show empty state
  if (!isConnected) {
    return <EmptyState onConnectClick={onNavigateToSettings} />;
  }

  // Error state
  if (error) {
    return (
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Alert variant="danger" className="d-flex align-items-center mb-0">
            <ExclamationTriangle className="me-2" />
            {error}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Connected but no data state
  if (!analytics) {
    return <EmptyState onConnectClick={onNavigateToSettings} />;
  }

  return (
    <>
      {/* Google Analytics Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "#4285f4",
                color: "white",
              }}
            >
              <Google size={18} />
            </div>
            <div>
              <h4 className="mb-0">Google Analytics</h4>
              <small className="text-muted">Traffic and engagement metrics from your website</small>
            </div>
          </div>
        </Col>
        <Col md="auto">
          <ButtonGroup>
            <Button
              variant={timeRange === "7d" ? "primary" : "outline-primary"}
              size="sm"
              onClick={() => setTimeRange("7d")}
            >
              7D
            </Button>
            <Button
              variant={timeRange === "30d" ? "primary" : "outline-primary"}
              size="sm"
              onClick={() => setTimeRange("30d")}
            >
              30D
            </Button>
            <Button
              variant={timeRange === "90d" ? "primary" : "outline-primary"}
              size="sm"
              onClick={() => setTimeRange("90d")}
            >
              90D
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted text-uppercase small">Total Sessions</h6>
                <Globe size={20} className="text-primary" />
              </div>
              <h3 className="fw-bold">{analytics.totalSessions?.toLocaleString() || 0}</h3>
              <div className="text-success small">
                <i className="bi bi-arrow-up"></i> {analytics.sessionsChange || "0"}% from last period
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted text-uppercase small">Total Users</h6>
                <People size={20} className="text-success" />
              </div>
              <h3 className="fw-bold">{analytics.totalUsers?.toLocaleString() || 0}</h3>
              <div className="text-success small">
                <i className="bi bi-arrow-up"></i> {analytics.usersChange || "0"}% from last period
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted text-uppercase small">Page Views</h6>
                <GraphUp size={20} className="text-info" />
              </div>
              <h3 className="fw-bold">{analytics.totalPageviews?.toLocaleString() || 0}</h3>
              <div className="text-success small">
                <i className="bi bi-arrow-up"></i> {analytics.pageviewsChange || "0"}% from last period
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title text-muted text-uppercase small">Avg. Session Duration</h6>
                <Clock size={20} className="text-warning" />
              </div>
              <h3 className="fw-bold">{analytics.avgSessionDuration || "0:00"}</h3>
              <div className="text-muted small">Average time on site</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="g-4 mb-4">
        {/* Traffic Trend Chart */}
        <Col lg={8}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title mb-3">Traffic Trend</h5>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTrafficTrendData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke={CHART_COLORS.sessions}
                      strokeWidth={2}
                      name="Sessions"
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pageviews"
                      stroke={CHART_COLORS.pageviews}
                      strokeWidth={2}
                      name="Page Views"
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke={CHART_COLORS.users}
                      strokeWidth={2}
                      name="Users"
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Traffic Sources Pie Chart */}
        <Col lg={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title mb-3">Traffic Sources</h5>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTrafficSourceData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {getTrafficSourceData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Pages Table */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title mb-3">Top Pages</h5>
              <Table responsive hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Page Path</th>
                    <th className="text-end">Page Views</th>
                    <th className="text-end">Unique Views</th>
                    <th className="text-end">Avg. Time on Page</th>
                    <th className="text-end">Bounce Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topPages && analytics.topPages.length > 0 ? (
                    analytics.topPages.map((page, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="color-indicator me-2"
                              style={{
                                backgroundColor: CHART_COLORS.pie[idx % CHART_COLORS.pie.length],
                                width: "12px",
                                height: "12px",
                                borderRadius: "2px",
                              }}
                            ></div>
                            {page.path}
                          </div>
                        </td>
                        <td className="text-end">{page.pageviews?.toLocaleString() || 0}</td>
                        <td className="text-end">{page.uniquePageviews?.toLocaleString() || 0}</td>
                        <td className="text-end">{page.avgTimeOnPage || "0:00"}</td>
                        <td className="text-end">{page.bounceRate || "0"}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No page data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .card {
          border-radius: 12px;
        }
        .custom-tooltip {
          background-color: white;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .color-indicator {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          display: inline-block;
        }
      `}</style>
    </>
  );
}
