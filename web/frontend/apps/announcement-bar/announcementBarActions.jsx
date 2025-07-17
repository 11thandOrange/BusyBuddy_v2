import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  ButtonGroup,
  ToggleButton,
  Card,
  CardBody,
  Form,
  InputGroup,
} from "react-bootstrap";
import Calendar from "react-calendar";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import "react-calendar/dist/Calendar.css";
import Button from "../../components/Button";
import edit from "../../assets/elements.png";
import customize from "../../assets/customize.png";
import { Copy, CaretDownFill } from "react-bootstrap-icons";
import tshirtp from "../../assets/tshirt.png";
import learnmore from "../../assets/help-square.png";
import video1 from "../../assets/Activate_App-DkqU7myX.mov";
import video2 from "../../assets/App_Install-DQeOwnkF.mov";
import EmojiPicker from "emoji-picker-react";

export default function BundleDiscountActions({ onMakeBundleClick }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [message, setMessage] = useState("Text is ticking");
  const [barPosition, setBarPosition] = useState("top");
  const [customCSS, setCustomCSS] = useState("");
  const [barWidth, setBarWidth] = useState(100); // Percentage or pixel value
  const [barHeight, setBarHeight] = useState(180);

  const [messageAnimationSpeed, setMessageAnimationSpeed] = useState(20);

  const [generalColorSettings, setGeneralColorSettings] = useState({
    "Background Color": "#007bff",
    "Message Font Color": "#ffffff",
  });
 
  const [showEmojiPickerMessage, setShowEmojiPickerMessage] = useState(false);
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
    { name: "Upload Image", value: "image-upload", icon: "➕" },
  ];

  const [colorSettings, setColorSettings] = useState({
    "Background Color": "#a18c8c",
  });

  const [selectedTheme, setSelectedTheme] = useState("solid");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAvailableLongTime, setIsAvailableLongTime] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isCustomCSSEnabled, setIsCustomCSSEnabled] = useState(false);
  const tabs = ["Customize Appearance", "Review Settings"];
  const [timerColorSettings, setTimerColorSettings] = useState({
    "Timer Numbers Font Color": "#ffffff",
    "Timer Labels Font Color": "#ffffff",
    "Timer Separator Color": "#ffffff",
    "Timer Block Background Color": "transparent",
    "Timer Block Border Color": "transparent",
  });
  const [desktopMessageFontSettings, setDesktopMessageFontSettings] = useState({
    fontSize: "18px",
    fontFamily: "Inter",
    fontWeight: "600",
    letterSpacing: "0px",
    lineHeight: "1.2",
  });
  const [mobileMessageFontSettings, setMobileMessageFontSettings] = useState({
    fontSize: "16px",
    fontFamily: "Inter",
    fontWeight: "600",
    letterSpacing: "0px",
    lineHeight: "1.2",
  });

  const [showMessage, setShowMessage] = useState(true); // New: State for message visibility
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showsaveOptions, setSaveOptions] = useState(false); // Renamed
  const [showendsaleOptions, setEndsaleOptions] = useState(false); // Renamed

  const [messageDesktopFontSettings, setMessageDesktopFontSettings] = useState({
    // Renamed
    fontSize: "18px",
    fontFamily: "Inter",
    fontWeight: "600",
    letterSpacing: "0px",
    lineHeight: "1.2",
  });
  const [messageMobileFontSettings, setMessageMobileFontSettings] = useState({
    // Renamed
    fontSize: "16px",
    fontFamily: "Inter",
    fontWeight: "600",
    letterSpacing: "0px",
    lineHeight: "1.2",
  });
  // New states for text styling
  const [desktopFontSettings, setDesktopFontSettings] = useState({
    fontSize: "18px",
    fontFamily: "Inter",
    fontWeight: "600",
    letterSpacing: "0px",
    lineHeight: "1.2",
  });

  const [mobileFontSettings, setMobileFontSettings] = useState({
    fontSize: "16px",
    fontFamily: "Inter",
    fontWeight: "600",
    letterSpacing: "0px",
    lineHeight: "1.2",
  });

  // Example font families - you can expand this list
  const fontFamilies = [
    "Inter",
    "Arial",
    "Verdana",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Courier New",
    "Roboto",
    "Open Sans",
  ];
  const fontWeights = [
    "normal",
    "bold",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ];
  const fontCases = ["uppercase", "lowercase", "capitalize", "none"];

  const [showTimer, setShowTimer] = useState(true);
  const fixedTimerDisplay = "00:00:00:00";
  const [showTimerOptions, setShowTimerOptions] = useState(false);
  const [timerDesktopFontSettings, setTimerDesktopFontSettings] = useState({
    fontSize: "32px",
    fontFamily: "Inter",
    fontWeight: "700",
    letterSpacing: "0px",
    lineHeight: "1.2",
  });
  const [timerMobileFontSettings, setTimerMobileFontSettings] = useState({
    fontSize: "24px",
    fontFamily: "Inter",
    fontWeight: "700",
    letterSpacing: "0px",
    lineHeight: "1.2",
  });
  // Timer Label Settings
  const [timerLabelSettings, setTimerLabelSettings] = useState({
    showDaysLabel: true,
    showHoursLabel: true,
    showMinutesLabel: true,
    showSecondsLabel: true,
    fontSize: "10px",
    fontFamily: "Inter",
    fontWeight: "400",
    fontCase: "uppercase",
  });
  const [timerBlockSettings, setTimerBlockSettings] = useState({
    showSeparators: true,
    roundedCorners: "4px",
    spacing: "10px",
  });

  // --- New State for Scheduling ---
  const [targetDate, setTargetDate] = useState(""); // Stores the selected date (e.g., 'YYYY-MM-DD')
  const [targetTime, setTargetTime] = useState(""); // Stores the selected time (e.g., 'HH:MM')
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [timerIntervalId, setTimerIntervalId] = useState(null); // To store the interval ID for cleanup

  // --- Functions for Scheduling Logic ---

  const calculateCountdown = () => {
    if (!targetDate || !targetTime) {
      setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      return;
    }

    const targetDateTime = new Date(`${targetDate}T${targetTime}:00`);
    const now = new Date();
    const difference = targetDateTime.getTime() - now.getTime();

    if (difference <= 0) {
      clearInterval(timerIntervalId);
      setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      setShowCountdown(false); // Stop showing countdown when time is up
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setCountdown({
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    });
    setShowCountdown(true); // Show countdown once target date/time is set
  };

  // Effect to start and clear the countdown interval
  useEffect(() => {
    if (showCountdown && targetDate && targetTime) {
      // Clear any existing interval before setting a new one
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
      const interval = setInterval(calculateCountdown, 1000);
      setTimerIntervalId(interval);
      // Initial calculation immediately
      calculateCountdown();
    } else {
      // Clear interval if countdown is not active or target is not set
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        setTimerIntervalId(null);
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    };
  }, [showCountdown, targetDate, targetTime]); // Re-run effect when these dependencies change

  const handleSetTimer = () => {
    if (targetDate && targetTime) {
      const targetDateTime = new Date(`${targetDate}T${targetTime}:00`);
      const now = new Date();
      if (targetDateTime.getTime() <= now.getTime()) {
        alert("Please select a future date and time for the timer.");
        return;
      }
      setIsTimerActive(true); // Activate the timer
      // The useEffect will pick this up and start the interval
    } else {
      alert("Please select both a date and a time to set the timer.");
    }
  };

  const handleStopTimer = () => {
    setIsTimerActive(false); // Deactivate the timer
    clearInterval(timerIntervalId); // Ensure interval is cleared immediately
    setTimerIntervalId(null);
    setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" }); // Reset display
    setTargetDate(""); // Clear inputs
    setTargetTime(""); // Clear inputs
  };
  const renderTimerBlock = (value, label, showLabel = true) => {
    // Determine if we should show the label based on settings
    const shouldShowLabel =
      {
        Days: timerLabelSettings.showDaysLabel,
        Hours: timerLabelSettings.showHoursLabel,
        Minutes: timerLabelSettings.showMinutesLabel,
        Seconds: timerLabelSettings.showSecondsLabel,
      }[label] ?? showLabel;

    // Apply text case transformation if needed (uppercase, lowercase, etc.)
    const formattedLabel =
      timerLabelSettings.fontCase === "uppercase"
        ? label.toUpperCase()
        : timerLabelSettings.fontCase === "lowercase"
          ? label.toLowerCase()
          : timerLabelSettings.fontCase === "capitalize"
            ? `${label.charAt(0).toUpperCase()}${label.slice(1).toLowerCase()}`
            : label;

    return (
      <div
        className="timer-block"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 5px",
          padding: "5px 10px",
          background: showTimerBlockBackground
            ? timerColorSettings["Timer Block Background Color"]
            : "transparent",
          border: showTimerBlockBorder
            ? `1px solid ${timerColorSettings["Timer Block Border Color"]}`
            : "none",
          borderRadius: timerBlockSettings.roundedCorners,
        }}
      >
        {/* Timer Numbers */}
        <div
          className="timer-number"
          style={{
            color: timerColorSettings["Timer Numbers Font Color"],
            fontFamily: timerDesktopFontSettings.fontFamily,
            fontWeight: timerDesktopFontSettings.fontWeight,
            fontSize: timerDesktopFontSettings.fontSize,
            letterSpacing: timerDesktopFontSettings.letterSpacing,
            lineHeight: timerDesktopFontSettings.lineHeight,
          }}
        >
          {value}
        </div>

        {/* Timer Label (Days, Hours, etc.) */}
        {shouldShowLabel && (
          <div
            className="timer-label"
            style={{
              color: timerColorSettings["Timer Labels Font Color"],
              fontFamily: timerLabelSettings.fontFamily,
              fontWeight: timerLabelSettings.fontWeight,
              fontSize: timerLabelSettings.fontSize,
              marginTop: "5px",
              textAlign: "center",
            }}
          >
            {formattedLabel}
          </div>
        )}
      </div>
    );
  };

  // NEW: "End Sale" Message State
  const [endSaleMessage, setEndSaleMessage] = useState("End Sale in");
  const [showEndSaleMessage, setShowEndSaleMessage] = useState(false);
  const [endSaleMessageSettings, setEndSaleMessageSettings] = useState({
    backgroundColor: "#FF0000",
    fontColor: "#FFFFFF",
    fontSize: "16px",
    fontFamily: "Inter",
    fontWeight: "700",
  });

  const [animateMessage, setAnimateMessage] = useState(true);

  const [showTimerBlockBackground, setShowTimerBlockBackground] =
    useState(false);
  const [showTimerBlockBorder, setShowTimerBlockBorder] = useState(false);

  const [showShopNowButton, setShowShopNowButton] = useState(false);
  const [shopNowButtonText, setShopNowButtonText] = useState("Shop Now");
  const [animateShopNowButton, setAnimateShopNowButton] = useState(false);
  const [shopNowButtonSettings, setShopNowButtonSettings] = useState({
    backgroundColor: "#000000", // Default Black
    fontColor: "#FFFFFF", // Default White
    fontSize: "14px",
    fontFamily: "Inter",
    fontWeight: "600",
    padding: "8px 15px",
    borderRadius: "5px",
    borderColor: "#000000",
  });

  const [showSaveBox, setShowSaveBox] = useState(false);
  const [saveBoxText, setSaveBoxText] = useState("SAVE 30%");
  const [saveBoxSettings, setSaveBoxSettings] = useState({
    backgroundColor: "#FFFF00", // Default Yellow
    fontColor: "#000000", // Default Black
    fontSize: "14px",
    fontFamily: "Inter",
    fontWeight: "700",
    padding: "5px 10px",
    borderRadius: "3px",
    borderColor: "#FFFF00",
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setSelectedTheme("image-upload");
      };
      reader.readAsDataURL(file);
    }
  };

  const getBackgroundStyle = () => {
    if (selectedTheme === "solid") {
      return colorSettings["Background Color"];
    } else if (selectedTheme === "image-upload" && uploadedImage) {
      return `url(${uploadedImage})`;
    } else {
      const selectedThemeOption = themeOptions.find(
        (t) => t.value === selectedTheme
      );
      return selectedThemeOption ? `url(${selectedThemeOption.image})` : "none";
    }
  };
  const onEmojiClickMessage = (emojiObject) => {
    setMessage((prevMsg) => prevMsg + emojiObject.emoji);
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
  const handleCSSToggle = () => {
    setIsCustomCSSEnabled(!isCustomCSSEnabled);
  };
 const extractGradientColors = () => {
    const gradientString = getBackgroundStyle();
    // Extract hex colors from the gradient string
    const colorMatches = gradientString.match(/#[0-9a-fA-F]{6}/g);
    if (colorMatches && colorMatches.length >= 2) {
      return {
        startColor: getBackgroundStyle(), // #667eea
        endColor: getBackgroundStyle()    // #764ba2
      };
    }
    // Fallback colors
    return {
      startColor: getBackgroundStyle(),
      endColor: getBackgroundStyle()
    };
  };

  const waveColors = extractGradientColors();
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

                      <div className="linewhite mt-4">
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
                      </div>
                      <div className="d-flex flex-column gap-2 py-3">
                        <Form.Group className="mb-3">
                          <Form.Label className="inputtitle">
                            Message Text
                          </Form.Label>
                          <div style={{ position: "relative" }}>
                            <InputGroup className="position-relative">
                              <Form.Control
                                className="inputbox pe-7"
                                type="text"
                                placeholder="Enter message"
                                style={{ background: "white" }}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  right: "10px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  display: "flex",
                                  gap: "8px",
                                  zIndex: 3,
                                }}
                              >
                                <span
                                  onClick={() =>
                                    setShowEmojiPickerMessage((prev) => !prev)
                                  }
                                  style={{
                                    cursor: "pointer",
                                    color: "#6c757d",
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  😀
                                </span>
                                <span
                                  onClick={() => setShowMessage(!showMessage)}
                                  style={{
                                    cursor: "pointer",
                                    color: "#6c757d",
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  {showMessage ? <EyeFill /> : <EyeSlashFill />}
                                </span>
                              </div>
                            </InputGroup>
                            {showEmojiPickerMessage && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: "0",
                                  zIndex: 1001,
                                  marginTop: "5px",
                                  width: "100%",
                                }}
                              >
                                <EmojiPicker
                                  onEmojiClick={onEmojiClickMessage}
                                  width="100%"
                                />
                              </div>
                            )}
                          </div>
                        </Form.Group>
                        {/* Message Styling Options Toggle */}
                        <div
                          className="linewhite mt-2"
                          onClick={() =>
                            setShowMessageOptions(!showMessageOptions)
                          }
                          style={{ cursor: "pointer" }}
                        >
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
                            Message Styling Options{" "}
                            {showMessageOptions ? "▲" : "▼"}
                          </h2>
                        </div>
                        {/* Message Styling Options Content */}
                        {showMessageOptions && (
                          <div className="py-3">
                            <Form.Group className="colorbox mb-3">
                              <Form.Label>Font Color</Form.Label>
                              <div className="colorinputbox">
                                <input
                                  type="color"
                                  value={
                                    generalColorSettings["Message Font Color"]
                                  }
                                  onChange={(e) =>
                                    setGeneralColorSettings({
                                      ...generalColorSettings,
                                      "Message Font Color": e.target.value,
                                    })
                                  }
                                  className="colorinput"
                                />
                                <Form.Control
                                  type="text"
                                  className="inputbox"
                                  value={
                                    generalColorSettings["Message Font Color"]
                                  }
                                  readOnly
                                  style={{ background: "white" }}
                                />
                              </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>
                                Animate Message (Scrolling & Wave)
                              </Form.Label>
                              <Form.Check
                                type="switch"
                                id="animateMessageSwitch"
                                checked={animateMessage}
                                onChange={(e) =>
                                  setAnimateMessage(e.target.checked)
                                }
                              />
                            </Form.Group>
                            {animateMessage && (
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  Animation Speed (seconds per cycle)
                                </Form.Label>
                                <Form.Range
                                  min={5} // Faster
                                  max={60} // Slower
                                  step={1}
                                  value={messageAnimationSpeed}
                                  onChange={(e) =>
                                    setMessageAnimationSpeed(
                                      Number(e.target.value)
                                    )
                                  }
                                />
                                <small>{messageAnimationSpeed} seconds</small>
                              </Form.Group>
                            )}
                            {/* Desktop Message Styling */}
                            <h4
                              className="mt-4 mb-3"
                              style={{ fontSize: "14px", fontWeight: "bold" }}
                            >
                              Desktop Message Styles
                            </h4>
                            <div className="d-flex flex-wrap gap-3">
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Font Size</Form.Label>
                                <Form.Control
                                  as="select"
                                  className="inputbox"
                                  value={messageDesktopFontSettings.fontSize}
                                  onChange={(e) =>
                                    setMessageDesktopFontSettings({
                                      ...messageDesktopFontSettings,
                                      fontSize: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "white",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {[...Array(30).keys()].map((i) => (
                                    <option
                                      key={`dmsg-fs-${i}`}
                                      value={`${10 + i}px`}
                                    >
                                      {10 + i}px
                                    </option>
                                  ))}
                                </Form.Control>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Font Family</Form.Label>
                                <Form.Control
                                  as="select"
                                  className="inputbox"
                                  value={messageDesktopFontSettings.fontFamily}
                                  onChange={(e) =>
                                    setMessageDesktopFontSettings({
                                      ...messageDesktopFontSettings,
                                      fontFamily: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "white",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {fontFamilies.map((font, i) => (
                                    <option key={`dmsg-ff-${i}`} value={font}>
                                      {font}
                                    </option>
                                  ))}
                                </Form.Control>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Font Weight</Form.Label>
                                <Form.Control
                                  as="select"
                                  className="inputbox"
                                  value={messageDesktopFontSettings.fontWeight}
                                  onChange={(e) =>
                                    setMessageDesktopFontSettings({
                                      ...messageDesktopFontSettings,
                                      fontWeight: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "white",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {fontWeights.map((weight, i) => (
                                    <option key={`dmsg-fw-${i}`} value={weight}>
                                      {weight}
                                    </option>
                                  ))}
                                </Form.Control>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Letter Spacing</Form.Label>
                                <Form.Control
                                  type="range"
                                  min="-2"
                                  max="10"
                                  step="0.5"
                                  value={parseFloat(
                                    messageDesktopFontSettings.letterSpacing
                                  )}
                                  onChange={(e) =>
                                    setMessageDesktopFontSettings({
                                      ...messageDesktopFontSettings,
                                      letterSpacing: `${e.target.value}px`,
                                    })
                                  }
                                  style={{ width: "100%" }}
                                />
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "10px" }}
                                >
                                  {messageDesktopFontSettings.letterSpacing}
                                </span>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Line Height</Form.Label>
                                <Form.Control
                                  type="range"
                                  min="0.8"
                                  max="2.5"
                                  step="0.1"
                                  value={parseFloat(
                                    messageDesktopFontSettings.lineHeight
                                  )}
                                  onChange={(e) =>
                                    setMessageDesktopFontSettings({
                                      ...messageDesktopFontSettings,
                                      lineHeight: e.target.value,
                                    })
                                  }
                                  style={{ width: "100%" }}
                                />
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "10px" }}
                                >
                                  {messageDesktopFontSettings.lineHeight}
                                </span>
                              </Form.Group>
                            </div>

                            {/* Mobile Message Styling */}
                            <h4
                              className="mt-4 mb-3"
                              style={{ fontSize: "14px", fontWeight: "bold" }}
                            >
                              Mobile Message Styles
                            </h4>
                            <div className="d-flex flex-wrap gap-3">
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Font Size</Form.Label>
                                <Form.Control
                                  as="select"
                                  className="inputbox"
                                  value={messageMobileFontSettings.fontSize}
                                  onChange={(e) =>
                                    setMessageMobileFontSettings({
                                      ...messageMobileFontSettings,
                                      fontSize: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "white",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {[...Array(20).keys()].map((i) => (
                                    <option
                                      key={`mmsg-fs-${i}`}
                                      value={`${8 + i}px`}
                                    >
                                      {8 + i}px
                                    </option>
                                  ))}
                                </Form.Control>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Font Family</Form.Label>
                                <Form.Control
                                  as="select"
                                  className="inputbox"
                                  value={messageMobileFontSettings.fontFamily}
                                  onChange={(e) =>
                                    setMessageMobileFontSettings({
                                      ...messageMobileFontSettings,
                                      fontFamily: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "white",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {fontFamilies.map((font, i) => (
                                    <option key={`mmsg-ff-${i}`} value={font}>
                                      {font}
                                    </option>
                                  ))}
                                </Form.Control>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Font Weight</Form.Label>
                                <Form.Control
                                  as="select"
                                  className="inputbox"
                                  value={messageMobileFontSettings.fontWeight}
                                  onChange={(e) =>
                                    setMessageMobileFontSettings({
                                      ...messageMobileFontSettings,
                                      fontWeight: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "white",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {fontWeights.map((weight, i) => (
                                    <option key={`mmsg-fw-${i}`} value={weight}>
                                      {weight}
                                    </option>
                                  ))}
                                </Form.Control>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Letter Spacing</Form.Label>
                                <Form.Control
                                  type="range"
                                  min="-1"
                                  max="5"
                                  step="0.2"
                                  value={parseFloat(
                                    mobileMessageFontSettings.letterSpacing
                                  )}
                                  onChange={(e) =>
                                    setMessageMobileFontSettings({
                                      ...mobileMessageFontSettings,
                                      letterSpacing: `${e.target.value}px`,
                                    })
                                  }
                                  style={{ width: "100%" }}
                                />
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "10px" }}
                                >
                                  {mobileMessageFontSettings.letterSpacing}
                                </span>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Line Height</Form.Label>
                                <Form.Control
                                  type="range"
                                  min="0.8"
                                  max="2.0"
                                  step="0.1"
                                  value={parseFloat(
                                    mobileMessageFontSettings.lineHeight
                                  )}
                                  onChange={(e) =>
                                    setMessageMobileFontSettings({
                                      ...mobileMessageFontSettings,
                                      lineHeight: e.target.value,
                                    })
                                  }
                                  style={{ width: "100%" }}
                                />
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "10px" }}
                                >
                                  {mobileMessageFontSettings.lineHeight}
                                </span>
                              </Form.Group>
                            </div>
                          </div>
                        )}
                        {/* --- End Sale Message Section --- */}

                        <div className="d-flex flex-column gap-2 py-3">
                          <Form.Group>
                            <Form.Label className="inputtitle">
                              "End Sale" Message Text
                            </Form.Label>
                            <InputGroup className="position-relative">
                              <Form.Control
                                className="inputbox pe-5"
                                type="text"
                                placeholder="Enter end sale message"
                                style={{ background: "white" }}
                                value={endSaleMessage}
                                onChange={(e) =>
                                  setEndSaleMessage(e.target.value)
                                }
                              />
                              <div
                                onClick={() =>
                                  setShowEndSaleMessage(!showEndSaleMessage)
                                }
                                style={{
                                  position: "absolute",
                                  right: "10px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  cursor: "pointer",
                                  zIndex: 3,
                                  color: "#6c757d",
                                }}
                              >
                                {showEndSaleMessage ? (
                                  <EyeFill />
                                ) : (
                                  <EyeSlashFill />
                                )}
                              </div>
                            </InputGroup>
                          </Form.Group>
                          <div className="linewhite mt-3">
                            <h2
                              style={{
                                fontFamily: "Inter",
                                fontStyle: "normal",
                                fontWeight: "600",
                                fontSize: "15px",
                                lineHeight: "100%",
                                color: "#303030",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setEndsaleOptions(!showendsaleOptions)
                              }
                            >
                              "End Sale" Message Settings
                              {showendsaleOptions ? "▲" : "▼"}
                            </h2>
                          </div>
                          {showendsaleOptions && (
                            <div className="d-flex flex-wrap gap-3">
                              <Form.Group className="colorbox flex-grow-1">
                                <Form.Label>Background Color</Form.Label>
                                <div className="colorinputbox">
                                  <input
                                    type="color"
                                    value={
                                      endSaleMessageSettings.backgroundColor
                                    }
                                    onChange={(e) =>
                                      setEndSaleMessageSettings({
                                        ...endSaleMessageSettings,
                                        backgroundColor: e.target.value,
                                      })
                                    }
                                    className="colorinput"
                                  />
                                  <Form.Control
                                    type="text"
                                    className="inputbox"
                                    value={
                                      endSaleMessageSettings.backgroundColor
                                    }
                                    readOnly
                                    style={{ background: "white" }}
                                  />
                                </div>
                              </Form.Group>
                              <Form.Group className="colorbox flex-grow-1">
                                <Form.Label>Font Color</Form.Label>
                                <div className="colorinputbox">
                                  <input
                                    type="color"
                                    value={endSaleMessageSettings.fontColor}
                                    onChange={(e) =>
                                      setEndSaleMessageSettings({
                                        ...endSaleMessageSettings,
                                        fontColor: e.target.value,
                                      })
                                    }
                                    className="colorinput"
                                  />
                                  <Form.Control
                                    type="text"
                                    className="inputbox"
                                    value={endSaleMessageSettings.fontColor}
                                    readOnly
                                    style={{ background: "white" }}
                                  />
                                </div>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Font Size</Form.Label>
                                <Form.Control
                                  as="select"
                                  className="inputbox"
                                  value={endSaleMessageSettings.fontSize}
                                  onChange={(e) =>
                                    setEndSaleMessageSettings({
                                      ...endSaleMessageSettings,
                                      fontSize: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "white",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {[...Array(20).keys()].map((i) => (
                                    <option
                                      key={`esmsg-fs-${i}`}
                                      value={`${10 + i}px`}
                                    >
                                      {10 + i}px
                                    </option>
                                  ))}
                                </Form.Control>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Font Family</Form.Label>
                                <Form.Control
                                  as="select"
                                  className="inputbox"
                                  value={endSaleMessageSettings.fontFamily}
                                  onChange={(e) =>
                                    setEndSaleMessageSettings({
                                      ...endSaleMessageSettings,
                                      fontFamily: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "white",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {fontFamilies.map((font, i) => (
                                    <option key={`esmsg-ff-${i}`} value={font}>
                                      {font}
                                    </option>
                                  ))}
                                </Form.Control>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Font Weight</Form.Label>
                                <Form.Control
                                  as="select"
                                  className="inputbox"
                                  value={endSaleMessageSettings.fontWeight}
                                  onChange={(e) =>
                                    setEndSaleMessageSettings({
                                      ...endSaleMessageSettings,
                                      fontWeight: e.target.value,
                                    })
                                  }
                                  style={{
                                    background: "white",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {fontWeights.map((weight, i) => (
                                    <option
                                      key={`esmsg-fw-${i}`}
                                      value={weight}
                                    >
                                      {weight}
                                    </option>
                                  ))}
                                </Form.Control>
                              </Form.Group>
                            </div>
                          )}
                        </div>

                        {/* --- Timer Section --- */}
                        <div className="d-flex justify-content-between linewhite mt-4">
                          <div
                            className=""
                            onClick={() =>
                              setShowTimerOptions(!showTimerOptions)
                            }
                            style={{ cursor: "pointer" }}
                          >
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
                              Timer Styling Options{" "}
                              {showTimerOptions ? "▲" : "▼"}
                            </h2>
                          </div>

                          <div onClick={() => setShowTimer(!showTimer)}>
                            {showTimer ? <EyeFill /> : <EyeSlashFill />}
                          </div>
                        </div>
                        <div className="d-flex flex-column">
                          {showTimerOptions && (
                            <div className="py-3">
                              <div className="mt-4">
                                <h3>Set Countdown Target</h3>
                                <div className="d-flex flex-column mb-3">
                                  <label htmlFor="targetDate">Date:</label>
                                  <input
                                    type="date"
                                    id="targetDate"
                                    value={targetDate}
                                    onChange={(e) =>
                                      setTargetDate(e.target.value)
                                    }
                                    className="form-control"
                                  />
                                </div>
                                <div className="d-flex flex-column mb-3">
                                  <label htmlFor="targetTime">Time:</label>
                                  <input
                                    type="time"
                                    id="targetTime"
                                    value={targetTime}
                                    onChange={(e) =>
                                      setTargetTime(e.target.value)
                                    }
                                    className="form-control"
                                  />
                                </div>
                                {/* You can add a button here to explicitly start/stop the countdown if needed,
            or rely on the useEffect to start it when targetDate and targetTime are set. */}
                                <button
                                  onClick={handleSetTimer}
                                  className="btn btn-primary"
                                >
                                  Start Countdown
                                </button>
                              </div>

                              {/* Timer Font Color */}
                              <Form.Group className="colorbox mb-3">
                                <Form.Label>
                                  Timer Numbers Font Color
                                </Form.Label>
                                <div className="colorinputbox">
                                  <input
                                    type="color"
                                    value={
                                      timerColorSettings[
                                        "Timer Numbers Font Color"
                                      ]
                                    }
                                    onChange={(e) =>
                                      setTimerColorSettings({
                                        ...timerColorSettings,
                                        "Timer Numbers Font Color":
                                          e.target.value,
                                      })
                                    }
                                    className="colorinput"
                                  />
                                  <Form.Control
                                    type="text"
                                    className="inputbox"
                                    value={
                                      timerColorSettings[
                                        "Timer Numbers Font Color"
                                      ]
                                    }
                                    readOnly
                                    style={{ background: "white" }}
                                  />
                                </div>
                              </Form.Group>

                              {/* Desktop Timer Styling */}
                              <h4
                                className="mt-4 mb-3"
                                style={{ fontSize: "14px", fontWeight: "bold" }}
                              >
                                Desktop Timer Styles (Numbers)
                              </h4>
                              <div className="d-flex flex-wrap gap-3">
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Size</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerDesktopFontSettings.fontSize}
                                    onChange={(e) =>
                                      setTimerDesktopFontSettings({
                                        ...timerDesktopFontSettings,
                                        fontSize: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {[...Array(50).keys()].map((i) => (
                                      <option
                                        key={`dtimer-fs-${i}`}
                                        value={`${16 + i}px`}
                                      >
                                        {16 + i}px
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Family</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerDesktopFontSettings.fontFamily}
                                    onChange={(e) =>
                                      setTimerDesktopFontSettings({
                                        ...timerDesktopFontSettings,
                                        fontFamily: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {fontFamilies.map((font, i) => (
                                      <option
                                        key={`dtimer-ff-${i}`}
                                        value={font}
                                      >
                                        {font}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Weight</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerDesktopFontSettings.fontWeight}
                                    onChange={(e) =>
                                      setTimerDesktopFontSettings({
                                        ...timerDesktopFontSettings,
                                        fontWeight: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {fontWeights.map((weight, i) => (
                                      <option
                                        key={`dtimer-fw-${i}`}
                                        value={weight}
                                      >
                                        {weight}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Letter Spacing</Form.Label>
                                  <Form.Control
                                    type="range"
                                    min="-2"
                                    max="10"
                                    step="0.5"
                                    value={parseFloat(
                                      timerDesktopFontSettings.letterSpacing
                                    )}
                                    onChange={(e) =>
                                      setTimerDesktopFontSettings({
                                        ...timerDesktopFontSettings,
                                        letterSpacing: `${e.target.value}px`,
                                      })
                                    }
                                    style={{ width: "100%" }}
                                  />
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "10px" }}
                                  >
                                    {timerDesktopFontSettings.letterSpacing}
                                  </span>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Line Height</Form.Label>
                                  <Form.Control
                                    type="range"
                                    min="0.8"
                                    max="2.5"
                                    step="0.1"
                                    value={parseFloat(
                                      timerDesktopFontSettings.lineHeight
                                    )}
                                    onChange={(e) =>
                                      setTimerDesktopFontSettings({
                                        ...timerDesktopFontSettings,
                                        lineHeight: e.target.value,
                                      })
                                    }
                                    style={{ width: "100%" }}
                                  />
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "10px" }}
                                  >
                                    {timerDesktopFontSettings.lineHeight}
                                  </span>
                                </Form.Group>
                              </div>

                              {/* Mobile Timer Styling */}
                              <h4
                                className="mt-4 mb-3"
                                style={{ fontSize: "14px", fontWeight: "bold" }}
                              >
                                Mobile Timer Styles (Numbers)
                              </h4>
                              <div className="d-flex flex-wrap gap-3">
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Size</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerMobileFontSettings.fontSize}
                                    onChange={(e) =>
                                      setTimerMobileFontSettings({
                                        ...timerMobileFontSettings,
                                        fontSize: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {[...Array(30).keys()].map((i) => (
                                      <option
                                        key={`mtimer-fs-${i}`}
                                        value={`${10 + i}px`}
                                      >
                                        {10 + i}px
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Family</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerMobileFontSettings.fontFamily}
                                    onChange={(e) =>
                                      setTimerMobileFontSettings({
                                        ...timerMobileFontSettings,
                                        fontFamily: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {fontFamilies.map((font, i) => (
                                      <option
                                        key={`mtimer-ff-${i}`}
                                        value={font}
                                      >
                                        {font}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Weight</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerMobileFontSettings.fontWeight}
                                    onChange={(e) =>
                                      setTimerMobileFontSettings({
                                        ...timerMobileFontSettings,
                                        fontWeight: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {fontWeights.map((weight, i) => (
                                      <option
                                        key={`mtimer-fw-${i}`}
                                        value={weight}
                                      >
                                        {weight}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Letter Spacing</Form.Label>
                                  <Form.Control
                                    type="range"
                                    min="-1"
                                    max="5"
                                    step="0.2"
                                    value={parseFloat(
                                      timerMobileFontSettings.letterSpacing
                                    )}
                                    onChange={(e) =>
                                      setTimerMobileFontSettings({
                                        ...timerMobileFontSettings,
                                        letterSpacing: `${e.target.value}px`,
                                      })
                                    }
                                    style={{ width: "100%" }}
                                  />
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "10px" }}
                                  >
                                    {timerMobileFontSettings.letterSpacing}
                                  </span>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Line Height</Form.Label>
                                  <Form.Control
                                    type="range"
                                    min="0.8"
                                    max="2.0"
                                    step="0.1"
                                    value={parseFloat(
                                      timerMobileFontSettings.lineHeight
                                    )}
                                    onChange={(e) =>
                                      setTimerMobileFontSettings({
                                        ...timerMobileFontSettings,
                                        lineHeight: e.target.value,
                                      })
                                    }
                                    style={{ width: "100%" }}
                                  />
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "10px" }}
                                  >
                                    {timerMobileFontSettings.lineHeight}
                                  </span>
                                </Form.Group>
                              </div>

                              {/* --- Timer Labels --- */}
                              <h4
                                className="mt-4 mb-3"
                                style={{ fontSize: "14px", fontWeight: "bold" }}
                              >
                                Timer Labels (Days, Hours etc.)
                              </h4>
                              <Form.Group className="flex-grow-1 mb-3">
                                <Form.Label>Show Labels</Form.Label>
                                <div className="d-flex flex-column gap-2">
                                  <Form.Check
                                    type="switch"
                                    id="showDaysLabelSwitch"
                                    label="Days"
                                    checked={timerLabelSettings.showDaysLabel}
                                    onChange={(e) =>
                                      setTimerLabelSettings({
                                        ...timerLabelSettings,
                                        showDaysLabel: e.target.checked,
                                      })
                                    }
                                  />
                                  <Form.Check
                                    type="switch"
                                    id="showHoursLabelSwitch"
                                    label="Hours"
                                    checked={timerLabelSettings.showHoursLabel}
                                    onChange={(e) =>
                                      setTimerLabelSettings({
                                        ...timerLabelSettings,
                                        showHoursLabel: e.target.checked,
                                      })
                                    }
                                  />
                                  <Form.Check
                                    type="switch"
                                    id="showMinutesLabelSwitch"
                                    label="Minutes"
                                    checked={
                                      timerLabelSettings.showMinutesLabel
                                    }
                                    onChange={(e) =>
                                      setTimerLabelSettings({
                                        ...timerLabelSettings,
                                        showMinutesLabel: e.target.checked,
                                      })
                                    }
                                  />
                                  <Form.Check
                                    type="switch"
                                    id="showSecondsLabelSwitch"
                                    label="Seconds"
                                    checked={
                                      timerLabelSettings.showSecondsLabel
                                    }
                                    onChange={(e) =>
                                      setTimerLabelSettings({
                                        ...timerLabelSettings,
                                        showSecondsLabel: e.target.checked,
                                      })
                                    }
                                  />
                                </div>
                              </Form.Group>

                              <div className="d-flex flex-wrap gap-3">
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Size</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerLabelSettings.fontSize}
                                    onChange={(e) =>
                                      setTimerLabelSettings({
                                        ...timerLabelSettings,
                                        fontSize: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {[...Array(20).keys()].map((i) => (
                                      <option
                                        key={`label-fs-${i}`}
                                        value={`${8 + i}px`}
                                      >
                                        {8 + i}px
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Family</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerLabelSettings.fontFamily}
                                    onChange={(e) =>
                                      setTimerLabelSettings({
                                        ...timerLabelSettings,
                                        fontFamily: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {fontFamilies.map((font, i) => (
                                      <option
                                        key={`label-ff-${i}`}
                                        value={font}
                                      >
                                        {font}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Weight</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerLabelSettings.fontWeight}
                                    onChange={(e) =>
                                      setTimerLabelSettings({
                                        ...timerLabelSettings,
                                        fontWeight: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {fontWeights.map((weight, i) => (
                                      <option
                                        key={`label-fw-${i}`}
                                        value={weight}
                                      >
                                        {weight}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Case</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerLabelSettings.fontCase}
                                    onChange={(e) =>
                                      setTimerLabelSettings({
                                        ...timerLabelSettings,
                                        fontCase: e.target.value,
                                      })
                                    }
                                    style={{ background: "white" }}
                                  >
                                    {fontCases.map((fcase, i) => (
                                      <option
                                        key={`label-fc-${i}`}
                                        value={fcase}
                                      >
                                        {fcase}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="colorbox flex-grow-1">
                                  <Form.Label>Font Color</Form.Label>
                                  <div className="colorinputbox">
                                    <input
                                      type="color"
                                      value={
                                        timerColorSettings[
                                          "Timer Labels Font Color"
                                        ]
                                      }
                                      onChange={(e) =>
                                        setTimerColorSettings({
                                          ...timerColorSettings,
                                          "Timer Labels Font Color":
                                            e.target.value,
                                        })
                                      }
                                      className="colorinput"
                                    />
                                    <Form.Control
                                      type="text"
                                      className="inputbox"
                                      value={
                                        timerColorSettings[
                                          "Timer Labels Font Color"
                                        ]
                                      }
                                      readOnly
                                      style={{ background: "white" }}
                                    />
                                  </div>
                                </Form.Group>
                              </div>

                              {/* --- Separators --- */}
                              <h4
                                className="mt-4 mb-3"
                                style={{ fontSize: "14px", fontWeight: "bold" }}
                              >
                                Separators
                              </h4>
                              <Form.Group className="colorbox mb-3">
                                <Form.Label>Color</Form.Label>
                                <div className="colorinputbox">
                                  <input
                                    type="color"
                                    value={
                                      timerColorSettings[
                                        "Timer Separator Color"
                                      ]
                                    }
                                    onChange={(e) =>
                                      setTimerColorSettings({
                                        ...timerColorSettings,
                                        "Timer Separator Color": e.target.value,
                                      })
                                    }
                                    className="colorinput"
                                  />
                                  <Form.Control
                                    type="text"
                                    className="inputbox"
                                    value={
                                      timerColorSettings[
                                        "Timer Separator Color"
                                      ]
                                    }
                                    readOnly
                                    style={{ background: "white" }}
                                  />
                                </div>
                              </Form.Group>
                              <Form.Group className="flex-grow-1">
                                <Form.Label>Show Separators</Form.Label>
                                <Form.Check
                                  type="switch"
                                  id="showSeparatorsSwitch"
                                  checked={timerBlockSettings.showSeparators}
                                  onChange={(e) =>
                                    setTimerBlockSettings({
                                      ...timerBlockSettings,
                                      showSeparators: e.target.checked,
                                    })
                                  }
                                />
                              </Form.Group>

                              {/* --- Background, Border, Rounded Corners, Spacing --- */}
                              <h4
                                className="mt-4 mb-3"
                                style={{ fontSize: "14px", fontWeight: "bold" }}
                              >
                                Timer Block Styles
                              </h4>
                              <div className="d-flex flex-wrap gap-3">
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Show Background</Form.Label>
                                  <Form.Check
                                    type="switch"
                                    id="showTimerBlockBackgroundSwitch"
                                    checked={showTimerBlockBackground}
                                    onChange={(e) =>
                                      setShowTimerBlockBackground(
                                        e.target.checked
                                      )
                                    }
                                  />
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Show Border</Form.Label>
                                  <Form.Check
                                    type="switch"
                                    id="showTimerBlockBorderSwitch"
                                    checked={showTimerBlockBorder}
                                    onChange={(e) =>
                                      setShowTimerBlockBorder(e.target.checked)
                                    }
                                  />
                                </Form.Group>
                              </div>
                              {showTimerBlockBackground && (
                                <Form.Group className="colorbox flex-grow-1 mt-3">
                                  <Form.Label>Background Color</Form.Label>
                                  <div className="colorinputbox">
                                    <input
                                      type="color"
                                      value={
                                        timerColorSettings[
                                          "Timer Block Background Color"
                                        ]
                                      }
                                      onChange={(e) =>
                                        setTimerColorSettings({
                                          ...timerColorSettings,
                                          "Timer Block Background Color":
                                            e.target.value,
                                        })
                                      }
                                      className="colorinput"
                                    />
                                    <Form.Control
                                      type="text"
                                      className="inputbox"
                                      value={
                                        timerColorSettings[
                                          "Timer Block Background Color"
                                        ]
                                      }
                                      readOnly
                                      style={{ background: "white" }}
                                    />
                                  </div>
                                </Form.Group>
                              )}
                              {showTimerBlockBorder && (
                                <Form.Group className="colorbox flex-grow-1 mt-3">
                                  <Form.Label>Border Color</Form.Label>
                                  <div className="colorinputbox">
                                    <input
                                      type="color"
                                      value={
                                        timerColorSettings[
                                          "Timer Block Border Color"
                                        ]
                                      }
                                      onChange={(e) =>
                                        setTimerColorSettings({
                                          ...timerColorSettings,
                                          "Timer Block Border Color":
                                            e.target.value,
                                        })
                                      }
                                      className="colorinput"
                                    />
                                    <Form.Control
                                      type="text"
                                      className="inputbox"
                                      value={
                                        timerColorSettings[
                                          "Timer Block Border Color"
                                        ]
                                      }
                                      readOnly
                                      style={{ background: "white" }}
                                    />
                                  </div>
                                </Form.Group>
                              )}

                              <div className="d-flex flex-wrap gap-3 mt-3">
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Rounded Corners</Form.Label>
                                  <Form.Control
                                    type="range"
                                    min="0"
                                    max="50"
                                    step="1"
                                    value={parseFloat(
                                      timerBlockSettings.roundedCorners
                                    )}
                                    onChange={(e) =>
                                      setTimerBlockSettings({
                                        ...timerBlockSettings,
                                        roundedCorners: `${e.target.value}px`,
                                      })
                                    }
                                    style={{ width: "100%" }}
                                  />
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "10px" }}
                                  >
                                    {timerBlockSettings.roundedCorners}
                                  </span>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Spacing</Form.Label>
                                  <Form.Control
                                    type="range"
                                    min="0"
                                    max="30"
                                    step="1"
                                    value={parseFloat(
                                      timerBlockSettings.spacing
                                    )}
                                    onChange={(e) =>
                                      setTimerBlockSettings({
                                        ...timerBlockSettings,
                                        spacing: `${e.target.value}px`,
                                      })
                                    }
                                    style={{ width: "100%" }}
                                  />
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "10px" }}
                                  >
                                    {timerBlockSettings.spacing}
                                  </span>
                                </Form.Group>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="d-flex justify-content-between linewhite mt-4">
                          <h2
                            style={{
                              fontFamily: "Inter",
                              fontStyle: "normal",
                              fontWeight: "600",
                              fontSize: "15px",
                              lineHeight: "100%",
                              color: "#303030",
                              cursor: "pointer",
                            }}
                            onClick={() => setSaveOptions(!showsaveOptions)}
                          >
                            "Shop Now" Button Settings
                            {showsaveOptions ? "▲" : "▼"}
                          </h2>

                          <div
                            onClick={() =>
                              setShowShopNowButton(!showShopNowButton)
                            }
                          >
                            {showShopNowButton ? <EyeFill /> : <EyeSlashFill />}
                          </div>
                        </div>
                        <div className="d-flex flex-column">
                          {showsaveOptions && (
                            <>
                              <Form.Group className="mb-3">
                                <Form.Label>Button Text</Form.Label>
                                <Form.Control
                                  type="text"
                                  className="inputbox"
                                  value={shopNowButtonText}
                                  onChange={(e) =>
                                    setShopNowButtonText(e.target.value)
                                  }
                                  style={{ background: "white" }}
                                />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label>Enable Shaky Animation</Form.Label>
                                <Form.Check
                                  type="switch"
                                  id="animateShopNowButtonSwitch"
                                  checked={animateShopNowButton}
                                  onChange={(e) =>
                                    setAnimateShopNowButton(e.target.checked)
                                  }
                                />
                              </Form.Group>

                              <div className="d-flex flex-wrap gap-3">
                                <Form.Group className="colorbox flex-grow-1">
                                  <Form.Label>Background Color</Form.Label>
                                  <div className="colorinputbox">
                                    <input
                                      type="color"
                                      value={
                                        shopNowButtonSettings.backgroundColor
                                      }
                                      onChange={(e) =>
                                        setShopNowButtonSettings({
                                          ...shopNowButtonSettings,
                                          backgroundColor: e.target.value,
                                        })
                                      }
                                      className="colorinput"
                                    />
                                    <Form.Control
                                      type="text"
                                      className="inputbox"
                                      value={
                                        shopNowButtonSettings.backgroundColor
                                      }
                                      readOnly
                                      style={{ background: "white" }}
                                    />
                                  </div>
                                </Form.Group>
                                <Form.Group className="colorbox flex-grow-1">
                                  <Form.Label>Font Color</Form.Label>
                                  <div className="colorinputbox">
                                    <input
                                      type="color"
                                      value={shopNowButtonSettings.fontColor}
                                      onChange={(e) =>
                                        setShopNowButtonSettings({
                                          ...shopNowButtonSettings,
                                          fontColor: e.target.value,
                                        })
                                      }
                                      className="colorinput"
                                    />
                                    <Form.Control
                                      type="text"
                                      className="inputbox"
                                      value={shopNowButtonSettings.fontColor}
                                      readOnly
                                      style={{ background: "white" }}
                                    />
                                  </div>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Size</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={shopNowButtonSettings.fontSize}
                                    onChange={(e) =>
                                      setShopNowButtonSettings({
                                        ...shopNowButtonSettings,
                                        fontSize: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {[...Array(15).keys()].map((i) => (
                                      <option
                                        key={`shop-fs-${i}`}
                                        value={`${10 + i}px`}
                                      >
                                        {10 + i}px
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Family</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={shopNowButtonSettings.fontFamily}
                                    onChange={(e) =>
                                      setShopNowButtonSettings({
                                        ...shopNowButtonSettings,
                                        fontFamily: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {fontFamilies.map((font, i) => (
                                      <option key={`shop-ff-${i}`} value={font}>
                                        {font}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Weight</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={shopNowButtonSettings.fontWeight}
                                    onChange={(e) =>
                                      setShopNowButtonSettings({
                                        ...shopNowButtonSettings,
                                        fontWeight: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {fontWeights.map((weight, i) => (
                                      <option
                                        key={`shop-fw-${i}`}
                                        value={weight}
                                      >
                                        {weight}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Padding</Form.Label>
                                  <Form.Control
                                    type="text"
                                    className="inputbox"
                                    value={shopNowButtonSettings.padding}
                                    onChange={(e) =>
                                      setShopNowButtonSettings({
                                        ...shopNowButtonSettings,
                                        padding: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., 8px 15px"
                                    style={{ background: "white" }}
                                  />
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Border Radius</Form.Label>
                                  <Form.Control
                                    type="text"
                                    className="inputbox"
                                    value={shopNowButtonSettings.borderRadius}
                                    onChange={(e) =>
                                      setShopNowButtonSettings({
                                        ...shopNowButtonSettings,
                                        borderRadius: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., 5px"
                                    style={{ background: "white" }}
                                  />
                                </Form.Group>
                                <Form.Group className="colorbox flex-grow-1">
                                  <Form.Label>Border Color</Form.Label>
                                  <div className="colorinputbox">
                                    <input
                                      type="color"
                                      value={shopNowButtonSettings.borderColor}
                                      onChange={(e) =>
                                        setShopNowButtonSettings({
                                          ...shopNowButtonSettings,
                                          borderColor: e.target.value,
                                        })
                                      }
                                      className="colorinput"
                                    />
                                    <Form.Control
                                      type="text"
                                      className="inputbox"
                                      value={shopNowButtonSettings.borderColor}
                                      readOnly
                                      style={{ background: "white" }}
                                    />
                                  </div>
                                </Form.Group>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="d-flex justify-content-between linewhite mt-4">
                          <h2
                            style={{
                              fontFamily: "Inter",
                              fontStyle: "normal",
                              fontWeight: "600",
                              fontSize: "15px",
                              lineHeight: "100%",
                              color: "#303030",
                              cursor: "pointer",
                            }}
                            onClick={() => setShowSaveBox(!showSaveBox)}
                          >
                            "Save 30%" Box Settings
                            {showSaveBox ? "▲" : "▼"}
                          </h2>
                          <div onClick={() => setShowSaveBox(!showSaveBox)}>
                            {showSaveBox ? <EyeFill /> : <EyeSlashFill />}
                          </div>
                        </div>
                        <div className="d-flex flex-column gap-2 py-3">
                          {showSaveBox && (
                            <>
                              <Form.Group className="mb-3">
                                <Form.Label>Box Text</Form.Label>
                                <Form.Control
                                  type="text"
                                  className="inputbox"
                                  value={saveBoxText}
                                  onChange={(e) =>
                                    setSaveBoxText(e.target.value)
                                  }
                                  style={{ background: "white" }}
                                />
                              </Form.Group>

                              <div className="d-flex flex-wrap gap-3">
                                <Form.Group className="colorbox flex-grow-1">
                                  <Form.Label>Background Color</Form.Label>
                                  <div className="colorinputbox">
                                    <input
                                      type="color"
                                      value={saveBoxSettings.backgroundColor}
                                      onChange={(e) =>
                                        setSaveBoxSettings({
                                          ...saveBoxSettings,
                                          backgroundColor: e.target.value,
                                        })
                                      }
                                      className="colorinput"
                                    />
                                    <Form.Control
                                      type="text"
                                      className="inputbox"
                                      value={saveBoxSettings.backgroundColor}
                                      readOnly
                                      style={{ background: "white" }}
                                    />
                                  </div>
                                </Form.Group>
                                <Form.Group className="colorbox flex-grow-1">
                                  <Form.Label>Font Color</Form.Label>
                                  <div className="colorinputbox">
                                    <input
                                      type="color"
                                      value={saveBoxSettings.fontColor}
                                      onChange={(e) =>
                                        setSaveBoxSettings({
                                          ...saveBoxSettings,
                                          fontColor: e.target.value,
                                        })
                                      }
                                      className="colorinput"
                                    />
                                    <Form.Control
                                      type="text"
                                      className="inputbox"
                                      value={saveBoxSettings.fontColor}
                                      readOnly
                                      style={{ background: "white" }}
                                    />
                                  </div>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Size</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={saveBoxSettings.fontSize}
                                    onChange={(e) =>
                                      setSaveBoxSettings({
                                        ...saveBoxSettings,
                                        fontSize: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {[...Array(15).keys()].map((i) => (
                                      <option
                                        key={`savebox-fs-${i}`}
                                        value={`${10 + i}px`}
                                      >
                                        {10 + i}px
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Family</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={saveBoxSettings.fontFamily}
                                    onChange={(e) =>
                                      setSaveBoxSettings({
                                        ...saveBoxSettings,
                                        fontFamily: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {fontFamilies.map((font, i) => (
                                      <option
                                        key={`savebox-ff-${i}`}
                                        value={font}
                                      >
                                        {font}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Font Weight</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={saveBoxSettings.fontWeight}
                                    onChange={(e) =>
                                      setSaveBoxSettings({
                                        ...saveBoxSettings,
                                        fontWeight: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {fontWeights.map((weight, i) => (
                                      <option
                                        key={`savebox-fw-${i}`}
                                        value={weight}
                                      >
                                        {weight}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Padding</Form.Label>
                                  <Form.Control
                                    type="text"
                                    className="inputbox"
                                    value={saveBoxSettings.padding}
                                    onChange={(e) =>
                                      setSaveBoxSettings({
                                        ...saveBoxSettings,
                                        padding: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., 5px 10px"
                                    style={{ background: "white" }}
                                  />
                                </Form.Group>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Border Radius</Form.Label>
                                  <Form.Control
                                    type="text"
                                    className="inputbox"
                                    value={saveBoxSettings.borderRadius}
                                    onChange={(e) =>
                                      setSaveBoxSettings({
                                        ...saveBoxSettings,
                                        borderRadius: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., 3px"
                                    style={{ background: "white" }}
                                  />
                                </Form.Group>
                                <Form.Group className="colorbox flex-grow-1">
                                  <Form.Label>Border Color</Form.Label>
                                  <div className="colorinputbox">
                                    <input
                                      type="color"
                                      value={saveBoxSettings.borderColor}
                                      onChange={(e) =>
                                        setSaveBoxSettings({
                                          ...saveBoxSettings,
                                          borderColor: e.target.value,
                                        })
                                      }
                                      className="colorinput"
                                    />
                                    <Form.Control
                                      type="text"
                                      className="inputbox"
                                      value={saveBoxSettings.borderColor}
                                      readOnly
                                      style={{ background: "white" }}
                                    />
                                  </div>
                                </Form.Group>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mt-4">
                          <h5 className="mb-2">Bar Dimensions</h5>
                          <Row className="mb-3">
                            <Col>
                              <Form.Label>Bar Width (%)</Form.Label>
                              <Form.Range
                                min={50} 
                                max={100} 
                                step={1}
                                value={barWidth}
                                onChange={(e) =>
                                  setBarWidth(Number(e.target.value))
                                }
                              />
                              <small>{barWidth}%</small>
                            </Col>
                            <Col>
                              <Form.Label>Bar Height</Form.Label>
                              <Form.Range
                                min={50} 
                                max={230} 
                                step={1}
                                value={barHeight}
                                onChange={(e) =>
                                  setBarHeight(Number(e.target.value))
                                }
                              />
                              <small>{barHeight}px</small>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </div>
                  </Form>

                  <Form
                    className="mt-3 p-3"
                    style={{ background: "#F1F2F4", borderRadius: "10px" }}
                  >
                    {/* --- Theme Style Section --- */}
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
                          className={`theme-option ${selectedTheme === theme.value ? "active" : ""}`}
                          style={{
                            cursor: "pointer",
                            border:
                              selectedTheme === theme.value
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
                          ) : theme.value === "image-upload" ? (
                            <div
                              style={{
                                width: "100%",
                                height: "60px",
                                background: uploadedImage
                                  ? `url(${uploadedImage}) no-repeat center center / cover`
                                  : "#e0e0e0",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "24px",
                                color: uploadedImage ? "transparent" : "#555",
                              }}
                            >
                              {!uploadedImage && (
                                <>
                                  {theme.icon}
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      marginTop: "5px",
                                    }}
                                  >
                                    Upload
                                  </span>
                                </>
                              )}
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

                    {selectedTheme === "image-upload" && (
                      <div className="py-3">
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Label>Select your background image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </Form.Group>
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

                    {/* Bar Position */}
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

                    {/* Custom CSS Field */}
                    <div className="mt-4">
                      <Form.Group className="d-flex flex-column gap-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <Form.Label className="inputtitle mb-0">
                            Custom CSS
                          </Form.Label>
                          {/* Custom CSS Toggle Button */}
                          <Form.Check
                            type="switch"
                            id="custom-css-switch"
                            checked={isCustomCSSEnabled}
                            onChange={handleCSSToggle}
                          />
                        </div>
                        <Form.Control
                          as="textarea"
                          rows={4} // This sets an initial height based on rows
                          placeholder="Enter custom CSS here..."
                          className="inputbox"
                          style={{
                            background: "white",
                            fontFamily: "monospace",
                            fontSize: "13px",
                            // --- Crucial for user-resizable box with scrollbars ---
                            overflow: "auto", // Adds scrollbars if content overflows
                            resize: "both", // Allows user to drag to resize both height and width
                            // ---
                            opacity: isCustomCSSEnabled ? 1 : 0.6,
                            cursor: isCustomCSSEnabled ? "text" : "not-allowed",
                          }}
                          value={customCSS}
                          onChange={(e) => setCustomCSS(e.target.value)}
                          disabled={!isCustomCSSEnabled} // Disable textarea if toggle is off
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
                          Paste any valid CSS to override or customize the
                          appearance of the announcement bar or other elements.
                        </p>
                      </Form.Group>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            )}
            {/* Step 5: Summary */}
            {selectedIndex === 1 && (
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
                <div className="d-flex flex-column  align-items-center gap-2"
                style={{
                      position:
                        barPosition === "top-fixed" || barPosition === "bottom"
                          ? "fixed"
                          : "relative",
                }}>
                 

                  <div
                    className={`themetitle announcement-bar ${barPosition === "top-fixed" ? "fixed-bar" : ""}`}
                    style={{
                      position:
                        barPosition === "top-fixed" || barPosition === "bottom"
                          ? "fixed"
                          : "relative",
                      top: barPosition === "top-fixed" ? 0 : "auto",
                      bottom: barPosition === "bottom" ? 0 : "auto",
                      left: "50%", // Center horizontally
                      transform: "translateX(-50%)", // Adjust for centering
                      width: `${barWidth}%`, // Dynamic width
                      resize: "both",
                      height: `${barHeight}px`, 
                     
                      maxWidth: "100%",
                      zIndex: 4,
                      background: getBackgroundStyle(),
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      padding: "12px 16px",
                      borderRadius: "8px 8px 0 0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "15px",
                      marginTop: barPosition === "top" ? "0px" : 0,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {showMessage && (
                      <div
                        className="message-container"
                        style={{
                          overflow: "hidden",
                          flexGrow: 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <h2
                          className={`cardtitle ${animateMessage ? "scrolling-text" : ""}`}
                          style={{
                            margin: 0,
                            color: generalColorSettings["Message Font Color"],
                            fontSize: messageDesktopFontSettings.fontSize,
                            fontFamily: messageDesktopFontSettings.fontFamily,
                            fontWeight: messageDesktopFontSettings.fontWeight,
                            letterSpacing:
                              messageDesktopFontSettings.letterSpacing,
                            lineHeight: messageDesktopFontSettings.lineHeight,
                            display: "inline-block", // Important for scrolling effect
                            paddingLeft: animateMessage ? "100%" : "0", // Start off-screen
                            animation: animateMessage
                              ? `scrollText ${messageAnimationSpeed}s linear infinite` // Dynamic speed
                              : "none",
                          }}
                        >
                          {[...Array(5)].map(
                            (
                              _,
                              i // Repeat message 5 times
                            ) => (
                              <React.Fragment key={i}>
                                {message || "Type text here"}
                                {message.length > 0 && i < 4 && (
                                  <span
                                    style={{
                                      marginLeft: "50px",
                                      marginRight: "50px",
                                    }}
                                  >
                                    &bull;
                                  </span>
                                )}{" "}
                                {/* Add separator */}
                              </React.Fragment>
                            )
                          )}
                        </h2>
                      </div>
                    )}
                    <div className="d-flex align-items-center justify-content-center gap-3">
                      {showSaveBox && (
                        <div
                          className="save-box"
                          style={{
                            backgroundColor: saveBoxSettings.backgroundColor,
                            color: saveBoxSettings.fontColor,
                            fontSize: saveBoxSettings.fontSize,
                            fontFamily: saveBoxSettings.fontFamily,
                            fontWeight: saveBoxSettings.fontWeight,
                            padding: saveBoxSettings.padding,
                            borderRadius: saveBoxSettings.borderRadius,
                            border: `1px solid ${saveBoxSettings.borderColor}`,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            height: "fit-content",
                          }}
                        >
                          {saveBoxText}
                        </div>
                      )}
                      
                      {showTimer && (
                        <div className="timer-display mt-0 d-flex align-items-center justify-content-center">
                          {fixedTimerDisplay
                            .split(":")
                            .map((part, index, arr) => (
                              <React.Fragment key={index}>
                                {renderTimerBlock(
                                  part,
                                  index === 0
                                    ? "Days"
                                    : index === 1
                                      ? "Hours"
                                      : index === 2
                                        ? "Minutes"
                                        : "Seconds",
                                  index === 0
                                    ? timerLabelSettings.showDaysLabel
                                    : index === 1
                                      ? timerLabelSettings.showHoursLabel
                                      : index === 2
                                        ? timerLabelSettings.showMinutesLabel
                                        : timerLabelSettings.showSecondsLabel
                                )}
                                {index < arr.length - 1 &&
                                  timerBlockSettings.showSeparators && (
                                    <span
                                      className="timer-separator"
                                      style={{
                                        color:
                                          timerColorSettings[
                                            "Timer Separator Color"
                                          ],
                                        fontSize:
                                          timerDesktopFontSettings.fontSize,
                                      }}
                                    >
                                      :
                                    </span>
                                  )}
                              </React.Fragment>
                            ))}
                        </div>
                      )}

                      {showShopNowButton && (
                        <div
                          className={`shop-now-button ${animateShopNowButton ? "shaky" : ""}`}
                          style={{
                            backgroundColor:
                              shopNowButtonSettings.backgroundColor,
                            color: shopNowButtonSettings.fontColor,
                            fontSize: shopNowButtonSettings.fontSize,
                            fontFamily: shopNowButtonSettings.fontFamily,
                            fontWeight: shopNowButtonSettings.fontWeight,
                            padding: shopNowButtonSettings.padding,
                            borderRadius: shopNowButtonSettings.borderRadius,
                            border: `1px solid ${shopNowButtonSettings.borderColor}`,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            marginLeft: "15px",
                          }}
                        >
                          {shopNowButtonText} {/* This is the corrected line */}
                        </div>
                      )}
                    </div>
                    <div
  className="wave-bottom"
  style={{
    position: "absolute",
    bottom: "0px", /* Align wave with the bottom of announcement-bar */
    left: "0",
    width: "100%",
    height: "50px", /* This is the visual height of your wave. Adjust for amplitude. */
    zIndex: 1,
    // No background here, as the SVG's path fill will determine the color
  }}
>
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 1200 120" /* Keep the viewBox, path coordinates are relative to this */
    preserveAspectRatio="none"
    style={{
      display: "block",
      width: "100%",
      height: "100%",
    }}
  >
    <defs>
      <linearGradient id="dynamicWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        {/*
          getBackgroundStyle() likely returns a CSS string for a background.
          If it returns an object with startColor and endColor, this works.
          If it returns a CSS string like 'linear-gradient(...)', you'll need
          to parse it or adjust getBackgroundStyle to return an object.
          For now, assuming it returns { startColor: '...', endColor: '...' }
        */}
        <stop offset="0%" stopColor={getBackgroundStyle().startColor || '#ffffff'} /> {/* Default to white if not found */}
        <stop offset="100%" stopColor={getBackgroundStyle().endColor || '#ffffff'} /> {/* Default to white if not found */}
      </linearGradient>
    </defs>

    {/* Main wave layer - Path adjusted for bottom wave with bigger last curve */}
    <path
      // M0,120: Start at bottom-left of viewBox (0, 120)
      // Q points: (controlX, controlY, endX, endY)
      // T points: (endX, endY) - creates smooth curve from previous Q/T
      // The wave moves up (smaller Y) then down (larger Y, towards 120)
      d="M0,120 L0,90 C100,20 200,100 300,90 S500,40 600,90 S800,20 900,90 C1000,100 1100,50 1200,90 L1200,120 Z"
      fill="url(#dynamicWaveGradient)"
      style={{
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
      }}
    />

    {/* Second wave layer for depth - Path adjusted slightly differently for offset */}
    <path
      // Slightly different offsets for a layered look
      d="M0,120 L0,100 C150,30 300,110 450,100 S750,50 900,100 C1050,110 1150,60 1200,100 L1200,120 Z"
      fill="url(#dynamicWaveGradient)"
      style={{
        opacity: 0.7, // Keep opacity for layered effect
      }}
    />
  </svg>
</div>

                  </div>
                </div>
                {showEndSaleMessage && (
                  <div
                    className="end-sale-message"
                    style={{
                      backgroundColor: endSaleMessageSettings.backgroundColor,
                      color: endSaleMessageSettings.fontColor,
                      fontSize: endSaleMessageSettings.fontSize,
                      fontFamily: endSaleMessageSettings.fontFamily,
                      fontWeight: endSaleMessageSettings.fontWeight,
                      padding: "5px 10px",
                      borderRadius: "3px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px 18px 8px 8px",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: "8px 10px 8px 8px",
                      gap: "5px",
                      position: "absolute",
                      width: "144.5px",
                      height: "29px",
                      right: "0px",
                      top: "0.5px",
                      zIndex: 3,
                    }}
                  >
                    {endSaleMessage}
                  </div>
                )}

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
