import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Badge, Spinner, Alert, Card, Form } from "react-bootstrap";

export default function Bundles() {
  const [bundles, setBundles] = useState([]);
  const [filteredBundles, setFilteredBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBundle, setExpandedBundle] = useState(null);
  const [filters, setFilters] = useState({
    externalName: "",
    bundleType: "",
  });

  // Bundle type options
  const bundleTypes = [
    { value: "", label: "All Types" },
    { value: "BundleDiscount", label: "BOGO" },
    { value: "BuyOneGetOne", label: "Standard Bundle" },
    { value: "VolumeDiscount", label: "Volume" },
    { value: "mixAndMatch", label: "Mix & Match" },
  ];
  // Create a map from value -> label
  const typeLabelMap = {
    BundleDiscount: "BOGO",
    BuyOneGetOne: "Standard Bundle",
    VolumeDiscount: "Volume",
    mixAndMatch: "Mix & Match",
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  useEffect(() => {
    // Apply filters whenever bundles or filters change
    applyFilters();
  }, [bundles, filters]);

  const fetchBundles = async () => {
    try {
      const response = await fetch("/api/products/bundel-products");
      const data = await response.json();
      console.log("bundelssss:::", data);

      if (data.status) {
        setBundles(data.bundles);
      } else {
        setError(data.message || "Failed to fetch bundles");
      }
    } catch (err) {
      setError("Network error: Could not fetch bundles");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let result = [...bundles];

    // Filter by external name (case-insensitive)
    if (filters.externalName) {
      result = result.filter((bundle) =>
        bundle.title.toLowerCase().includes(filters.externalName.toLowerCase())
      );
    }

    // Filter by bundle type (using tags)
    if (filters.bundleType) {
      result = result.filter(
        (bundle) => bundle.tags?.includes(filters.bundleType) // 👈 check inside tags
      );
    }

    setFilteredBundles(result);
  };

  const toggleExpand = (bundleId) => {
    if (expandedBundle === bundleId) {
      setExpandedBundle(null);
    } else {
      setExpandedBundle(bundleId);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">Loading bundles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <div className="bundles-page py-5" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Container>
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Body className="py-4">
                <h1 className="display-5 fw-bold text-center mb-0" style={{ color: "#2c3e50" }}>
                  Bundles
                </h1>
                <p className="text-muted text-center mb-0 mt-2">
                  Special curated collections for maximum value
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters Section */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Filter Bundles</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Search by Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter bundle name..."
                        name="externalName"
                        value={filters.externalName}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bundle Type</Form.Label>
                      <Form.Select name="bundleType" value={filters.bundleType} onChange={handleFilterChange}>
                        {bundleTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {filteredBundles.length === 0 ? (
          <Row>
            <Col>
              <Card className="text-center py-5">
                <Card.Body>
                  <h3 className="text-muted">No bundles found</h3>
                  <p>Try adjusting your filters to see more results.</p>
                  <Button
                    variant="outline-primary"
                    onClick={() => setFilters({ externalName: "", bundleType: "" })}
                  >
                    Clear Filters
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead style={{ backgroundColor: "#3498db", color: "white" }}>
                        <tr>
                          <th>Bundle Name</th>
                          <th className="text-center">Variants</th>
                          <th className="text-end">Price Range</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBundles.map((bundle) => {
                          const lowestPrice = Math.min(
                            ...bundle.variants.nodes.map((v) => parseFloat(v.price))
                          );
                          const highestPrice = Math.max(
                            ...bundle.variants.nodes.map((v) => parseFloat(v.price))
                          );

                          return (
                            <React.Fragment key={bundle.id}>
                              <tr
                                style={{
                                  backgroundColor: expandedBundle === bundle.id ? "#f1f8ff" : "white",
                                }}
                              >
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div
                                      className="rounded me-3 d-flex align-items-center justify-content-center"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        backgroundColor: "#e9ecef",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <span style={{ color: "#6c757d", fontSize: "10px" }}>Image</span>
                                    </div>
                                    <div>
                                      <div className="fw-semibold">{bundle.title}</div>
                                      <Badge bg="warning" text="dark" className="mt-1">
                                        Bundle
                                      </Badge>
                                      {/* Display bundle type if available */}
                                      {/* Display bundle type if available */}
                                      {bundle.tags &&
                                        bundle.tags.map((tag) =>
                                          typeLabelMap[tag] ? (
                                            <Badge bg="info" className="ms-1 mt-1" key={tag}>
                                              {typeLabelMap[tag]}
                                            </Badge>
                                          ) : null
                                        )}
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center">{bundle.variants.nodes.length}</td>
                                <td className="text-end fw-semibold" style={{ color: "#e74c3c" }}>
                                  ${lowestPrice.toFixed(2)}
                                  {lowestPrice !== highestPrice && ` - $${highestPrice.toFixed(2)}`}
                                </td>
                                <td className="text-center">
                                  <Button
                                    variant={
                                      expandedBundle === bundle.id ? "outline-secondary" : "outline-primary"
                                    }
                                    size="sm"
                                    onClick={() => toggleExpand(bundle.id)}
                                    className="me-2"
                                  >
                                    {expandedBundle === bundle.id ? "Hide" : "View"} Options
                                  </Button>
                                </td>
                              </tr>
                              {expandedBundle === bundle.id && (
                                <tr>
                                  <td colSpan={4} className="p-4" style={{ backgroundColor: "#f8f9fa" }}>
                                    <h6 className="fw-bold mb-3">Bundle Variants:</h6>
                                    <Table size="sm" bordered>
                                      <thead>
                                        <tr>
                                          <th>Variant Name</th>
                                          <th className="text-end">Price</th>
                                          <th className="text-center">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {bundle.variants.nodes.map((variant) => (
                                          <tr key={variant.id}>
                                            <td>{variant.title}</td>
                                            <td className="text-end fw-semibold">
                                              ${parseFloat(variant.price).toFixed(2)}
                                            </td>
                                            <td className="text-center">
                                              <Button variant="outline-success" size="sm">
                                                Select
                                              </Button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
