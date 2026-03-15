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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import GoogleAnalyticsSection from "./GoogleAnalyticsSection";

// Color palette for charts
const CHART_COLORS = {
  revenue: "#8884d8",
  orders: "#82ca9d",
  quantity: "#ffc658",
  pie: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0", "#FF6666"],
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, currency = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip p-2 bg-white border rounded shadow-sm">
        <p className="fw-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="mb-0">
            {entry.name}:{" "}
            {entry.name.includes("revenue") || entry.name.includes("price")
              ? `${currency} ${entry.value.toFixed(2)}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Format currency
const formatCurrency = (amount, currency) => {
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?range=${timeRange}`, {
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
        if (result.status) {
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
  }, [timeRange]);

  // Prepare data for charts
  const getChartData = () => {
    if (!analytics || !analytics.topBundles) return [];

    return analytics.topBundles.map((bundle, index) => ({
      name: bundle.name.length > 15 ? `${bundle.name.substring(0, 15)}...` : bundle.name,
      revenue: bundle.totalRevenue,
      quantity: bundle.totalQuantity,
      avgPrice: bundle.averagePrice,
      fullName: bundle.name,
      color: CHART_COLORS.pie[index % CHART_COLORS.pie.length],
    }));
  };

  // Prepare data for revenue trend (mock data - you'll need to implement this in your backend)
  const getRevenueTrendData = () => {
    if (!analytics || !analytics.revenueTrend) return [];
    return analytics.revenueTrend;
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-0">Bundle Analytics</h1>
          <p className="text-muted">Track performance of your product bundles</p>
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
                    <h6 className="card-title text-muted text-uppercase small">Total Bundle Revenue</h6>
                    <i className="bi bi-currency-dollar text-primary"></i>
                  </div>
                  <h3 className="fw-bold">
                    {formatCurrency(analytics.totalBundleRevenue, analytics.currency || "USD")}
                  </h3>
                  <div className="text-success small">
                    <i className="bi bi-arrow-up"></i> 12.5% from last period
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title text-muted text-uppercase small">Orders with Bundles</h6>
                    <i className="bi bi-cart-check text-success"></i>
                  </div>
                  <h3 className="fw-bold">{analytics.ordersWithBundles}</h3>
                  <div className="text-success small">
                    <i className="bi bi-arrow-up"></i> 8.3% from last period
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title text-muted text-uppercase small">Total Orders Analyzed</h6>
                    <i className="bi bi-graph-up text-info"></i>
                  </div>
                  <h3 className="fw-bold">{analytics.totalOrdersAnalyzed}</h3>
                  <div className="text-muted small">All time orders</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title text-muted text-uppercase small">Unique Bundles</h6>
                    <i className="bi bi-box-seam text-warning"></i>
                  </div>
                  <h3 className="fw-bold">{analytics.bundleCount}</h3>
                  <div className="text-success small">
                    <i className="bi bi-arrow-up"></i> 3 new this month
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts Section */}
          <Row className="g-4 mb-4">
            {/* Revenue Trend Chart */}
            <Col lg={8}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Revenue Trend</h5>
                    <span className="badge bg-light text-dark">Last 7 Days</span>
                  </div>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getRevenueTrendData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip currency={analytics.currency || "USD"} />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke={CHART_COLORS.revenue}
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Bundle Distribution Pie Chart */}
            <Col lg={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <h5 className="card-title mb-3">Bundle Distribution</h5>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getChartData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {getChartData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS.pie[index % CHART_COLORS.pie.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value, analytics.currency || "USD"),
                            "Revenue",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Bundle Performance Chart */}
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="card-title mb-3">Bundle Performance</h5>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<CustomTooltip currency={analytics.currency || "USD"} />} />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="revenue"
                          name="Revenue"
                          fill={CHART_COLORS.revenue}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="quantity"
                          name="Quantity Sold"
                          fill={CHART_COLORS.quantity}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Top Bundles Table */}
          <Row>
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Top Bundles</h5>
                    <button className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-download me-1"></i> Export
                    </button>
                  </div>
                  <Table responsive hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Bundle Name</th>
                        <th className="text-end">Quantity Sold</th>
                        <th className="text-end">Total Revenue</th>
                        <th className="text-end">Average Price</th>
                        <th className="text-end">Conversion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.allBundles.length > 0 ? (
                        analytics.allBundles.map((bundle, idx) => (
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
                                {bundle.name}
                              </div>
                            </td>
                            <td className="text-end">{bundle.totalQuantity.toLocaleString()}</td>
                            <td className="text-end fw-bold">
                              {formatCurrency(bundle.totalRevenue, analytics.currency || "USD")}
                            </td>
                            <td className="text-end">
                              {formatCurrency(bundle.averagePrice, analytics.currency || "USD")}
                            </td>
                            <td className="text-end">
                              <div className="d-flex align-items-center justify-content-end">
                                <span className="me-2">
                                  {((bundle.totalQuantity / analytics.ordersWithBundles) * 100).toFixed(1)}%
                                </span>
                                <div className="progress" style={{ width: "60px", height: "6px" }}>
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{
                                      width: `${((bundle.totalQuantity / analytics.ordersWithBundles) * 100).toFixed(1)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            No bundles found in your orders
                          </td>
                        </tr>
                      )}
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
        .progress {
          background-color: #f0f0f0;
        }
      `}</style>
    </Container>
  );
}
