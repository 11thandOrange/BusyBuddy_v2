import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ButtonGroup, ToggleButton, Alert, Spinner, Form } from "react-bootstrap";
import { Play, ArrowRight, Trash } from "react-bootstrap-icons";
import Button from "./Button";
import view from "../assets/view.png";
import videoimg from "../assets/videoimg.png";
import BundleDiscountActions from "../apps/bundle-discounts/bundleDiscountActions";
import VolumeDiscountActions from "../apps/volume-discounts/volumeDiscountActions";
import DiscountPreviewModal from "./Modals/DiscountPreviewModal";
export default function DiscountList({ onMakeBundleClick, discountType }) {
  const tabs = ["Overview", "Discounts", "Setting", "Analytics"];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [showAction, setShowAction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [status, setStatus] = useState(false);
  useEffect(() => {
    if (selectedTab === "Discounts") {
      fetchDiscounts();
    }
  }, [selectedTab, discountType]);

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

  const handleSelectAllChange = () => {
    const newSelectAllState = !selectAll;
    setSelectAll(newSelectAllState);
    setDiscounts(
      discounts.map((discount) => ({
        ...discount,
        selected: newSelectAllState,
      }))
    );
  };

  const handleDiscountSelectionChange = (id) => {
    setDiscounts(
      discounts.map((discount) =>
        discount._id === id ? { ...discount, selected: !discount.selected } : discount
      )
    );
  };

  const handlePriorityChange = () => {
    setStatus(!status);
  };

  // const handleToggleChange = (id) => {
  //   setDiscounts(
  //     discounts.map((discount) =>
  //       discount._id === id ? { ...discount, status: !discount.status } : discount
  //     )
  //   );
  // };
  const handleToggleChange = (id) => {
    setDiscounts(
      discounts.map((discount) =>
        discount._id === id ? { ...discount, status: !discount.status } : discount
      )
    );
  };

  const handleDeleteSelected = () => {
    // Implement delete functionality here
    console.log("Deleting selected discounts");
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

  if (showAction) {
    return discountType === "Volume Discount" ? <VolumeDiscountActions /> : <BundleDiscountActions />;
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
              onClick={() => console.log("Create Discount")}
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
          <Button
            text={
              <div className="slecetbox">
                <Form.Check
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                  className="custom-checkbox me-2"
                />
                <p className="selecttext">Select All</p>
              </div>
            }
            onClick={() => {}}
            style={{
              backgroundColor: "white",
              border: "1px solid rgba(34, 34, 34, 0.1)",
              display: "flex",
              borderRadius: "8px",
              padding: "7px 10px 7px 7px",
              color: "black",
            }}
          />

          <Button
            text={
              <>
                <Trash style={{ marginRight: "6px" }} />
                Delete All
              </>
            }
            onClick={handleDeleteSelected}
            style={{
              backgroundColor: "rgba(196, 41, 14, 0.1)",
              color: "#C4290E",
              border: "1px solid #C4290E",
              borderRadius: "8px",
              padding: "7px 10px 7px 7px",
            }}
          />
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
                    <Row key={discount._id} className="g-0 linrrow">
                      <Col sm={9} md={9} lg={12}>
                        <Card className="border-0 w-150" style={{ background: "rgb(241, 242, 244)" }}>
                          <Card.Body className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <Form.Check
                                type="checkbox"
                                checked={discount.selected}
                                onChange={() => handleDiscountSelectionChange(discount._id)}
                                className="custom-checkbox me-2"
                              />

                              <img
                                src={discount.products[0]?.media || tshirt}
                                alt={discount.products[0]?.title || "Discount Product"}
                                width={80}
                                height={80}
                                className="me-2"
                                style={{ objectFit: "cover" }}
                              />
                              <div className="bundlebox">
                                <div className="bundletxxtb1">
                                  <span className="bundletext">
                                    {discount.title || `${discountType} #${index + 1}`}
                                  </span>
                                  <div
                                    className="previewbtn"
                                    onClick={() => handlePreviewClick(discount)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <img src={view} width={13} height={13} alt="preview" />
                                    Preview
                                  </div>
                                </div>
                                <p className="buymorebtn">
                                  {discount.internalName ||
                                    (discountType === "Volume Discount"
                                      ? "Buy More, Save More!"
                                      : "Bundle and Save!")}
                                </p>
                                <div className="bundletxtb2">
                                  {discount.products.map((product, idx) => (
                                    <p key={product.productId}>{product.title}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div
                              className="d-flex align-items-center justify-content-between gap-2"
                              style={{ width: "25%" }}
                            >
                              <Form.Group className="mt-1 d-flex align-items-center gap-2">
                                <Form.Label className="inputtitle mt-1">Priority</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder=""
                                  value={discount.priority || ""}
                                  onChange={(e) => handlePriorityChange(discount._id, e.target.value)}
                                  style={{
                                    background: "white",
                                    width: "80px",
                                    height: "29px",
                                  }}
                                  className="inputbox"
                                />
                              </Form.Group>

                              <div className="togglebox">
                                <p className="datetext mt-2">{formatDate(discount.createdAt)}</p>
                                <Form.Check
                                  type="switch"
                                  id={`discount-toggle-${discount._id}`}
                                  checked={discount.status}
                                  onChange={handleToggleChange}
                                  className="custom-switch-toggle"
                                  style={{ width: "41px", height: "21px" }}
                                />
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
