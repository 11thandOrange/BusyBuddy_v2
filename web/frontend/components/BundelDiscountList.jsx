import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ButtonGroup, ToggleButton, Alert, Spinner, Form } from "react-bootstrap";
import { Play, ArrowRight, Trash, Pencil } from "react-bootstrap-icons";
import Button from "./Button";
import view from "../assets/view.png";
import videoimg from "../assets/videoimg.png";
import BundleDiscountActions from "../apps/bundle-discounts/bundleDiscountActions";
import VolumeDiscountActions from "../apps/volume-discounts/volumeDiscountActions";
import MixAndMatchActions from "../apps/mix-and-match-discounts/mixMatchActions";
import BuyoneGetoneActionsActions from "../apps/buy-one-get-one/buyoneGetoneActions";
import DiscountPreviewModal from "./Modals/DiscountPreviewModal";
import Settings from "./Settings";
import Analytics from "./Analytics/BundleAnalytics";

export default function DiscountList({
  onMakeBundleClick,
  discountType,
  refreshTrigger,
  onBundleCreated,
  discountActionsRef,
  autoTriggerActions,
}) {
  const tabs = ["Overview", "Discounts", "Setting", "Analytics"];
  const [selectedTab, setSelectedTab] = useState(tabs[1]);
  const [showAction, setShowAction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [status, setStatus] = useState(false);
  const [mainLoading, setMainLoading] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null); // Track which discount is being edited

  useEffect(() => {
    if (autoTriggerActions) {
      const timer = setTimeout(() => {
        setShowAction(true);
        if (onMakeBundleClick) {
          onMakeBundleClick();
        }
        setMainLoading(false);
      }, 10);

      return () => clearTimeout(timer);
    } else {
      setMainLoading(false);
    }
  }, [autoTriggerActions, onMakeBundleClick]);
  // useEffect(() => {
  //   if (selectedTab === "Discounts") {
  //     fetchDiscounts();
  //   }
  // }, [selectedTab, discountType, refreshTrigger]);
  useEffect(() => {
    if (!autoTriggerActions) {
      // Only fetch if not auto-triggering
      if (selectedTab === "Discounts") {
        fetchDiscounts();
      }
    }
  }, [refreshTrigger, autoTriggerActions]);

  if (mainLoading) {
    return (
      <Container
        fluid
        className="bg-white d-flex justify-content-center align-items-center"
        style={{
          maxWidth: "1500px",
          margin: "50px auto",
          borderRadius: "15px",
          height: "300px",
        }}
      >
        <div className="text-center">
          <Spinner animation="border" role="status" variant="dark" />
          <p className="mt-3" style={{ color: "#616161" }}>
            Loading...
          </p>
        </div>
      </Container>
    );
  }

  const fetchDiscounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/bundles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch discounts: ${errorMessage}`);
      }

      const { data } = await response.json();
      const filteredDiscounts = data
        .filter(({ type }) => type === discountType)
        .map((item) => ({ ...item, selected: false }));

      setDiscounts(filteredDiscounts);
    } catch (err) {
      setError(err.message || "Failed to fetch discounts");
      console.error("Error fetching discounts:", err);
    } finally {
      setIsLoading(false);
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
      const { data } = await res.json();

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
      const { data } = await res.json();

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

  // New function to handle edit
  const handleEditClick = (discount) => {
    setEditingDiscount(discount);
    setShowAction(true);
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

  const handleActionSuccess = () => {
    setShowAction(false);
    setEditingDiscount(null); // Reset editing state
    if (onBundleCreated) {
      onBundleCreated();
    }
    // Refresh the discounts list
    fetchDiscounts();
  };

  if (showAction) {
    if (discountType === "Volume Discount") {
      return (
        <VolumeDiscountActions 
          ref={discountActionsRef} 
          onSuccess={handleActionSuccess} 
          editData={editingDiscount} 
        />
      );
    } else if (discountType === "Buy One Get One") {
      return (
        <BuyoneGetoneActionsActions 
          ref={discountActionsRef} 
          onSuccess={handleActionSuccess} 
          editData={editingDiscount} 
        />
      );
    } else if (discountType === "Bundle Discount") {
      return (
        <BundleDiscountActions 
          ref={discountActionsRef} 
          onSuccess={handleActionSuccess} 
          editData={editingDiscount} 
        />
      );
    } else if (discountType === "Mix and Match") {
      return (
        <MixAndMatchActions 
          ref={discountActionsRef} 
          onSuccess={handleActionSuccess} 
          editData={editingDiscount} 
        />
      );
    }
  }

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
            className="d-flex justify-content-between align-items-center"
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
            <ButtonGroup className="d-flex gap-2" style={{ padding: "10px !important" }}>
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
          {selectedTab === "Discounts" && (
            <Button
              text="Create Discount"
              onClick={() => {
                setEditingDiscount(null); // Ensure we're creating new, not editing
                setShowAction(true);
                onMakeBundleClick();
              }}
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
          <>
            <Col lg={6} md={12} style={{ padding: "50px" }}>
              <Card className="border-0 h-100" style={{ background: "transparent !important" }}>
                <Card.Body className="p-0" style={{ background: "transparent !important" }}>
                  <div className="position-relative h-100">
                    <video
                      controls
                      poster={videoimg}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "15px",
                        padding: "4px",
                      }}
                    >
                      <source src="/videos/marshall-promo.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <Button
                        text={<Play size={24} />}
                        onClick={() => console.log("Discard")}
                        variant="light"
                        className="rounded-circle p-3 opacity-75"
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} md={12} style={{ padding: "50px 0" }}>
              <div
                className="d-flex justify-content-between flex-column linrrowleft"
                style={{ height: "100%" }}
              >
                <div>
                  <div className="d-flex mb-3 gap-2 flex-column">
                    <div
                      className="bg-dark rounded-circle d-flex align-items-center justify-content-center"
                      style={{ height: "50px", width: "50px" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                      </svg>
                    </div>
                    <div>
                      <h5 className="mb-1" style={{ fontWeight: 600, fontSize: "16px", letterSpacing: "0" }}>
                        Customizable
                      </h5>
                      <p
                        className="text-secondary mb-0"
                        style={{ fontWeight: 500, fontSize: "14px", letterSpacing: "0", color: "#616161" }}
                      >
                        Discount, Display style & Priority.
                      </p>
                    </div>
                  </div>

                  <div className="d-flex mb-3 gap-2 flex-column">
                    <div
                      className="bg-dark rounded-circle d-flex align-items-center justify-content-center"
                      style={{ height: "50px", width: "50px" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    </div>
                    <div>
                      <h5 className="mb-1" style={{ fontWeight: 600, fontSize: "16px", letterSpacing: "0" }}>
                        Responsive
                      </h5>
                      <p
                        className="text-secondary mb-0"
                        style={{ fontWeight: 500, fontSize: "14px", letterSpacing: "0", color: "#616161" }}
                      >
                        Looks great on any device.
                      </p>
                    </div>
                  </div>

                  <div className="d-flex mb-5 gap-2 flex-column">
                    <div
                      className="bg-dark rounded-circle d-flex align-items-center justify-content-center"
                      style={{ height: "50px", width: "50px" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <path d="M13 2v7h7"></path>
                      </svg>
                    </div>
                    <div>
                      <h5 className="mb-1" style={{ fontWeight: 600, fontSize: "16px", letterSpacing: "0" }}>
                        Attention grabbing
                      </h5>
                      <p
                        className="text-secondary mb-0"
                        style={{ fontWeight: 500, fontSize: "14px", letterSpacing: "0", color: "#616161" }}
                      >
                        Keep your customers informed without disrupting their shopping.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-start flex-column">
                  <Button
                    variant="dark"
                    className="mb-3 d-flex align-items-center justify-content-center"
                    text={`Make your ${discountType === "Volume Discount" ? "Volume" : "Bundle"} Now!`}
                    style={{
                      maxWidth: "220px",
                      borderRadius: "40px",
                      height: "45px",
                      fontWeight: 500,
                      fontSize: "15px",
                      letterSpacing: "0",
                      backgroundColor: "black",
                      borderColor: "black",
                      color: "white",
                      padding: "15px 25px",
                    }}
                    onClick={() => {
                      setEditingDiscount(null);
                      setShowAction(true);
                      onMakeBundleClick();
                    }}
                  />

                  <div>
                    <span
                      className="text-secondary"
                      style={{ fontWeight: 600, fontSize: "14px", letterSpacing: "0", textAlign: "center" }}
                    >
                      Learn More about{" "}
                    </span>
                    <a
                      href="#"
                      className="text-primary"
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        letterSpacing: "0",
                        textAlign: "center",
                        color: "#5169DD",
                      }}
                    >
                      How to create {discountType === "Volume Discount" ? "volume discount" : "bundle"}?
                    </a>
                  </div>
                </div>
              </div>
            </Col>
          </>
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
                                      key={product.productId}
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
        {selectedTab === "Setting" && (
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