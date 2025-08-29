import React, { useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import { Play, ArrowRight } from "react-bootstrap-icons";
import { Form } from "react-bootstrap";
import AnnouncementBarActions from "./inactiveTabMessageActions";
import tshirt from "./tshirt.png";
import "./inactiveTabMessageStyles.css";
import Button from "../../components/Button";
import { X, Trash, Upload } from "react-bootstrap-icons";
import view from "../../assets/view.png";
import videoimg from "../../assets/videoimg.png";

export default function DiscountList({ onMakeBundleClick }) {
  const tabs = ["Overview", "Setting"];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [bundles, setBundles] = useState({ bundle1: false, bundle2: false });
  const [showBundleAction, setShowBundleAction] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isToggled, setIsToggled] = useState(true); // Toggle button in active state
  const [checkboxes, setCheckboxes] = useState([false, false, false, false]);
  const [toggles, setToggles] = useState([true, true, true, true]);
  const [showEmojiPickerMessage, setShowEmojiPickerMessage] = useState(false);

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

  if (showBundleAction) {
    return <AnnouncementBarActions />;
  }
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [image, setImage] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fileInputRef = useRef(null);

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message:", message);
    console.log("Image:", image);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    alert("Message submitted successfully!");
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
                          // height: "43px",
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
                          // height: "43px",
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

            {/* Right-aligned Create Discount Button */}
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
        <div className="d-flex justify-content-between  my-2 px-2 py-1">
          <Button
            text={
              <div className="slecetbox">
                <Form.Check
                  type="checkbox"
                  checked={isChecked}
                  className="custom-checkbox me-2"
                />{" "}
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
                      How to create bundle?
                    </a>
                  </div>
                </div>
              </div>
            </Col>
          </>
        )}

        {selectedTab === "Setting" && (
          <div className="d-flex flex-column gap-3 ">
            {" "}
            <>
              <Row className="g-0 linrrow">
                {" "}
                {/* Each bundle in a separate row */}
                <Card
                  className="border-0 w-full"
                  style={{ background: "rgb(241, 242, 244)" }}
                >
                  <Card.Body className="d-flex align-items-center justify-content-between">
                    <div className="d-flex flex-column gap-[10px]">
                      {/* <Form.Group>
                        <Form.Label className="inputtitle">Message</Form.Label>
                        <Form.Control
                          className="inputbox"
                          type="text"
                          placeholder="Enter message"
                        />
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
                      </Form.Group> */}
                      <Form.Group>
                        <Form.Label className="inputtitle">Message</Form.Label>

                        {/* Message Input Box */}
                       <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "700px", position: "relative" }}>
      {/* Input Box with Emoji Icon Inside */}
      <div style={{ position: "relative", flexGrow: 1 }}>
        <Form.Control
          className="inputbox"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message"
          style={{
            paddingRight: "35px", // space for emoji icon
            borderRadius: "8px",
          }}
        />

        {/* Emoji Icon Inside Input */}
        <span
          onClick={() => setShowEmojiPicker((prev) => !prev)}
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
      />
    </div>

                        {/* Image Preview */}
                        {image && (
                          <div style={{ marginTop: "8px" }}>
                            <img
                              src={URL.createObjectURL(image)}
                              alt="Preview"
                              width="100"
                              height="80"
                              style={{
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                              }}
                            />
                          </div>
                        )}

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
                            />
                          </Form.Group>
                          <Form.Group controlId="endDate" style={{ flex: 1 }}>
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          </Form.Group>
                        </div>
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
              </Row>
            </>
          </div>
        )}
      </Row>
    </Container>
  );
}
