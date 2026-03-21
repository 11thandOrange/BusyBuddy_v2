import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Card, ButtonGroup, ToggleButton, Spinner, Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { Trash, Pencil, Play } from "react-bootstrap-icons";
import Button from "./Button";
import view from "../assets/view.png";
import videoimg from "../assets/videoimg.png";
import DiscountPreviewModal from "./Modals/DiscountPreviewModal";
import Settings from "./Settings";
import Analytics from "./Analytics/BundleAnalytics";
import OverviewTab from "./OverviewTab";

// Map discount types to editor routes
const EDITOR_ROUTES = {
  "Bundle Discount": "bundle-discount",
  "Buy One Get One": "buy-one-get-one",
  "Volume Discount": "volume-discounts",
  "Mix and Match": "mix-and-match",
};

// Overview items per discount type
const OVERVIEW_ITEMS = {
  "Bundle Discount": [
    { id: "intro", title: "Introduction to Bundles", description: "Learn bundle basics", videoSrc: "/assets/bundle_discount.mp4" },
    { id: "create", title: "Creating a Bundle", description: "Step-by-step guide", videoSrc: "/assets/bundle_discount.mp4" },
    { id: "pricing", title: "Bundle Pricing", description: "Set up discounts", videoSrc: "/assets/bundle_discount.mp4" },
    { id: "display", title: "Display Options", description: "Customize appearance", videoSrc: "/assets/bundle_discount.mp4" },
  ],
  "Buy One Get One": [
    { id: "intro", title: "Introduction to BOGO", description: "Learn BOGO basics", videoSrc: "/assets/bogo.mp4" },
    { id: "create", title: "Creating BOGO Offers", description: "Step-by-step guide", videoSrc: "/assets/bogo.mp4" },
    { id: "rules", title: "BOGO Rules", description: "Configure conditions", videoSrc: "/assets/bogo.mp4" },
    { id: "display", title: "Display Settings", description: "Customize appearance", videoSrc: "/assets/bogo.mp4" },
  ],
  "Volume Discount": [
    { id: "intro", title: "Introduction to Volume Discounts", description: "Learn the basics", videoSrc: "/assets/volume_discount.mp4" },
    { id: "tiers", title: "Setting Up Tiers", description: "Create quantity tiers", videoSrc: "/assets/volume_discount.mp4" },
    { id: "pricing", title: "Tier Pricing", description: "Configure discounts", videoSrc: "/assets/volume_discount.mp4" },
    { id: "display", title: "Display Options", description: "Customize appearance", videoSrc: "/assets/volume_discount.mp4" },
  ],
  "Mix and Match": [
    { id: "intro", title: "Introduction to Mix & Match", description: "Learn the basics", videoSrc: "/assets/mix_match.mp4" },
    { id: "create", title: "Creating Mix & Match", description: "Step-by-step guide", videoSrc: "/assets/mix_match.mp4" },
    { id: "products", title: "Adding Products", description: "Select eligible items", videoSrc: "/assets/mix_match.mp4" },
    { id: "display", title: "Display Settings", description: "Customize appearance", videoSrc: "/assets/mix_match.mp4" },
  ],
};

