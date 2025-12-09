import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ButtonGroup,
  ToggleButton,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Play, ArrowRight } from "react-bootstrap-icons";
import AnnouncementBarActions from "./inactiveTabMessageActions";
import tshirt from "./tshirt.png";
import "./inactiveTabMessageStyles.css";
import Button from "../../components/Button";
import { X, Trash, Upload } from "react-bootstrap-icons";
import view from "../../assets/view.png";
import videoimg from "../../assets/videoimg.png";
import EmojiPicker from "emoji-picker-react";
import inactiveTabMessageVideo from "../../assets/inactive_tab_message.mp4";

export default function DiscountList({ onMakeBundleClick }) {
  const tabs = ["Overview", "Setting"];
  const [selectedTab, setSelectedTab] = useState(tabs[1]);
  const [bundles, setBundles] = useState({ bundle1: false, bundle2: false });
  const [showBundleAction, setShowBundleAction] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isToggled, setIsToggled] = useState(true);
  const [checkboxes, setCheckboxes] = useState([false, false, false, false]);
  const [toggles, setToggles] = useState([true, true, true, true]);
  const [showEmojiPickerMessage, setShowEmojiPickerMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // Add this state for stored image URL
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const fileInputRef = useRef(null);

  const handleCheckboxChange = (index) => {
    setCheckboxes((prev) =>
      prev.map((checked, i) => (i === index ? !checked : checked))
    );
  };

  const handleToggleChange = (index) => {
    setToggles((prev) =>
      prev.map((toggled, i) => (i === index ? !toggled : toggled))
    );
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert("File size must be less than 5MB", "danger");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        showAlert("Please select an image file", "danger");
        return;
      }

      setImage(file);
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/inactive-tab/settings", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load settings");
        }

        const data = await response.json();

        if (data.status === "SUCCESS") {
          setMessage(data.data.message || "");
          setStartDate(
            data.data.startDate ? data.data.startDate.split("T")[0] : ""
          );
          setEndDate(data.data.endDate ? data.data.endDate.split("T")[0] : "");
          setIsEnabled(
            data.data.isEnabled !== undefined ? data.data.isEnabled : true
          );

          // Store the image URL from Shopify
          if (data.data.imageUrl) {
            setImageUrl(data.data.imageUrl);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        showAlert("Failed to load settings", "danger");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      showAlert("Please enter a message", "danger");
      return;
    }

    try {
      setLoading(true);

      // First upload image if exists
      let uploadedImageUrl = imageUrl; // Use existing image URL by default
      let fileId = null;

      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const uploadResponse = await fetch("/api/inactive-tab/upload-image", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        if (uploadData.status === "SUCCESS") {
          uploadedImageUrl = uploadData.data.imageUrl;
          fileId = uploadData.data.fileId;
        } else {
          throw new Error(uploadData.error || "Image upload failed");
        }
      }

      // Save settings
      const settingsResponse = await fetch("/api/inactive-tab/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          startDate: startDate || null,
          endDate: endDate || null,
          imageUrl: uploadedImageUrl, // Use the uploaded or existing image URL
          isEnabled,
        }),
        credentials: "include",
      });

      if (!settingsResponse.ok) {
        throw new Error("Failed to save settings");
      }

      const settingsData = await settingsResponse.json();

      if (settingsData.status === "SUCCESS") {
        showAlert("Settings saved successfully!");
        // Update the image URL state with the new URL
        if (uploadedImageUrl) {
          setImageUrl(uploadedImageUrl);
        }
        if (image) setImage(null); // Clear the temporary image file
      } else {
        throw new Error(settingsData.error || "Save failed");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert(
        error.message || "An error occurred while saving settings",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = () => {
    setIsEnabled(!isEnabled);
  };
  const handleRemoveImage = () => {
    setImage(null);
    setImageUrl(null);
  };
  if (showBundleAction) {
    return <AnnouncementBarActions />;
  }

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
      {/* Alert Notification */}
      {alert.show && (
        <Alert variant={alert.type} className="mt-3">
          {alert.message}
        </Alert>
      )}

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
            <ButtonGroup
              className="d-flex gap-2"
              style={{ padding: "10px !important" }}
            >
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
            {/* Video Display */}
            <Col
              lg={6}
              md={12}
              style={{
                padding: "50px",
              }}
            >
              <Card
                className="border-0 h-100 "
                style={{ background: "transparent !important" }}
              >
                <Card.Body
                  className="p-0 "
                  style={{ background: "transparent !important" }}
                >
                  <div className="position-relative h-100">
                    <video
                      controls
                      // poster={videoimg}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "15px",
                        padding: "4px",
                      }}
                    >
                      <source
                        src={inactiveTabMessageVideo}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                    {/* <div className="position-absolute top-50 start-50 translate-middle">
                      <Button
                        text={<Play size={24} />}
                        onClick={() => console.log("Discard")}
                        variant="light"
                        className="rounded-circle p-3 opacity-75"
                      />
                    </div> */}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Side Features */}
            <Col
              lg={6}
              md={12}
              style={{
                padding: "50px 0",
              }}
            >
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
                      <h5
                        className="mb-1"
                        style={{
                          fontWeight: 600,
                          fontSize: "16px",
                          letterSpacing: "0",
                        }}
                      >
                        Customizable
                      </h5>
                      <p
                        className="text-secondary mb-0"
                        style={{
                          fontWeight: 500,
                          fontSize: "14px",
                          letterSpacing: "0",
                          color: "#616161",
                        }}
                      >
                        Show off custom messages & sales!
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
                        <rect
                          x="2"
                          y="3"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    </div>
                    <div>
                      <h5
                        className="mb-1"
                        style={{
                          fontWeight: 600,
                          fontSize: "16px",
                          letterSpacing: "0",
                        }}
                      >
                        Responsive
                      </h5>
                      <p
                        className="text-secondary mb-0"
                        style={{
                          fontWeight: 500,
                          fontSize: "14px",
                          letterSpacing: "0",
                          color: "#616161",
                        }}
                      >
                        Works in any browser.
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
                      <h5
                        className="mb-1"
                        style={{
                          fontWeight: 600,
                          fontSize: "16px",
                          letterSpacing: "0",
                        }}
                      >
                        Attention grabbing
                      </h5>
                      <p
                        className="text-secondary mb-0"
                        style={{
                          fontWeight: 500,
                          fontSize: "14px",
                          letterSpacing: "0",
                          color: "#616161",
                        }}
                      >
                        Keep your customers coming back for more!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-start flex-column">
                  <div>
                    <span
                      className="text-secondary"
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        letterSpacing: "0",
                        textAlign: "center",
                      }}
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
                      How to create inactive tab messages?
                    </a>
                  </div>
                </div>
              </div>
            </Col>
          </>
        )}

        {selectedTab === "Setting" && (
          <div className="d-flex flex-column gap-3 p-4">
            {loading && (
              <div className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <Row className="g-0 linrrow">
                <Card
                  className="border-0 w-full"
                  style={{ background: "rgb(241, 242, 244)" }}
                >
                  <Card.Body className="d-flex align-items-center justify-content-between">
                    <div className="d-flex flex-column gap-3 w-100">
                      <Form.Group>
                        <Form.Label className="inputtitle">Message</Form.Label>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            width: "100%",
                            position: "relative",
                          }}
                        >
                          <div style={{ position: "relative", flexGrow: 1 }}>
                            <Form.Control
                              className="inputbox"
                              type="text"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Enter message to display when tab is inactive"
                              style={{
                                paddingRight: "35px",
                                borderRadius: "8px",
                              }}
                              disabled={loading}
                            />

                            {/* Emoji Icon Inside Input */}
                            <span
                              onClick={() =>
                                setShowEmojiPicker((prev) => !prev)
                              }
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                color: "#6c757d",
                                fontSize: "1.5rem",
                              }}
                            >
                              😀
                            </span>

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "50px",
                                  right: "0",
                                  zIndex: 100,
                                }}
                              >
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                              </div>
                            )}
                          </div>
                        </div>

                        <p
                          style={{
                            fontFamily: "Inter",
                            fontStyle: "normal",
                            fontWeight: "500",
                            fontSize: "13px",
                            lineHeight: "100%",
                            color: "#616161",
                          }}
                          className="mt-2"
                        >
                          The message that will show in the browser tab's title
                          when the visitor changes to another tab.
                        </p>
                      </Form.Group>

                      {/* Inactive Tab Message - Favicon  */}
                      <Form.Group className="mt-3">
                        <Form.Label className="inputtitle">Favicon</Form.Label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            width: "100%",
                            position: "relative",
                          }}
                        >
                          {/* Image Preview - Updated to show both temporary and stored images */}
                          {image || imageUrl ? (
                            <div
                              style={{
                                marginTop: "8px",
                                position: "relative",
                                display: "inline-block",
                              }}
                            >
                              <img
                                src={
                                  image ? URL.createObjectURL(image) : imageUrl
                                }
                                alt="Preview"
                                width="100"
                                height="80"
                                style={{
                                  borderRadius: "6px",
                                  border: "1px solid #ccc",
                                  objectFit: "cover",
                                }}
                              />
                              <Button
                                text={<X size={12} />}
                                onClick={handleRemoveImage}
                                style={{
                                  position: "absolute",
                                  top: "-8px",
                                  right: "-8px",
                                  backgroundColor: "rgba(0,0,0,0.7)",
                                  color: "white",
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                  padding: "0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 10,
                                }}
                              />
                            </div>
                          ) : (
                            <div className="m-1">
                              {/* Upload Icon Outside Input */}
                              <span
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                  cursor: "pointer",
                                  color: "#6c757d",
                                  fontSize: "1.6rem",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Upload />
                              </span>
                              {/* Hidden File Input */}
                              <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                style={{ display: "none" }}
                                disabled={loading}
                              />
                            </div>
                          )}
                        </div>
                        <p
                          style={{
                            fontFamily: "Inter",
                            fontStyle: "normal",
                            fontWeight: "500",
                            fontSize: "13px",
                            lineHeight: "100%",
                            color: "#616161",
                          }}
                          className="mt-2"
                        >
                          Uploaded Image will be used as your favicon.
                        </p>
                      </Form.Group>

                      {/* Start & End Date */}
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "15px",
                        }}
                      >
                        <Form.Group controlId="startDate" style={{ flex: 1 }}>
                          <Form.Label>Start Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={loading}
                          />
                        </Form.Group>
                        <Form.Group controlId="endDate" style={{ flex: 1 }}>
                          <Form.Label>End Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={loading}
                          />
                        </Form.Group>
                      </div>
                      <p
                        style={{
                          fontFamily: "Inter",
                          fontStyle: "normal",
                          fontWeight: "500",
                          fontSize: "13px",
                          lineHeight: "100%",
                          color: "#616161",
                        }}
                      >
                        Optionally schedule the Inactive Tab Message to show on
                        specific dates.
                      </p>

                      {/* Enable/Disable Toggle */}
                      {/* <Form.Group className="mt-3">
                        <Form.Check
                          type="switch"
                          id="enable-switch"
                          label="Enable inactive tab messages"
                          checked={isEnabled}
                          onChange={handleToggleEnabled}
                          disabled={loading}
                        />
                      </Form.Group> */}

                      {/* Submit Button */}
                      <div className="mt-4">
                        <Button
                          type="submit"
                          text={loading ? "Saving..." : "Save Settings"}
                          disabled={loading}
                          style={{
                            background: "black",
                            borderRadius: "12px",
                            padding: "12px 24px",
                            color: "white",
                            width: "200px",
                          }}
                        />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Row>
            </Form>
          </div>
        )}
      </Row>
    </Container>
  );
}
