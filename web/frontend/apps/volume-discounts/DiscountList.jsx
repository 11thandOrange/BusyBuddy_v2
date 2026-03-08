import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ButtonGroup, ToggleButton, Alert, Spinner } from "react-bootstrap";
import { Play, ArrowRight } from "react-bootstrap-icons";
import { Form } from "react-bootstrap";
import VolumeDiscountActions from "./volumeDiscountActions";
import tshirt from "./tshirt.png";
import "./volumeDiscountStyles.css";
import Button from "../../components/Button";
import { X, Trash } from "react-bootstrap-icons";
import view from "../../assets/view.png";
import videoimg from "../../assets/videoimg.png";
import VideoList from "../../components/VideoList";

// Volume Discounts specific videos
const volumeDiscountVideos = [
  {
    id: 1,
    title: "Volume Discount Setup",
    description: "Create tiered pricing for bulk purchases",
    src: "/videos/volume-getting-started.mp4",
    poster: null,
    duration: "2:45"
  },
  {
    id: 2,
    title: "Tier Configuration",
    description: "Set up multiple discount tiers",
    src: "/videos/volume-tiers.mp4",
    poster: null,
    duration: "3:20"
  },
  {
    id: 3,
    title: "Display Customization",
    description: "Customize how volume pricing is displayed",
    src: "/videos/volume-display.mp4",
    poster: null,
    duration: "2:30"
  },
  {
    id: 4,
    title: "Volume Strategy Tips",
    description: "Maximize sales with volume pricing",
    src: "/videos/volume-strategy.mp4",
    poster: null,
    duration: "3:45"
  }
];

export default function DiscountList({ onMakeBundleClick }) {
  const tabs = ["Overview", "Discounts", "Setting", "Analytics"];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [showBundleAction, setShowBundleAction] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isToggled, setIsToggled] = useState(true); // Toggle button in active state
  const [checkboxes, setCheckboxes] = useState([false, false, false, false]);
  const [toggles, setToggles] = useState([true, true, true, true]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  useEffect(() => {
    if (selectedTab === "Discounts") {
      fetchDiscounts();
    }
  }, [selectedTab]);
  const handleCheckboxChange = (index) => {
    setCheckboxes((prev) => prev.map((checked, i) => (i === index ? !checked : checked)));
  };

  const handleToggleChange = (index) => {
    setToggles((prev) => prev.map((toggled, i) => (i === index ? !toggled : toggled)));
  };
  const handleBundleChange = (e) => {
    setBundles({
      ...bundles,
      [e.target.name]: e.target.checked,
    });
  };

  if (showBundleAction) {
    return <VolumeDiscountActions />;
  }
  const handleSelectAllChange = () => {
    const newSelectAllState = !selectAll;
    setSelectAll(newSelectAllState);

    // Update all bundles with the new selected state
    setBundles(
      bundles.map((bundle) => ({
        ...bundle,
        selected: newSelectAllState,
      }))
    );
  };
  const handleBundleSelectionChange = (bundleId) => {
    setBundles(
      bundles.map((bundle) => (bundle._id === bundleId ? { ...bundle, selected: !bundle.selected } : bundle))
    );
  };
  //  const handleToggleChange = (bundleId) => {
  //   setBundles(bundles.map(bundle =>
  //     bundle._id === bundleId ? { ...bundle, status: !bundle.status } : bundle
  //   ));
  // };

  const handlePriorityChange = (bundleId, value) => {
    setBundles(bundles.map((bundle) => (bundle._id === bundleId ? { ...bundle, priority: value } : bundle)));
  };

  const handleDeleteSelected = () => {
    // Implement delete functionality here
    console.log("Deleting selected bundles");
  };

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
        const errorMessage = await response.text(); // Get the error message from the response
        throw new Error(`Failed to fetch discounts: ${errorMessage}`);
      }

      const { data } = await response.json(); // Destructure data from the response
      console.log("Response data:", data);

      const volumeDiscounts = data
        .filter(({ type }) => type === "Volume Discount") // Filter for volume discounts
        .map((item) => ({ ...item, selected: false })); // Map to add selected property

      setBundles(volumeDiscounts);
    } catch (err) {
      setError(err.message || "Failed to fetch discounts");
      console.error("Error fetching discounts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date function
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
  return (
    <Container
      fluid
      className="bg-white"
      style={{
        maxWidth: "1500px",
        margin: "50px auto",
        padding: "10px !important",
        borderRadius: "15px",
        padding: "5px 15px",
      }}
    >
      {/* Navigation Tabs */}
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
            {/* Left-aligned Toggle Buttons */}
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
        </div>
      </Row>
      {selectedTab === "Discounts" && (
        <div className="d-flex justify-content-between  my-2 px-2 py-1">
          <Button
            text={
              <div className="slecetbox">
                <Form.Check type="checkbox" checked={isChecked} className="custom-checkbox me-2" />{" "}
                <p className="selecttext">Select All</p>
              </div>
            }
            onClick={() => console.log("Select")}
            style={{
              backgroundColor: "white",
              color: "#5169DD",
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
            onClick={() => console.log("clear")}
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
          <VideoList videos={volumeDiscountVideos} appName="Volume Discounts" />
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
                {bundles.length === 0 ? (
                  <div className="text-center py-5">
                    <p>No bundles found. Create your first bundle!</p>
                  </div>
                ) : (
                  bundles.map((bundle, index) => (
                    <Row key={bundle._id} className="g-0 linrrow">
                      <Col sm={9} md={9} lg={12}>
                        <Card className="border-0 w-150" style={{ background: "rgb(241, 242, 244)" }}>
                          <Card.Body className="d-flex align-items-center justify-content-between">
                            {/* Left side - Checkbox and Bundle Name */}
                            <div className="d-flex align-items-center">
                              <Form.Check
                                type="checkbox"
                                checked={bundle.selected}
                                onChange={() => handleBundleSelectionChange(bundle._id)}
                                className="custom-checkbox me-2"
                              />

                              <img
                                src={bundle.products[0]?.media || tshirt}
                                alt={bundle.products[0]?.title || "Bundle Product"}
                                width={80}
                                height={80}
                                className="me-2"
                                style={{ objectFit: "cover" }}
                              />
                              <div className="bundlebox">
                                <div className="bundletxxtb1">
                                  <span className="bundletext">{bundle.title || `Bundle #${index + 1}`}</span>
                                  <div className="previewbtn">
                                    <img src={view} width={13} height={13} alt="preview" />
                                    Preview
                                  </div>
                                </div>
                                <p className="buymorebtn">{bundle.internalName || "Buy Together & Save More!🔥!"}</p>
                                <div className="bundletxtb2">
                                  {bundle.products.map((product, idx) => (
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
                                  value={bundle.priority || ""}
                                  onChange={(e) => handlePriorityChange(bundle._id, e.target.value)}
                                  style={{
                                    background: "white",
                                    width: "80px",
                                    height: "29px",
                                  }}
                                  className="inputbox"
                                />
                              </Form.Group>

                              <div className="togglebox">
                                <p className="datetext mt-2">{formatDate(bundle.createdAt)}</p>
                                <Form.Check
                                  type="switch"
                                  id={`bundle-toggle-${bundle._id}`}
                                  checked={bundle.status}
                                  onChange={() => handleToggleChange(bundle._id)}
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
    </Container>
  );
}