export default function DiscountList({
  discountType,
  refreshTrigger,
  onBundleCreated,
}) {
  const location = useLocation();
  const tabs = ["Overview", "Discounts", "Settings", "Analytics"];
  const [selectedTab, setSelectedTab] = useState(tabs[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  // Get query string for preserving host and shop params
  const getQueryString = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const host = params.get('host');
    const shop = params.get('shop');
    const queryParams = new URLSearchParams();
    if (host) queryParams.set('host', host);
    if (shop) queryParams.set('shop', shop);
    return queryParams.toString() ? `?${queryParams.toString()}` : '';
  }, [location.search]);

  // Open editor in new tab as standalone page (outside App Bridge shell)
  const openEditor = useCallback((id = null) => {
    const appType = EDITOR_ROUTES[discountType];
    if (!appType) return;
    
    const params = new URLSearchParams(location.search);
    const shop = params.get('shop');
    const queryString = shop ? `?shop=${shop}` : '';
    const path = id ? `/${appType}/editor/${id}` : `/${appType}/editor`;
    // Use editor.html with hash routing to open as standalone page
    window.open(`/editor.html${queryString}#${path}`, '_blank');
  }, [discountType, location.search]);

  useEffect(() => {
    console.log("[DEBUG BundelDiscountList] Component mounted, discountType:", discountType);
    return () => console.log("[DEBUG BundelDiscountList] Component unmounted");
  }, []);

  useEffect(() => {
    if (selectedTab === "Discounts") {
      fetchDiscounts();
    }
  }, [refreshTrigger, selectedTab]);

  const fetchDiscounts = async () => {
    console.log("[DEBUG fetchDiscounts] Starting fetch...");
    setIsLoading(true);
    setError(null);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("[DEBUG fetchDiscounts] Timeout - aborting");
      controller.abort();
    }, 10000);
    
    try {
      // Pass full query string for signature verification
      const apiUrl = `/api/bundles${location.search}`;
      console.log("[DEBUG fetchDiscounts] URL:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log("[DEBUG fetchDiscounts] Response status:", response.status);

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch discounts: ${errorMessage}`);
      }

      const { data } = await response.json();
      console.log("[DEBUG fetchDiscounts] Got data, count:", data?.length);
      const filteredDiscounts = data
        .filter(({ type }) => type === discountType)
        .map((item) => ({ ...item, selected: false }));

      setDiscounts(filteredDiscounts);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError("Request timed out");
        console.error("[DEBUG fetchDiscounts] Request timed out");
      } else {
        setError(err.message || "Failed to fetch discounts");
        console.error("[DEBUG fetchDiscounts] Error:", err);
      }
    } finally {
      setIsLoading(false);
      console.log("[DEBUG fetchDiscounts] Done");
    }
  };

  const handlePriorityChange = async (id, value) => {
    const originalPriority = discounts.find((d) => d._id === id)?.priority;

    // Optimistically update the UI first
    setDiscounts(
      discounts.map((discount) => (discount._id === id ? { ...discount, priority: value } : discount))
    );
    try {
      const res = await fetch(`/api/bundles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: value }),
      });
      // console.log("Priority update response data:", await res.json());
      const { bundleRecords } = await res.json();
      let data = bundleRecords;
      setDiscounts(
        discounts.map((discount) =>
          discount._id === id ? { ...discount, priority: data.priority } : discount
        )
      );
    } catch (err) {
      console.error("Failed to update priority:", err);
    }
  };

  const handleToggleChange = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/bundles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !currentStatus }),
      });
      const { bundleRecords } = await res.json();
      let data = bundleRecords;

      setDiscounts(
        discounts.map((discount) => (discount._id === id ? { ...discount, status: data.status } : discount))
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bundle?")) return;

    try {
      await fetch(`/api/bundles/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      setDiscounts(discounts.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Handle edit - opens editor in new tab with discount ID
  const handleEditClick = (discount) => {
    openEditor(discount._id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const ampm = hour >= 12 ? "pm" : "am";
    const formattedHour = hour % 12 || 12;
    const formattedMinute = minute.toString().padStart(2, "0");

    return `${month} ${day} at ${formattedHour}:${formattedMinute}${ampm}`;
  };

  const handlePreviewClick = (discount) => {
    setSelectedDiscount(discount);
    setShowPreviewModal(true);
  };

  return (
    <Container
      fluid
      className="bg-white"
      style={{
        maxWidth: "1500px",
        margin: "50px auto",
        padding: "5px 15px",
        borderRadius: "15px",
      }}
    >
      <Row>
        <div className="d-flex gap-1">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{
              marginLeft: "0",
              marginRight: "0",
              padding: "0px",
              boxShadow: "1px 1px 4px 0px #0000001A inset",
              backgroundColor: "#F1F2F4",
              borderRadius: "15px",
              marginBottom: "8px",
              height: "51px",
              width: "100%",
            }}
          >
            <ButtonGroup className="d-flex justify-content-center gap-2" style={{ padding: "10px !important" }}>
              {tabs.map((tab, idx) => (
                <ToggleButton
                  key={idx}
                  id={`tab-${idx}`}
                  type="radio"
                  variant={selectedTab === tab ? "dark" : ""}
                  name="tab"
                  value={tab}
                  checked={selectedTab === tab}
                  onChange={(e) => setSelectedTab(e.currentTarget.value)}
                  style={
                    selectedTab === tab
                      ? {
                          backgroundColor: "black",
                          borderColor: "black",
                          borderRadius: "15px",
                          width: "130px",
                          padding: "15px 12px",
                          fontFamily: "Inter",
                          fontStyle: "normal",
                          fontWeight: "600",
                          fontSize: "13px",
                          lineHeight: "100%",
                          color: "white",
                          margin: "0px",
                        }
                      : {
                          borderRadius: "15px",
                          width: "130px",
                          padding: "15px 12px",
                          fontFamily: "Inter",
                          fontStyle: "normal",
                          fontWeight: "600",
                          fontSize: "13px",
                          lineHeight: "100%",
                          color: "#4A4A4A",
                          margin: "0px",
                        }
                  }
                  className="d-flex justify-content-center align-items-center"
                >
                  {tab}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </div>
          {/* Removed custom-button create discount button from tab bar */}
          {false && selectedTab === "Discounts" && (
            <Button
              text="Create Discount"
              onClick={() => openEditor()}
              style={{
                background: "black",
                borderRadius: "12px",
                padding: "15px 12px",
                color: "white",
                width: "200px",
                height: "51px",
              }}
            />
          )}
        </div>
      </Row>

      {selectedTab === "Discounts" && (
        <div className="d-flex justify-content-between my-2 px-2 py-1">
          <div></div>
          <div></div>
        </div>
      )}

      <Row
        className="mt-2"
        style={{
          padding: "0px",
          boxShadow: "1px 1px 4px 0px #0000001A inset",
          backgroundColor: "#F1F2F4",
          borderRadius: "15px",
        }}
      >
        {selectedTab === "Overview" && (
          <OverviewTab 
            items={OVERVIEW_ITEMS[discountType] || OVERVIEW_ITEMS["Bundle Discount"]} 
            defaultTitle={`Get Started with ${discountType}`}
          />
        )}

        {selectedTab === "Discounts" && (
          <>
            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3 p-3">
                {discounts.length === 0 ? (
                  <div className="text-center py-5">
                    <p>
                      No {discountType === "Volume Discount" ? "volume discounts" : "bundles"} found. Create
                      your first one!
                    </p>
                  </div>
                ) : (
                  discounts.map((discount, index) => (
                    <Row key={discount._id} className="g-0 linrrow mb-3">
                      <Col>
                        <Card
                          className="border-0"
                          style={{ background: "rgb(241, 242, 244)", borderRadius: "12px" }}
                        >
                          <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                            {/* Left Side: Image + Details */}
                            <div className="d-flex align-items-start gap-3 flex-grow-1 min-w-0">
                              <img
                                src={discount.products[0]?.media}
                                alt={discount.products[0]?.title || "Discount Product"}
                                width={80}
                                height={80}
                                className="flex-shrink-0"
                                style={{ objectFit: "cover", borderRadius: "8px" }}
                              />

                              <div className="bundlebox text-truncate" style={{ minWidth: 0 }}>
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                  <span className="fw-bold text-truncate" style={{ maxWidth: "250px" }}>
                                    {discount.title || `${discountType} #${index + 1}`}
                                  </span>
                                  <div
                                    className="previewbtn text-primary"
                                    onClick={() => handlePreviewClick(discount)}
                                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                                  >
                                    <img src={view} width={13} height={13} alt="preview" className="me-1" />
                                    Preview
                                  </div>
                                </div>

                                <p className="text-muted mb-1 small">
                                  {discount.internalName ||
                                    (discountType === "Volume Discount"
                                      ? "Buy Together & Save More!🔥!"
                                      : "Bundle and Save!")}
                                </p>

                                {/* Wrap product titles */}
                                <div className="d-flex flex-wrap gap-2 small text-truncate">
                                  {discount.products.map((product, idx) => (
                                    <span
                                      key={`${discount._id}-product-${product.productId || idx}`}
                                      className="badge bg-light text-dark text-truncate"
                                      style={{ maxWidth: "120px" }}
                                    >
                                      {product.title}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Actions */}
                            <div className="d-flex align-items-center gap-3 flex-shrink-0">
                              <Form.Group className="d-flex align-items-center gap-2 mb-0">
                                <Form.Label className="inputtitle mb-0">Priority</Form.Label>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  value={discount.priority || 0}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value >= 0) {
                                      handlePriorityChange(discount._id, value);
                                    }
                                  }}
                                  style={{
                                    background: "white",
                                    width: "70px",
                                    height: "29px",
                                    color: "black",
                                  }}
                                  className="inputbox"
                                />
                              </Form.Group>

                              <div className="d-flex flex-column align-items-end">
                                <p className="datetext mb-1 small">{formatDate(discount.createdAt)}</p>
                                <div className="d-flex align-items-center gap-2">
                                  <Form.Check
                                    type="switch"
                                    id={`toggle-${discount._id}`}
                                    checked={discount.status}
                                    onChange={() => handleToggleChange(discount._id, discount.status)}
                                  />
                                  <span
                                    style={{
                                      color: discount.status ? "#4CAF50" : "#616161",
                                      fontSize: "14px",
                                      minWidth: "60px",
                                    }}
                                  >
                                    {discount.status ? "Active" : "Inactive"}
                                  </span>
                                  <Button
                                    text={<Pencil size={16} />}
                                    onClick={() => handleEditClick(discount)}
                                    style={{
                                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                                      color: "#2196F3",
                                      border: "1px solid #2196F3",
                                      borderRadius: "8px",
                                      padding: "6px 8px",
                                    }}
                                  />
                                  <Button
                                    text={<Trash size={16} />}
                                    onClick={() => handleDeleteOne(discount._id)}
                                    style={{
                                      backgroundColor: "rgba(196, 41, 14, 0.1)",
                                      color: "#C4290E",
                                      border: "1px solid #C4290E",
                                      borderRadius: "8px",
                                      padding: "6px 8px",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  ))
                )}
              </div>
            )}
          </>
        )}
        {selectedTab === "Settings" && (
          <Col lg={12} className="p-4">
            <Settings />
          </Col>
        )}
        {selectedTab === "Analytics" && (
          <Col lg={12} className="p-4">
            <Analytics />
          </Col>
        )}
      </Row>
      {/* Add the modal component at the bottom */}
      <DiscountPreviewModal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        discount={selectedDiscount}
      />
    </Container>
  );
}