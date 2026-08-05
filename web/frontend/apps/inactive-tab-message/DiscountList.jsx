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

export default function DiscountList({ onMakeBundleClick }) {
  const tabs = ["Overview", "Settings"];
  const [selectedTab, setSelectedTab] = useState(tabs[1]);
  const [bundles, setBundles] = useState({ bundle1: false, bundle2: false });
  const [showBundleAction, setShowBundleAction] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isToggled, setIsToggled] = useState(true);
  const [checkboxes, setCheckboxes] = useState([false, false, false, false]);
  const [toggles, setToggles] = useState([true, true, true, true]);
  const [showEmojiPickerMessage, setShowEmojiPickerMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // Add this state for stored image URL
  const [faviconType, setFaviconType] = useState("image"); // "image" | "emoji"
  const [faviconEmoji, setFaviconEmoji] = useState(null);
  const [showFaviconEmojiPicker, setShowFaviconEmojiPicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timezone, setTimezone] = useState("GMT");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef(null);

  const markChanged = () => setHasChanges(true);

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

  const handleFaviconEmojiClick = (emojiData) => {
    setFaviconEmoji(emojiData.emoji);
    setShowFaviconEmojiPicker(false);
    markChanged();
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
      markChanged();
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
            data.data.startDate ? new Date(data.data.startDate).toISOString().slice(0, 16) : ""
          );
          setEndDate(
            data.data.endDate ? new Date(data.data.endDate).toISOString().slice(0, 16) : ""
          );
          setTimezone(data.data.timezone || "GMT");

          if (data.data.faviconEmoji) {
            setFaviconEmoji(data.data.faviconEmoji);
            setFaviconType("emoji");
          } else if (data.data.imageUrl) {
            setImageUrl(data.data.imageUrl);
            setFaviconType("image");
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

      // Favicon is either an uploaded image or an emoji - mutually exclusive.
      let uploadedImageUrl = imageUrl;
      let savedFaviconEmoji = faviconEmoji;

      if (faviconType === "emoji") {
        uploadedImageUrl = null;
      } else {
        savedFaviconEmoji = null;
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
          } else {
            throw new Error(uploadData.error || "Image upload failed");
          }
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
          imageUrl: uploadedImageUrl,
          faviconEmoji: savedFaviconEmoji,
          timezone,
        }),
        credentials: "include",
      });

      if (!settingsResponse.ok) {
        throw new Error("Failed to save settings");
      }

      const settingsData = await settingsResponse.json();

      if (settingsData.status === "SUCCESS") {
        showAlert("Settings saved successfully!");
        if (faviconType === "image" && uploadedImageUrl) {
          setImageUrl(uploadedImageUrl);
        }
        if (image) setImage(null); // Clear the temporary image file
        setHasChanges(false);
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

  const handleRemoveImage = () => {
    setImage(null);
    setImageUrl(null);
    markChanged();
  };
  const handleRemoveFaviconEmoji = () => {
    setFaviconEmoji(null);
    markChanged();
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
                      poster={videoimg}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "15px",
                        padding: "4px",
                      }}
                    >
                      <source
                        src="/videos/marshall-promo.mp4"
                        type="video/mp4"
                      />
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
                        Message, Display timing & Images.
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
                        Keep your customers informed without disrupting their
                        shopping.
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

        {selectedTab === "Settings" && (
          <div className="d-flex flex-column gap-4 p-4">
            {loading && (
              <div className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <div className="d-flex flex-column gap-3">
                {/* 1. Message */}
                <Card className="border-0" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
                  <Card.Body>
                    <h6 style={{ fontWeight: 600, marginBottom: "5px" }}>
                      🔖 Message
                    </h6>
                    <p className="mb-3" style={{ fontSize: "13px", color: "#616161" }}>
                      Shown in the browser tab's title when a visitor switches away from your store.
                    </p>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={message}
                        onChange={(e) => { setMessage(e.target.value); markChanged(); }}
                        placeholder="Enter message to display when tab is inactive"
                        style={{
                          borderRadius: "8px",
                          background: "#fff",
                          border: "1px solid rgba(34, 34, 34, 0.1)",
                          padding: "12px 15px",
                        }}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* 2. Favicon */}
                <Card className="border-0" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
                  <Card.Body>
                    <h6 style={{ fontWeight: 600, marginBottom: "5px" }}>
                      🖼️ Favicon
                    </h6>
                    <p className="mb-3" style={{ fontSize: "13px", color: "#616161" }}>
                      Swaps the tab's icon alongside the message. Choose an uploaded image or an emoji.
                    </p>

                    <ButtonGroup className="mb-3">
                      <ToggleButton
                        id="favicon-type-image"
                        type="radio"
                        variant={faviconType === "image" ? "dark" : "outline-secondary"}
                        checked={faviconType === "image"}
                        value="image"
                        onChange={() => { setFaviconType("image"); markChanged(); }}
                      >
                        Upload Image
                      </ToggleButton>
                      <ToggleButton
                        id="favicon-type-emoji"
                        type="radio"
                        variant={faviconType === "emoji" ? "dark" : "outline-secondary"}
                        checked={faviconType === "emoji"}
                        value="emoji"
                        onChange={() => { setFaviconType("emoji"); markChanged(); }}
                      >
                        Use Emoji
                      </ToggleButton>
                    </ButtonGroup>

                    {faviconType === "image" ? (
                      <>
                        {image || imageUrl ? (
                          <div style={{ position: "relative", display: "inline-block" }}>
                            <img
                              src={image ? URL.createObjectURL(image) : imageUrl}
                              alt="Preview"
                              width="100"
                              height="80"
                              style={{ borderRadius: "8px", border: "1px solid #ccc", objectFit: "cover" }}
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
                          <div
                            onClick={() => fileInputRef.current.click()}
                            className="d-flex align-items-center gap-2"
                            style={{
                              cursor: "pointer",
                              background: "#fff",
                              border: "1px dashed rgba(34, 34, 34, 0.25)",
                              borderRadius: "8px",
                              padding: "14px 16px",
                              width: "fit-content",
                              color: "#616161",
                              fontSize: "13px",
                            }}
                          >
                            <Upload size={16} />
                            Upload an image
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                          disabled={loading}
                        />
                      </>
                    ) : (
                      <div style={{ position: "relative" }}>
                        {faviconEmoji ? (
                          <div className="d-flex align-items-center gap-2">
                            <div
                              style={{
                                fontSize: "2rem",
                                background: "#fff",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                width: "60px",
                                height: "60px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {faviconEmoji}
                            </div>
                            <Button
                              text="Change"
                              onClick={() => setShowFaviconEmojiPicker((prev) => !prev)}
                              style={{ background: "#fff", border: "1px solid rgba(34, 34, 34, 0.1)", borderRadius: "8px", padding: "8px 14px" }}
                            />
                            <Button
                              text={<X size={14} />}
                              onClick={handleRemoveFaviconEmoji}
                              style={{
                                backgroundColor: "rgba(0,0,0,0.7)",
                                color: "white",
                                borderRadius: "50%",
                                width: "28px",
                                height: "28px",
                                padding: "0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => setShowFaviconEmojiPicker((prev) => !prev)}
                            className="d-flex align-items-center gap-2"
                            style={{
                              cursor: "pointer",
                              background: "#fff",
                              border: "1px dashed rgba(34, 34, 34, 0.25)",
                              borderRadius: "8px",
                              padding: "14px 16px",
                              width: "fit-content",
                              color: "#616161",
                              fontSize: "13px",
                            }}
                          >
                            😀 Choose an emoji
                          </div>
                        )}
                        {showFaviconEmojiPicker && (
                          <div style={{ position: "absolute", top: "70px", left: "0", zIndex: 100 }}>
                            <EmojiPicker onEmojiClick={handleFaviconEmojiClick} />
                          </div>
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* 3. Schedule */}
                <Card className="border-0" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
                  <Card.Body>
                    <h6 style={{ fontWeight: 600, marginBottom: "5px" }}>
                      📅 Schedule
                    </h6>
                    <p className="mb-3" style={{ fontSize: "13px", color: "#616161" }}>
                      Optionally limit the message to a date range. Leave both blank to run indefinitely.
                    </p>
                    <Row>
                      <Col md={5}>
                        <Form.Group controlId="startDate">
                          <Form.Label style={{ fontWeight: 500, fontSize: "13px" }}>Start Date & Time</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); markChanged(); }}
                            disabled={loading}
                            style={{ background: "#fff", border: "1px solid rgba(34, 34, 34, 0.1)", borderRadius: "8px", height: "48px" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group controlId="endDate">
                          <Form.Label style={{ fontWeight: 500, fontSize: "13px" }}>End Date & Time</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); markChanged(); }}
                            disabled={loading}
                            style={{ background: "#fff", border: "1px solid rgba(34, 34, 34, 0.1)", borderRadius: "8px", height: "48px" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group controlId="timezone">
                          <Form.Label style={{ fontWeight: 500, fontSize: "13px" }}>Timezone</Form.Label>
                          <Form.Select
                            value={timezone}
                            onChange={(e) => { setTimezone(e.target.value); markChanged(); }}
                            disabled={loading}
                            style={{ background: "#fff", border: "1px solid rgba(34, 34, 34, 0.1)", borderRadius: "8px", height: "48px" }}
                          >
                            <option value="GMT">GMT</option>
                            <option value="EST">EST</option>
                            <option value="PST">PST</option>
                            <option value="UTC">UTC</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <div>
                  <Button
                    type="submit"
                    text={loading ? "Saving..." : "Save Settings"}
                    disabled={loading || !hasChanges}
                    style={{
                      background: "black",
                      borderRadius: "12px",
                      padding: "12px 24px",
                      color: "white",
                      width: "200px",
                      opacity: (loading || !hasChanges) ? 0.5 : 1,
                      cursor: (loading || !hasChanges) ? "not-allowed" : "pointer",
                    }}
                  />
                </div>
              </div>
            </Form>
          </div>
        )}
      </Row>
    </Container>
  );
}
