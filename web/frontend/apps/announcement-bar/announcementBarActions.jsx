import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  ButtonGroup,
  ToggleButton,
  Card,
  CardBody,
  Form,
} from "react-bootstrap";
import { X, Trash } from "react-bootstrap-icons";
import tshirt from "./tshirt.png";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "../../components/Button";
import verticalicon from "../../assets/vertical-drag-&-drop.png";
import dropdown from "../../assets/Vector.png";
import edit from "../../assets/elements.png";
import customize from "../../assets/customize.png";
import { Copy, CaretDownFill } from "react-bootstrap-icons";
import tshirtp from "../../assets/tshirt.png";
import learnmore from "../../assets/help-square.png";
import video1 from "../../assets/Activate_App-DkqU7myX.mov";
import video2 from "../../assets/App_Install-DQeOwnkF.mov";

export default function BundleDiscountActions({ onMakeBundleClick }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState(["Bundle 1"]);
  const [isBundleActive, setIsBundleActive] = useState(true);
  const [message, setMessage] = useState("");
  const [barPosition, setBarPosition] = useState("top");

  const themeOptions = [
    { name: "Solid Color", value: "solid" },
    {
      name: "Sunshine",
      value: "sunshine",
      image: "https://getbusybuddy.com/assets/Sunshine-BrfoRMEz.svg",
    },
    {
      name: "Watercolor",
      value: "watercolor",
      image: "https://getbusybuddy.com/assets/Watercolor-2HbVdo2j.svg",
    },
    {
      name: "Abstract",
      value: "abstract",
      image: "https://getbusybuddy.com/assets/Abstract-CSBeGGwo.svg",
    },
    {
      name: "Christmas",
      value: "christmas",
      image: "https://getbusybuddy.com/assets/Christmas-D4wXR0LX.svg",
    },
    {
      name: "Circles",
      value: "circles",
      image: "https://getbusybuddy.com/assets/Circles-uk8TMdjp.svg",
    },
    {
      name: "Holidays",
      value: "holidays",
      image: "https://getbusybuddy.com/assets/Holidays-Dd-XSFt_.svg",
    },
    {
      name: "Squares",
      value: "squares",
      image: "https://getbusybuddy.com/assets/Squares-Db9SlI8F.svg",
    },
  ];

  const [colorSettings, setColorSettings] = useState({
    "Background Color": "#a18c8c",
    "Text Color": "#000000",
  });

  const [selectedTheme, setSelectedTheme] = useState("solid");

  const [count, setCount] = useState(50);
  const [isAvailableLongTime, setIsAvailableLongTime] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [timezone, setTimezone] = useState("GMT");
  const tabs = [
    "Customize Appearance",
    "Activate",
    "Complete BustyBuddy Install",
    "Review Settings",
  ];
  const [selectedType, setSelectedType] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showBundleAction, setShowBundleAction] = useState(false);

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedType(value);

    if (value === "Percentage") {
      setInputValue("%");
    } else if (value === "Fixed Amount") {
      setInputValue("499");
    } else if (value === "Free Gift") {
      setInputValue("Rs 0");
    } else {
      setInputValue("");
    }
  };

  const [toggles, setToggles] = useState([true, true, true, true]);

  const handleToggleChange = (index) => {
    setToggles((prev) =>
      prev.map((toggled, i) => (i === index ? !toggled : toggled))
    );
  };

  const handleIncrement = () => {
    if (count < 100) setCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (count > 0) setCount((prev) => prev - 1);
  };
  const handleNext = () => {
    if (selectedIndex < tabs.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleBack = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const removeProduct = (product) => {
    setSelectedProducts(selectedProducts.filter((item) => item !== product));
  };

  const clearAllProducts = () => {
    setSelectedProducts([]);
  };

  return (
    <Container
      fluid
      className=""
      style={{ maxWidth: "auto", margin: "0 auto", height: "auto" }}
    >
      {/* Step Navigation */}
      <Row
        className="align-items-center mb-2"
        style={{
          padding: "4px",
          boxShadow: "1px 1px 4px 0px #0000001A inset",
          backgroundColor: "#fff",
          borderRadius: "20px",
        }}
      >
        <Col md="12" className="p-0">
          <ButtonGroup className="w-100 d-flex align-items-center">
            {tabs.map((tab, idx) => (
              <React.Fragment key={idx}>
                <ToggleButton
                  id={`tab-${idx}`}
                  type="radio"
                  variant={selectedIndex === idx ? "dark" : ""}
                  name="tab"
                  value={tab}
                  checked={selectedIndex === idx}
                  onChange={() => setSelectedIndex(idx)}
                  style={
                    selectedIndex === idx || idx < selectedIndex
                      ? {
                          backgroundColor: "black",
                          borderColor: "black",
                          borderRadius: "15px",
                          color: "white",
                          padding: "15px",
                        }
                      : {
                          boxShadow: "1px 1px 4px 0px #0000001A inset",
                          backgroundColor: "#F1F2F4",
                          height: "100%",
                          borderRadius: "15px",
                          padding: "15px",
                        }
                  }
                  className="d-flex justify-content-start align-items-center px-3"
                >
                  <>
                    <span>{String(idx + 1).padStart(2, "0")}</span>
                    <p
                      style={{
                        width: "1.5px",
                        height: "10px",
                        background:
                          selectedIndex === idx || idx < selectedIndex
                            ? "white"
                            : "#222222",
                        opacity:
                          selectedIndex === idx || idx < selectedIndex
                            ? 0.2
                            : 0.1,
                        margin: "0 8px",
                      }}
                    ></p>

                    <span>{tab}</span>
                  </>
                </ToggleButton>

                {idx < tabs.length - 1 && (
                  <span
                    className="arrow mx-2 d-flex align-items-center justify-content-center"
                    style={
                      idx < selectedIndex
                        ? {
                            position: "relative",
                            width: "9px",
                            height: "9px",
                            borderRadius: "50%",
                            backgroundColor: "#222222",
                          }
                        : { width: "5.5px", height: "9.5px", color: "#000" }
                    }
                  >
                    {idx < selectedIndex ? "" : "›"}
                  </span>
                )}
              </React.Fragment>
            ))}
          </ButtonGroup>
        </Col>
      </Row>

      {/* Content Section with Preview */}
      <Row
        style={{
          boxShadow: "none",
          backgroundColor: "transparent",
        }}
      >
        <Col md={7}>
          <div
            style={{
              padding: "10px 0px 0px 0px",
              boxShadow: "1px 1px 4px 0px #0000001A inset",
              backgroundColor: "#fff",
              borderRadius: "20px",
              height: "fit-content",
            }}
          >
            {/* Select Products Step */}
            {selectedIndex === 0 && (
              <Card className="border-0">
                <CardBody>
                  {/* Bundle Status Section */}
                  <Form
                    className="mt-3 p-3"
                    style={{ background: "#F1F2F4", borderRadius: "10px" }}
                  >
                    <div className="d-flex flex-column gap-4">
                      <Form.Group>
                        <Form.Label className="inputtitle">Status</Form.Label>
                        <Form.Select
                          className="inputbox"
                          style={{ background: "white" }}
                          defaultValue="active" // or "inactive" if that's your default
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </Form.Select>

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
                          Only one announcement bar will be displayed at the
                          time
                        </p>
                      </Form.Group>

                      <Form.Group>
                        <Form.Label className="inputtitle">Name</Form.Label>
                        <Form.Control
                          className="inputbox"
                          type="text"
                          placeholder="Enter title"
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
                          The private name of this smart bar. Only you will see
                          this.
                        </p>
                      </Form.Group>
                      <div className="d-flex flex-column gap-2">
                        <h2
                          style={{
                            fontFamily: "Inter",
                            fontStyle: "normal",
                            fontWeight: "600",
                            fontSize: "15px",
                            lineHeight: "100%",
                            color: "#303030",
                          }}
                        >
                          General Settings
                        </h2>
                        <Form.Group>
                          <Form.Label className="inputtitle">
                            Message
                          </Form.Label>
                          <Form.Control
                            className="inputbox"
                            type="text"
                            placeholder="Enter message"
                            style={{ background: "white" }}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </Form.Group>
                      </div>
                    </div>
                  </Form>

                  {/* Appearance Settings Section */}
                  <Form
                    className="mt-3 p-3"
                    style={{ background: "#F1F2F4", borderRadius: "10px" }}
                  >
                    <div className="linewhite">
                      <h2
                        style={{
                          fontFamily: "Inter",
                          fontStyle: "normal",
                          fontWeight: "600",
                          fontSize: "15px",
                          lineHeight: "100%",
                          color: "#303030",
                        }}
                      >
                        Theme Style
                      </h2>
                    </div>

                    <div className="py-3 d-flex flex-wrap gap-3">
                      {themeOptions.map((theme, index) => (
                        <div
                          key={index}
                          className={`theme-option ${selectedTheme === theme.name ? "active" : ""}`}
                          style={{
                            cursor: "pointer",
                            border:
                              selectedTheme === theme.name
                                ? "2px solid #000"
                                : "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "5px",
                            textAlign: "center",
                            width: "100px",
                          }}
                          onClick={() => setSelectedTheme(theme.value)}
                        >
                          {theme.value === "solid" ? (
                            <div
                              style={{
                                width: "100%",
                                height: "60px",
                                background: "#ccc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                              }}
                            >
                              Solid
                            </div>
                          ) : (
                            <img
                              src={theme.image}
                              alt={theme.name}
                              style={{
                                width: "100%",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                          )}
                          <div style={{ marginTop: "5px", fontSize: "12px" }}>
                            {theme.name}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedTheme === "solid" && (
                      <div className="py-3">
                        <div className="colorgrid">
                          {Object.keys(colorSettings).map((key) => (
                            <Form.Group className="colorbox" key={key}>
                              <Form.Label>
                                {key.replace(/([A-Z])/g, " $1")}
                              </Form.Label>
                              <div className="colorinputbox">
                                <input
                                  type="color"
                                  value={colorSettings[key]}
                                  onChange={(e) =>
                                    setColorSettings({
                                      ...colorSettings,
                                      [key]: e.target.value,
                                    })
                                  }
                                  className="colorinput"
                                />
                                <Form.Control
                                  type="text"
                                  className="inputbox"
                                  value={colorSettings[key]}
                                  readOnly
                                  style={{ background: "white" }}
                                />
                              </div>
                            </Form.Group>
                          ))}
                        </div>
                      </div>
                    )}
                  </Form>

                  {/* Margin Settings Section */}
                  <Form
                    className="mt-3 p-3"
                    style={{ background: "#F1F2F4", borderRadius: "10px" }}
                  >
                    <h2
                      className="linewhite"
                      style={{
                        fontFamily: "Inter",
                        fontStyle: "normal",
                        fontWeight: "600",
                        fontSize: "15px",
                        lineHeight: "100%",
                        color: "#303030",
                      }}
                    >
                      Theme Settings
                    </h2>
                    <div className="mt-3">
                      <Form.Group className="d-flex flex-column gap-2">
                        <Form.Label className="inputtitle">Status</Form.Label>
                        <Form.Select
                          className="inputbox"
                          style={{ background: "white" }}
                          value={barPosition}
                          onChange={(e) => setBarPosition(e.target.value)}
                        >
                          <option value="top">Top Relative</option>
                          <option value="top-fixed">Top Fixed</option>
                          <option value="bottom">Bottom</option>
                        </Form.Select>

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
                          The announcement bar is displayed before/above the
                          page content. When scrolling down, the announcement
                          bar will not be visible anymore.
                        </p>
                      </Form.Group>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            )}

            {/* Discount Settings Step */}
            {selectedIndex === 1 && (
              <Card className="border-0">
                <CardBody>
                  <div className="d-flex flex-column gap-2">
                    <h2
                      style={{
                        fontFamily: "Inter",
                        fontStyle: "normal",
                        fontWeight: "600",
                        fontSize: "15px",
                        lineHeight: "100%",
                        color: "#303030",
                      }}
                    >
                      The Announcement Bar app is currently inactive
                    </h2>
                  </div>
                  <div className="d-flex flex-nowrap gap-5 align-items-center justify-content-start p-3 mt-2">
                    <Form.Check
                      type="checkbox"
                      className="custom-checkbox"
                      checked={showCountdown}
                      onChange={() => setShowCountdown(!showCountdown)}
                      label={
                        <span style={{ marginLeft: "6px", marginTop: "5px" }}>
                          Activate Now
                        </span>
                      }
                      style={{
                        fontFamily: "Inter",
                        fontStyle: "bold",
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#303030",
                        whiteSpace: "nowrap",
                      }}
                    />
                    <Form.Check
                      type="checkbox"
                      className="custom-checkbox"
                      checked={showCountdown}
                      onChange={() => setShowCountdown(!showCountdown)}
                      label={
                        <span style={{ marginLeft: "6px", marginTop: "5px" }}>
                          Activate Later
                        </span>
                      }
                      style={{
                        fontFamily: "Inter",
                        fontStyle: "bold",
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#303030",
                        whiteSpace: "nowrap",
                      }}
                    />
                  </div>

                  <div className="d-flex align-items-center justify-content-center">
                    <video controls className="video-player">
                      <source src={video1} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </CardBody>
              </Card>
            )}

            {selectedIndex === 2 && (
              <Card className="border-0">
                <CardBody>
                  {/* Bundle Status Section */}
                  <Form
                    className="mt-3 p-3"
                    style={{ background: "#F1F2F4", borderRadius: "10px" }}
                  >
                    <div className="d-flex flex-column gap-4 justify-content-between align-items-center mb-3 linewhite">
                      <div className="d-flex flex-column gap-2">
                        <h2
                          style={{
                            fontFamily: "Inter",
                            fontStyle: "normal",
                            fontWeight: "600",
                            fontSize: "15px",
                            lineHeight: "100%",
                            color: "#303030",
                          }}
                        >
                          Your Announcement Bar Won’t Show Up In Your Store Yet!
                        </h2>
                        <p
                          style={{
                            maxWidth: "778.87px",
                            fontFamily: "Inter",
                            fontStyle: "normal",
                            fontWeight: "500",
                            fontSize: "14px",
                            lineHeight: "100%",
                            color: "#616161",
                          }}
                        >
                          Complete Install & Your BusyBuddy Apps Will Show On
                          Your Store. You will only need to complete this step
                          once
                        </p>
                      </div>

                      <video controls className="video-player">
                        <source src={video2} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </Form>

                  {/* Appearance Settings Section */}
                  <Form
                    className="mt-3 p-3"
                    style={{ background: "#F1F2F4", borderRadius: "10px" }}
                  >
                    <div className="options-container">
                      {/* Countdown Timer and Emoji Options */}
                      <Form.Check
                        type="checkbox"
                        className="custom-checkbox"
                        checked={showCountdown}
                        onChange={() => setShowCountdown(!showCountdown)}
                        label={
                          <span style={{ marginLeft: "6px" }}>
                            Enable Later
                          </span>
                        }
                        style={{
                          fontFamily: "Inter",
                          fontStyle: "normal",
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "#303030",
                          whiteSpace: "nowrap",
                        }}
                      />

                      <p
                        style={{
                          fontFamily: "Inter",
                          fontStyle: "normal",
                          fontWeight: 500,
                          fontSize: "13px",
                          lineHeight: "100%",
                          color: "rgba(81, 192, 255, 1)",
                          width: "90%",
                        }}
                      >
                        How To Enable BusyBuddy In Your Shopify Store
                      </p>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            )}

            {/* Step 5: Summary */}
            {selectedIndex === 3 && (
              <Card className="border-0">
                <CardBody>
                  <h2 className="cardtitle">Review Settings</h2>
                  <Form
                    className="mt-3 p-3"
                    style={{ background: "#F1F2F4", borderRadius: "10px" }}
                  >
                    <div className="d-flex justify-content-between align-items-center borderbox">
                      <div className="d-flex flex-column gap-2">
                        <h2 className="cardtitle2">Selection of Products</h2>
                        <div className="d-flex gap-2 align-items-center">
                          <p className="carddesc">Selected Products</p>
                          <p
                            style={{
                              width: "1.5px",
                              height: "10px",
                              background: "#222222",
                              opacity: 0.1,
                              margin: "0 4px",
                            }}
                          ></p>
                          <p
                            style={{
                              fontFamily: "Inter",
                              fontSize: "13px",
                              fontStyle: "normal",
                              fontWeight: "600",
                              color: "#222222",
                            }}
                          >
                            4 Products
                          </p>
                        </div>
                      </div>
                      <Button
                        text={
                          <>
                            <img src={edit} width={12} height={12} /> Change
                            Setting
                          </>
                        }
                        onClick={() => console.log("Change Setting")}
                        style={{
                          backgroundColor: "rgba(81, 105, 221, 0.1)",
                          color: "#5169DD",
                          border: "1px solid #5169DD",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center borderbox">
                      <div className="d-flex flex-column gap-2">
                        <h2 className="cardtitle2">Display Setting</h2>
                        <div className="d-flex gap-2 align-items-center">
                          <p className="carddesc">Selected Products</p>
                          <p
                            style={{
                              width: "1.5px",
                              height: "10px",
                              background: "#222222",
                              opacity: 0.1,
                              margin: "0 4px",
                            }}
                          ></p>
                          <p
                            style={{
                              fontFamily: "Inter",
                              fontSize: "13px",
                              fontStyle: "normal",
                              fontWeight: "600",
                              color: "#222222",
                            }}
                          >
                            4 Products
                          </p>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          <p className="carddesc">Selected Products</p>
                          <p
                            style={{
                              width: "1.5px",
                              height: "10px",
                              background: "#222222",
                              opacity: 0.1,
                              margin: "0 4px",
                            }}
                          ></p>
                          <p
                            style={{
                              fontFamily: "Inter",
                              fontSize: "13px",
                              fontStyle: "normal",
                              fontWeight: "600",
                              color: "#222222",
                            }}
                          >
                            4 Products
                          </p>
                        </div>
                      </div>
                      <Button
                        text={
                          <>
                            <img src={edit} width={12} height={12} /> Change
                            Setting
                          </>
                        }
                        onClick={() => console.log("Change Setting")}
                        style={{
                          backgroundColor: "rgba(81, 105, 221, 0.1)",
                          color: "#5169DD",
                          border: "1px solid #5169DD",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center borderbox">
                      <div className="d-flex flex-column gap-2">
                        <h2 className="cardtitle2">Discount Setting</h2>
                        <div className="d-flex gap-2 align-items-center">
                          <p className="carddesc">Selected Products</p>
                          <p
                            style={{
                              width: "1.5px",
                              height: "10px",
                              background: "#222222",
                              opacity: 0.1,
                              margin: "0 4px",
                            }}
                          ></p>
                          <p
                            style={{
                              fontFamily: "Inter",
                              fontSize: "13px",
                              fontStyle: "normal",
                              fontWeight: "600",
                              color: "#222222",
                            }}
                          >
                            4 Products
                          </p>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          <p className="carddesc">Selected Products</p>
                          <p
                            style={{
                              width: "1.5px",
                              height: "10px",
                              background: "#222222",
                              opacity: 0.1,
                              margin: "0 4px",
                            }}
                          ></p>
                          <p
                            style={{
                              fontFamily: "Inter",
                              fontSize: "13px",
                              fontStyle: "normal",
                              fontWeight: "600",
                              color: "#222222",
                            }}
                          >
                            4 Products
                          </p>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          <p className="carddesc">Selected Products</p>
                          <p
                            style={{
                              width: "1.5px",
                              height: "10px",
                              background: "#222222",
                              opacity: 0.1,
                              margin: "0 4px",
                            }}
                          ></p>
                          <p
                            style={{
                              fontFamily: "Inter",
                              fontSize: "13px",
                              fontStyle: "normal",
                              fontWeight: "600",
                              color: "#222222",
                            }}
                          >
                            4 Products
                          </p>
                        </div>{" "}
                        <div className="d-flex gap-2 align-items-center">
                          <p className="carddesc">Selected Products</p>
                          <p
                            style={{
                              width: "1.5px",
                              height: "10px",
                              background: "#222222",
                              opacity: 0.1,
                              margin: "0 4px",
                            }}
                          ></p>
                          <p
                            style={{
                              fontFamily: "Inter",
                              fontSize: "13px",
                              fontStyle: "normal",
                              fontWeight: "600",
                              color: "#222222",
                            }}
                          >
                            4 Products
                          </p>
                        </div>
                      </div>
                      <Button
                        text={
                          <>
                            <img src={edit} width={12} height={12} /> Change
                            Setting
                          </>
                        }
                        onClick={() => console.log("Change Setting")}
                        style={{
                          backgroundColor: "rgba(81, 105, 221, 0.1)",
                          color: "#5169DD",
                          border: "1px solid #5169DD",
                          borderRadius: "8px",
                          padding: "8px",
                        }}
                      />
                    </div>
                  </Form>
                </CardBody>
              </Card>
            )}
          </div>
          {/* Navigation Buttons */}
          <div className="mt-5">
            <Col className="d-flex gap-3">
              {selectedIndex > 0 && (
                <Button
                  text="Back"
                  onClick={handleBack}
                  style={{
                    backgroundColor: "#D3D3D3",
                    color: "black",
                    border: "none",
                    borderRadius: "40px",
                    padding: "20px 30px",
                    fontSize: "15px",
                    width: "134px",
                  }}
                />
              )}
              <Button
                text={
                  <>
                    {selectedIndex === tabs.length - 1
                      ? "Confirm and Publish Bundle"
                      : "Next to Continue"}
                  </>
                }
                onClick={handleNext}
                style={{
                  backgroundColor: "black",
                  color: "white",
                  border: "none",
                  borderRadius: "40px",
                  padding: "20px 30px",
                  fontSize: "15px",
                }}
              />
            </Col>
          </div>
        </Col>
        <Col
          md={5}
          style={{
            padding: "0px",
            boxShadow: "1px 1px 4px 0px #0000001A inset",
            backgroundColor: "#fff",
            borderRadius: "20px",
            height: "fit-content",
          }}
        >
          <Card className="border-0">
            <CardBody className="d-flex flex-column ">
              <div
                className="d-flex align-items-center justify-content-between linrrow"
                style={{
                  width: "100%",
                  padding: "10px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "20px",
                    margin: 0,
                  }}
                >
                  Preview
                </h2>

                <div
                  className="d-flex align-items-center"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#f8f9fa",
                    padding: "7px 10px 7px 7px",
                    border: "1px solid rgba(34, 34, 34, 0.1)",
                    borderRadius: "8px",
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={customize}
                    width={13}
                    height={13}
                    alt="Customize Icon"
                    style={{ marginRight: "6px" }}
                  />
                  Customize
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "rgb(241, 242, 244)",
                  padding: "15px",
                  borderRadius: "18px",
                  position: "relative",
                 
                  
                }}
              >
                <div
                  className="themetitle"
                  style={{
                    position:
                      barPosition === "top-fixed" || barPosition === "bottom"
                        ? "absolute"
                        : "relative",
                    top: barPosition === "top-fixed" ? 0 : "auto",
                    bottom: barPosition === "bottom" ? 0 : "auto",
                    left: 0,
                    width: "100%",
                    zIndex: 2,
                    background:
                      selectedTheme === "solid"
                        ? colorSettings["Background Color"]
                        : `url(${themeOptions.find((t) => t.value === selectedTheme)?.image})`,
                    color:
                      selectedTheme === "solid"
                        ? colorSettings["Text Color"]
                        : "#ffffff",
                    backgroundSize:
                      selectedTheme === "solid" ? "auto" : "cover",
                    backgroundPosition: "center",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    minHeight: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: barPosition === "top-fixed" ? 0 : "20px",
                    transition: "all 0.3s ease",
                  }}
                >
                  <h2
                    className="cardtitle"
                    style={{ margin: 0, fontSize: "18px" }}
                  >
                    {message || "Type text here"}
                  </h2>
                </div>

               
                {/* Main Product Item */}
                <div
                  style={{
                    padding: "15px",
                    borderRadius: "18px",
                    marginBottom: "15px",
                  }}
                  className="previewbox mt-3"
                >
                  <div className="d-flex flex-column">
                    <div className="d-flex align-items-center">
                      <img
                        src={tshirtp}
                        alt="T-Shirt"
                        width={100}
                        height={100}
                        style={{
                          borderRadius: "10px",
                          marginRight: "15px",
                        }}
                      />
                      <div className="w-100">
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: "14px",
                            marginBottom: "5px",
                          }}
                        >
                          Earth Tone brown men's shirt
                        </p>

                        <div className="d-flex align-items-center justify-content-start gap-2">
                          <p
                            style={{
                              fontWeight: 600,
                              fontSize: "14px",
                              margin: 0,
                            }}
                          >
                            Rs.199.00
                          </p>
                          <p
                            style={{
                              width: "1.5px",
                              height: "10px",
                              background: "#222222",
                              opacity: 0.1,
                            }}
                          ></p>
                          <p
                            style={{
                              color: "#999",
                              fontSize: "12px",
                              textDecoration: "line-through",
                              margin: 0,
                            }}
                          >
                            Rs.998.00
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginBottom: "10px", position: "relative" }}>
                      <select
                        className="form-select"
                        style={{
                          fontSize: "12px",
                          background: "#F1F1F1",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(34, 34, 34, 0.1)",
                          width: "100%",
                          appearance: "none", // Hides default arrow
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                        }}
                      >
                        <option>Variant 1</option>
                        <option>Variant 2</option>
                        <option>Variant 3</option>
                      </select>

                      {/* Custom Dropdown Arrow */}
                      <span
                        style={{
                          position: "absolute",
                          right: "15px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          fontSize: "10px",
                        }}
                      >
                        <CaretDownFill />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex flex-column gap-2">
                  <div
                    className="d-flex align-items-center justify-content-between gap-2"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(34, 34, 34, 0.1)",
                      borderRadius: "15px",
                      padding: "20px",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "Inter",
                        fontStyle: "normal",
                        fontWeight: "600",
                        fontSize: "15px",
                        lineHeight: "100%",
                        color: "#303030",
                      }}
                    >
                      Total
                    </p>
                    <p
                      style={{
                        fontFamily: "Inter",
                        fontStyle: "normal",
                        fontWeight: "500",
                        fontSize: "13px",
                        lineHeight: "100%",
                        color: "#222222",
                      }}
                    >
                      Rs.999.00
                    </p>
                  </div>
                  <Button
                    text="Add To Cart"
                    onClick={handleBack}
                    style={{
                      backgroundColor: "#222222",
                      color: "white",
                      border: "none",
                      borderRadius: "15px",
                      padding: "15px 25px",
                      fontSize: "15px",
                      displayL: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  />{" "}
                  <Button
                    text="Skip Offer"
                    onClick={handleBack}
                    style={{
                      backgroundColor: "#F1F1F1",
                      color: "black",
                      border: "1px solid rgba(34, 34, 34, 0.1)",
                      borderRadius: "15px",
                      padding: "15px 25px",
                      fontSize: "15px",
                      displayL: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
