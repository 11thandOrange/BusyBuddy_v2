import React, { useEffect, useState } from "react";
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
  Cell,
} from "recharts";
import GoogleAnalyticsSection from "./GoogleAnalyticsSection";

// Color palette for charts
const CHART_COLORS = {
  views: "#8884d8",
  clicks: "#82ca9d",
  active: "#ffc658",
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

export default function AnnouncementBarAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        if (timeRange !== "custom") {
          params.append("range", timeRange);
        }
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);

        const response = await fetch(`/api/announcement-bars/analytics?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch analytics: ${errorMessage}`);
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
    };

    fetchAnalytics();
  }, [timeRange, dateFrom, dateTo]);

  // Prepare data for performance charts
  const getPerformanceData = () => {
    if (!analytics) return [];

    return [
      {
        name: "Views",
        value: analytics.totalViews || 0,
        color: CHART_COLORS.views,
      },
      {
        name: "Clicks",
        value: analytics.totalClicks || 0,
        color: CHART_COLORS.clicks,
      },
    ];
  };

  // Prepare data for trend chart
  // Prepare data for trend chart
  const getTrendData = () => {
    if (!analytics || !analytics.trend) return [];

    return analytics.trend.map((day) => ({
      date: formatDate(day.date),
      views: day.views || 0,
      clicks: day.clicks || 0,
    }));
  };

  // Helper function to format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Update the trend chart to show appropriate time range label
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      case "custom":
        return "Custom Range";
      default:
        return "Last 30 Days";
    }
  };

  const handleCustomDateFilter = () => {
    setTimeRange("custom");
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-0">Announcement Bar Analytics</h1>
          <p className="text-muted">Track performance of your announcement bars</p>
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
            <Button
              variant={timeRange === "custom" ? "primary" : "outline-primary"}
              size="sm"
              onClick={() => setTimeRange("custom")}
            >
              Custom
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Custom Date Filter */}
      {timeRange === "custom" && (
        <Row className="mb-4">
          <Col md={3}>
            <label htmlFor="dateFrom" className="form-label small text-muted">
              From Date
            </label>
            <input
              type="date"
              className="form-control"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <label htmlFor="dateTo" className="form-label small text-muted">
              To Date
            </label>
            <input
              type="date"
              className="form-control"
              id="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCustomDateFilter}
              disabled={!dateFrom || !dateTo}
            >
              Apply Filter
            </Button>
          </Col>
        </Row>
      )}

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-2">Loading analytics data...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      {!loading && analytics && (
        <>
          {/* Summary Cards */}
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title text-muted text-uppercase small">Total Views</h6>
                    <i className="bi bi-eye text-primary"></i>
                  </div>
                  <h3 className="fw-bold">{analytics.totalViews?.toLocaleString() || 0}</h3>
                  <div className="text-success small">
                    <i className="bi bi-arrow-up"></i> Overall visibility
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title text-muted text-uppercase small">Total Clicks</h6>
                    <i className="bi bi-cursor text-success"></i>
                  </div>
                  <h3 className="fw-bold">{analytics.totalClicks?.toLocaleString() || 0}</h3>
                  <div className="text-success small">
                    <i className="bi bi-arrow-up"></i> User engagement
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title text-muted text-uppercase small">Total Bars</h6>
                    <i className="bi bi-window text-info"></i>
                  </div>
                  <h3 className="fw-bold">{analytics.totalAnnouncementBars?.toLocaleString() || 0}</h3>
                  <div className="text-muted small">All announcement bars</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title text-muted text-uppercase small">Active Bars</h6>
                    <i className="bi bi-check-circle text-warning"></i>
                  </div>
                  <h3 className="fw-bold">{analytics.activeAnnouncementBars?.toLocaleString() || 0}</h3>
                  <div className="text-success small">Currently active</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Section */}
          <Row className="g-4 mb-4">
            {/* Performance Trend Chart */}
            <Col lg={8}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Performance Trend</h5>
                    <span className="badge bg-light text-dark">{getTimeRangeLabel()}</span>
                  </div>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getTrendData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="views"
                          stroke={CHART_COLORS.views}
                          strokeWidth={2}
                          name="Views"
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="clicks"
                          stroke={CHART_COLORS.clicks}
                          strokeWidth={2}
                          name="Clicks"
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Performance Comparison Chart */}
            <Col lg={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <h5 className="card-title mb-3">Views vs Clicks</h5>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getPerformanceData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                          {getPerformanceData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Statistics Summary */}
          <Row>
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="card-title mb-3">Announcement Bar Statistics</h5>
                  <Table responsive hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Metric</th>
                        <th className="text-end">Total</th>
                        <th className="text-end">Daily Average</th>
                        <th className="text-end">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="color-indicator me-2"
                              style={{ backgroundColor: CHART_COLORS.views }}
                            ></div>
                            Total Views
                          </div>
                        </td>
                        <td className="text-end fw-bold">{analytics.totalViews?.toLocaleString() || 0}</td>
                        <td className="text-end">
                          {Math.round(analytics.totalViews / 30).toLocaleString()}/day
                        </td>
                        <td className="text-end">
                          <span className="badge bg-success">Good</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="color-indicator me-2"
                              style={{ backgroundColor: CHART_COLORS.clicks }}
                            ></div>
                            Total Clicks
                          </div>
                        </td>
                        <td className="text-end fw-bold">{analytics.totalClicks?.toLocaleString() || 0}</td>
                        <td className="text-end">
                          {Math.round(analytics.totalClicks / 30).toLocaleString()}/day
                        </td>
                        <td className="text-end">
                          <span className="badge bg-warning">Average</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="color-indicator me-2"
                              style={{ backgroundColor: CHART_COLORS.active }}
                            ></div>
                            Total Announcement Bars
                          </div>
                        </td>
                        <td className="text-end fw-bold">
                          {analytics.totalAnnouncementBars?.toLocaleString() || 0}
                        </td>
                        <td className="text-end">-</td>
                        <td className="text-end">
                          <span className="badge bg-info">Active</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="color-indicator me-2"
                              style={{ backgroundColor: "#00C49F" }}
                            ></div>
                            Active Announcement Bars
                          </div>
                        </td>
                        <td className="text-end fw-bold">
                          {analytics.activeAnnouncementBars?.toLocaleString() || 0}
                        </td>
                        <td className="text-end">-</td>
                        <td className="text-end">
                          <span className="badge bg-primary">Active</span>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Google Analytics Section - Always renders with empty state when not connected */}
      <Row className="mt-5">
        <Col>
          <GoogleAnalyticsSection />
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
    </Container>
  );
}
