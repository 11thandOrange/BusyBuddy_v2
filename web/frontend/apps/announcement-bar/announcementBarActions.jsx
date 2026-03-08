import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
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
import { EyeFill, EyeSlashFill, Trash } from "react-bootstrap-icons";
import "react-calendar/dist/Calendar.css";
import Button from "../../components/Button";
import edit from "../../assets/elements.png";
import customize from "../../assets/customize.png";
import { CaretDownFill } from "react-bootstrap-icons";
import tshirtp from "../../assets/tshirt.png";
import EmojiPicker from "emoji-picker-react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { SketchPicker } from "react-color";
import AnnouncementBarActions from "./announcementBarActions";
import "./announcementBarStyles.css";
import dropdown from "../../assets/Vector.png";
import EmailBarSettings from "./components/EmailBarSettings";

// export default function BundleDiscountActions({ onMakeBundleClick, editingBar ,onSuccess}) {
const BundleDiscountActions = React.forwardRef(
  ({ onMakeBundleClick, editingBar, onSuccess }, ref) => {
    const shopify = useAppBridge();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [message, setMessage] = useState("Text is ticking");
    const [barPosition, setBarPosition] = useState("top");
    const [customCSS, setCustomCSS] = useState("");
    const [barWidth, setBarWidth] = useState(100); // Percentage or pixel value
    const [barHeight, setBarHeight] = useState(180);

    const [status, setStatus] = useState("active"); // status
    const [name, setName] = useState(""); // Name field state

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
    const [showCountdown, setShowCountdown] = useState(false);
    const [isCustomCSSEnabled, setIsCustomCSSEnabled] = useState(false);
    const tabs = [
      "Create Announcement Bar",
      "Customize Appearance",
      "Review Settings",
    ];
    const [showLabels, setShowLabels] = useState(true);

    const [timerColorSettings, setTimerColorSettings] = useState({
      "Timer Numbers Font Color": "#ffffff",
      "Timer Labels Font Color": "#ffffff",
      "Timer Separator Color": "#ffffff",
      "Timer Block Background Color": "transparent",
      "Timer Block Border Color": "transparent",
    });

    const [showMessage, setShowMessage] = useState(true); // New: State for message visibility
    const [showMessageOptions, setShowMessageOptions] = useState(false);

    const [showWaveOptions, setShowWaveOptions] = useState(false);

    const [showsaveOptions, setSaveOptions] = useState(false); // Renamed
    const [showendsaleOptions, setEndsaleOptions] = useState(false); // Renamed
    const [showGeneralSettings, setShowGeneralSettings] = useState(false); // Renamed
    const [showThemeAnimationDimensions, setShowThemeAnimationDimensions] =
      useState(false);
    const [messageDesktopFontSettings, setMessageDesktopFontSettings] =
      useState({
        // Renamed
        fontSize: "18px",
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

    const timerThemeOptions = [
      "Classic",
      "Hexagon Timer",
      "Progress Bar",
      "Cards",
      "Moderns",
      "Progress Circles",
      "Minimalist",
    ];

    const initialTimerStylingSettings = {
      startDate: "",
      endDate: "",
      title: "Sale Ending in",

      theme: "Classic",
      alignment: "Center",

      colors: {
        title: "#808080",
        digits: "#808080",
        border: "#808080",
        background: "#808080",
        gradientStart: "#ff0000",
        gradientEnd: "#0000ff",
      },

      margin: {
        top: { value: 0, unit: "px" },
        bottom: { value: 0, unit: "rem" },
      },
    };

    const [showTimer, setShowTimer] = useState(true);
    const [showStyle, setShowstyle] = useState(false);
    const [showSettings, setShowsettings] = useState(false);
    const [showTimerOptions, setShowTimerOptions] = useState(false);
    const [timerStylingSettings, setTimerStylingSettings] = useState(
      initialTimerStylingSettings
    );
    const [timeRemaining, setTimeRemaining] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    const [timerDesktopFontSettings, setTimerDesktopFontSettings] = useState({
      fontSize: "16px",
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

    const [timerMargin, setTimerMargin] = useState({
      bottom: { value: 0, unit: "rem" },
      top: { value: 0, unit: "px" },
    });

    const [timerIntervalId, setTimerIntervalId] = useState(null); // To store the interval ID for cleanup
    const [showBundleAction, setShowBundleAction] = useState(false);
    const [checkboxes, setCheckboxes] = useState([false, false, false, false]);
    const [toggles, setToggles] = useState([true, true, true, true]);
    const [announcementBars, setAnnouncementBars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // You can make this configurable
    const [totalItems, setTotalItems] = useState(0);
    const [selectedOption, setSelectedOption] = useState("Text");
    const [progressMessage, setProgressMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [totalOrderCount, setTotalOrderCount] = useState("");
    const [targetAmount, setTargetAmount] = useState("2");
    
    // Email bar settings
    const [emailSettings, setEmailSettings] = useState({
      templateId: "",
      templateName: "",
      listId: "",
      listName: "",
      emailSuccessMessage: "Thank you for subscribing!",
      buttonText: "Subscribe",
      placeholderText: "Enter your email",
      inputStyles: {
        backgroundColor: "#ffffff",
        borderColor: "#cccccc",
        borderRadius: "4px",
        fontColor: "#000000",
        fontSize: "14px",
        padding: "10px 15px",
      },
      buttonStyles: {
        backgroundColor: "#000000",
        fontColor: "#ffffff",
        borderRadius: "4px",
        fontSize: "14px",
        padding: "10px 20px",
        hoverBackgroundColor: "#333333",
      },
    });
    // Email provider connection state
    const [isEmailProviderConnected, setIsEmailProviderConnected] = useState(false);
    const [isCheckingEmailProvider, setIsCheckingEmailProvider] = useState(true);

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
    const [animateMessage, setAnimateMessage] = useState(false);
    const [scrollCount, setScrollCount] = useState(8);

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

    // Effect to check if email provider is connected
    useEffect(() => {
      const checkEmailProvider = async () => {
        try {
          setIsCheckingEmailProvider(true);
          const response = await fetch('/api/email-provider');
          const data = await response.json();
          if (data.success && data.data && data.data.isConnected) {
            setIsEmailProviderConnected(true);
          } else {
            setIsEmailProviderConnected(false);
          }
        } catch (err) {
          console.error("Error checking email provider:", err);
          setIsEmailProviderConnected(false);
        } finally {
          setIsCheckingEmailProvider(false);
        }
      };
      checkEmailProvider();
    }, []);

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
    }, [showCountdown, targetDate, targetTime]);
    // Add useEffect to populate form when editingBar changes
    useEffect(() => {
      if (editingBar) {
        console.log("Editing Bar Data:", editingBar.type);
        if (editingBar.type) {
          setSelectedOption(editingBar.type);
        }
        setName(editingBar.name || "");
        setStatus(editingBar.status || "active");
        setMessage(editingBar.message || "");
        setBarPosition(editingBar.barPosition || "top");
        setBarWidth(editingBar.barWidth || 100);
        setBarHeight(editingBar.barHeight || 180);
        setCustomCSS(editingBar.customCSS || "");
        setIsCustomCSSEnabled(editingBar.isCustomCSSEnabled || false);

        // Theme and appearance
        setSelectedTheme(editingBar.selectedTheme || "solid");
        setUploadedImage(editingBar.uploadedImage || null);
        setShowWaveOptions(editingBar.showWaveOptions || false);

        // Message settings
        setShowMessage(editingBar.showMessage !== false);
        setAnimateMessage(editingBar.animateMessage || false);
        setMessageAnimationSpeed(editingBar.messageAnimationSpeed || 20);
        setScrollCount(editingBar.scrollCount || 8);
        setShowMessageOptions(editingBar.showMessageOptions || false);

        // Color settings
        setGeneralColorSettings(
          editingBar.generalColorSettings || {
            "Background Color": "#007bff",
            "Message Font Color": "#ffffff",
          }
        );

        setColorSettings(
          editingBar.colorSettings || {
            "Background Color": "#a18c8c",
          }
        );

        // Font settings
        setMessageDesktopFontSettings(
          editingBar.messageDesktopFontSettings || {
            fontSize: "18px",
            fontFamily: "Inter",
            fontWeight: "600",
            letterSpacing: "0px",
            lineHeight: "1.2",
          }
        );

        // Timer settings
        setShowTimer(editingBar.showTimer !== false);
        setShowCountdown(editingBar.showCountdown || false);
        setShowTimerOptions(editingBar.showTimerOptions || false);
        setTargetDate(editingBar.targetDate || "");
        setTargetTime(editingBar.targetTime || "");
        setCountdown(
          editingBar.countdown || {
            days: "00",
            hours: "00",
            minutes: "00",
            seconds: "00",
          }
        );

        setTimerColorSettings(
          editingBar.timerColorSettings || {
            "Timer Numbers Font Color": "#ffffff",
            "Timer Labels Font Color": "#ffffff",
            "Timer Separator Color": "#ffffff",
            "Timer Block Background Color": "transparent",
            "Timer Block Border Color": "transparent",
          }
        );

        setTimerStylingSettings(
          editingBar.timerStylingSettings || {
            startDate: "",
            endDate: "",
            title: "Sale Ending in",
            theme: "Classic",
            alignment: "Center",
            colors: {
              title: "#808080",
              digits: "#808080",
              border: "#808080",
              background: "#808080",
              gradientStart: "#ff0000",
              gradientEnd: "#0000ff",
            },
            margin: {
              top: { value: 0, unit: "px" },
              bottom: { value: 0, unit: "rem" },
            },
          }
        );

        setTimerDesktopFontSettings(
          editingBar.timerDesktopFontSettings || {
            fontSize: "16px",
            fontFamily: "Inter",
            fontWeight: "700",
            letterSpacing: "0px",
            lineHeight: "1.2",
          }
        );

        setTimerLabelSettings(
          editingBar.timerLabelSettings || {
            showDaysLabel: true,
            showHoursLabel: true,
            showMinutesLabel: true,
            showSecondsLabel: true,
            fontSize: "10px",
            fontFamily: "Inter",
            fontWeight: "400",
            fontCase: "uppercase",
          }
        );

        setTimerBlockSettings(
          editingBar.timerBlockSettings || {
            showSeparators: true,
            roundedCorners: "4px",
            spacing: "10px",
          }
        );

        setShowTimerBlockBackground(
          editingBar.showTimerBlockBackground || false
        );
        setShowTimerBlockBorder(editingBar.showTimerBlockBorder || false);
        setTimerMargin(
          editingBar.timerMargin || {
            bottom: { value: 0, unit: "rem" },
            top: { value: 0, unit: "px" },
          }
        );

        // End Sale Message settings
        setEndSaleMessage(editingBar.endSaleMessage || "End Sale in");
        setShowEndSaleMessage(editingBar.showEndSaleMessage || false);
        setEndSaleMessageSettings(
          editingBar.endSaleMessageSettings || {
            backgroundColor: "#FF0000",
            fontColor: "#FFFFFF",
            fontSize: "16px",
            fontFamily: "Inter",
            fontWeight: "700",
          }
        );

        // Shop Now Button settings
        setShowShopNowButton(editingBar.showShopNowButton || false);
        setShopNowButtonText(editingBar.shopNowButtonText || "Shop Now");
        setAnimateShopNowButton(editingBar.animateShopNowButton || false);
        setShopNowButtonSettings(
          editingBar.shopNowButtonSettings || {
            backgroundColor: "#000000",
            fontColor: "#FFFFFF",
            fontSize: "14px",
            fontFamily: "Inter",
            fontWeight: "600",
            padding: "8px 15px",
            borderRadius: "5px",
            borderColor: "#000000",
          }
        );

        // Save Box settings
        setShowSaveBox(editingBar.showSaveBox || false);
        setSaveBoxText(editingBar.saveBoxText || "SAVE 30%");
        setSaveBoxSettings(
          editingBar.saveBoxSettings || {
            backgroundColor: "#FFFF00",
            fontColor: "#000000",
            fontSize: "14px",
            fontFamily: "Inter",
            fontWeight: "700",
            padding: "5px 10px",
            borderRadius: "3px",
            borderColor: "#FFFF00",
          }
        );

        // Progress bar settings
        setProgressMessage(editingBar.progressMessage || "");
        setSuccessMessage(editingBar.successMessage || "");
        setTotalOrderCount(editingBar.totalOrderCount || "");
        setTargetAmount(editingBar.targetAmount || "2");

        // UI state settings
        setShowLabels(editingBar.showLabels !== false);
        setSelectedIndex(editingBar.selectedIndex || 0);
        // setShowStyle(editingBar.showStyle || false);
        // setShowSettings(editingBar.showSettings || false);
        setShowGeneralSettings(editingBar.showGeneralSettings || false);
        setShowThemeAnimationDimensions(
          editingBar.showThemeAnimationDimensions || false
        );
        // setShowsaveOptions(editingBar.showsaveOptions || false);
        // setShowendsaleOptions(editingBar.showendsaleOptions || false);
        setShowBundleAction(editingBar.showBundleAction || false);

        // Checkboxes and toggles
        setCheckboxes(editingBar.checkboxes || [false, false, false, false]);
        setToggles(editingBar.toggles || [true, true, true, true]);

        // Emoji picker
        setShowEmojiPickerMessage(editingBar.showEmojiPickerMessage || false);
      }
    }, [editingBar]);

    useEffect(() => {
      if (showMessage) {
        setAnimateMessage(false);
        setTimeout(() => setAnimateMessage(true), 20); // ✅ Restart animation cleanly
      } else {
        setAnimateMessage(false);
      }
    }, [showMessage]);
    useEffect(() => {
      fetchAnnouncementBars();
    }, []);
    useEffect(() => {
      fetchOrdersCount();
    }, []);
    useEffect(() => {
      if (selectedOption === "Free Shipping") {
        setMessage(`Spend ${targetAmount} and get free shipping`);
      }
    }, [targetAmount]);

    useImperativeHandle(ref, () => ({
      handleSaveChanges: handlePublishBundle,
    }));
    // const renderTimerBlock = (value, label, showDaysLabel) => {
    //   return (
    //     <div className="timer-block">
    //       <span className="timer-value">{value}</span>
    //       {showDaysLabel && <span className="timer-label">{label}</span>}
    //     </div>
    //   );
    // };

    const renderTimerBlock = () => {
      const { theme, colors, title } = timerStylingSettings;
      const { days, hours, minutes, seconds } = timeRemaining;
      const timerData = [
        { duration: "days", value: days },
        { duration: "hours", value: hours },
        { duration: "minutes", value: minutes },
        { duration: "seconds", value: seconds },
      ];
      if (theme === "Classic") {
        return (
          <div className="timer-block">
            <span style={{ color: colors.title }}>{title} </span>
            {timerData.map((part, index) => (
              <span key={index} style={{ color: colors.digits }}>
                {String(part.value).padStart(1, "0")}
                {part.duration} {part.duration !== "seconds" && ":"}{" "}
              </span>
            ))}
          </div>
        );
      } else if (["Hexagon Timer", "Progress Circles"].includes(theme)) {
        return (
          <div className="countdown-container">
            <div
              style={{
                color: colors.title,
                fontSize: "15px",
              }}
            >
              {title}
            </div>
            <div className="hexagon-countdown">
              {timerData.map((part, index) => (
                <div key={index} style={{ color: colors.digits }}>
                  <div
                    className={
                      theme === "Hexagon Timer" ? "hexagon" : "progress-circle"
                    }
                    style={{
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <span>{String(part.value).padStart(1, "0")}</span>
                  </div>
                  <span style={{ fontSize: "15px" }}>{part.duration}</span>
                </div>
              ))}
            </div>
          </div>
        );
      } else if (theme === "Progress Bar") {
        const initialDuration = {
          days: 0,
          hours: 23,
          minutes: 56,
          seconds: 10,
        };
        const totalDurationSeconds =
          initialDuration.days * 86400 +
          initialDuration.hours * 3600 +
          initialDuration.minutes * 60 +
          initialDuration.seconds;
        const totalRemainingSeconds =
          days * 86400 + hours * 3600 + minutes * 60 + seconds;
        const progressPercentage = (
          ((totalDurationSeconds - totalRemainingSeconds) /
            totalDurationSeconds) *
          100
        ).toFixed(2);
        return (
          <div className="countdown-container">
            <div
              style={{
                color: colors.title,
                fontSize: "15px",
              }}
            >
              {title}
            </div>
            <div
              className="simple-countdown"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                fontSize: "18px",
                color: "#555555",
              }}
            >
              <div
                style={{
                  width: "100%",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "15px",
                    backgroundColor: "#D3D3D3",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: `${progressPercentage}%`,
                      height: "100%",
                      backgroundColor: colors.background,
                      borderRadius: "5px 0 0 5px",
                    }}
                  ></span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  fontWeight: "bold",
                }}
              >
                {timerData.map((part, index) => (
                  <span key={index} style={{ color: colors.digits }}>
                    {String(part.value).padStart(1, "0")}
                    {part.duration} {part.duration !== "seconds" && ":"}{" "}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      } else if (theme === "Cards") {
        return (
          <div className="countdown-container">
            <div
              style={{
                color: colors.title,
                fontSize: "15px",
              }}
            >
              {title}
            </div>
            <div className="hexagon-countdown">
              {timerData.map((part, index) => (
                <div
                  key={index}
                  className={"cards-timer-container"}
                  style={{
                    color: colors.digits,
                    width: "70px",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className={"card-digit-box"}
                    style={{
                      backgroundColor: colors.background,
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "5px 0",
                      borderRadius: "8px 8px 0 0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "36px",
                        fontWeight: "bold",
                        color: colors.digits,
                      }}
                    >
                      {String(part.value).padStart(1, "0")}
                    </span>
                  </div>
                  <div
                    className={"card-label-box"}
                    style={{
                      backgroundColor: colors.background,
                      height: "25px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "2px 0",
                      borderRadius: "0 0 8px 8px",
                      borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: colors.digits,
                      }}
                    >
                      {part.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      } else if (theme === "Moderns") {
        return (
          <div className="countdown-container">
            <div
              style={{
                color: colors.title,
                fontSize: "15px",
              }}
            >
              {title}
            </div>
            <div
              className="gradient-timer-wrapper"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              {timerData.map((part, index) => (
                <React.Fragment key={index}>
                  <div
                    className={"time-segment-box"}
                    style={{
                      width: "35px",
                      height: "35px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `linear-gradient(to bottom, ${colors.gradientStart}, ${colors.gradientEnd})`,
                      borderRadius: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        color: colors.digits || "#555555",
                      }}
                    >
                      {String(part.value).padStart(2, "0")}
                    </span>
                  </div>

                  {index < timerData.length - 1 && (
                    <span
                      className="separator"
                      style={{
                        fontSize: "25px",
                        fontWeight: "bold",
                        color: colors.digits || "#555555",
                        margin: "0 5px",
                      }}
                    >
                      :
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      } else if (theme === "Minimalist") {
        return (
          <div className="countdown-container">
            <div
              style={{
                color: colors.title,
                fontSize: "15px",
              }}
            >
              {title}
            </div>
            <div className="hexagon-countdown">
              {timerData.map((part, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginTop: "10px",
                    color: colors.digits,
                    borderRight:
                      part.duration !== "seconds" &&
                      `1px solid ${colors.border}`,
                    paddingRight: part.duration !== "seconds" && "10px",
                  }}
                >
                  <span style={{ fontSize: "40px", fontWeight: "bold" }}>
                    {String(part.value).padStart(1, "0")}
                  </span>
                  <span style={{ fontSize: "15px" }}>{part.duration}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
    };

    const [timeLeft, setTimeLeft] = useState("");

    // Countdown Timer Logic
    useEffect(() => {
      if (!targetDate) return;

      const interval = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(targetDate).getTime();
        const distance = endTime - now;

        if (distance <= 0) {
          clearInterval(interval);
          setTimeLeft("Sale Ended!");
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(interval);
    }, [targetDate]);
    useEffect(() => {
      if (showMessage) {
        setAnimateMessage(false);
        setTimeout(() => setAnimateMessage(true), 5); // ✅ Restart animation cleanly
      } else {
        setAnimateMessage(false);
      }
    }, [showMessage]);
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
        return selectedThemeOption
          ? `url(${selectedThemeOption.image})`
          : "none";
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
      const colorMatches = gradientString?.match(/#[0-9a-fA-F]{6}/g);
      if (colorMatches && colorMatches.length >= 2) {
        return {
          startColor: getBackgroundStyle(), // #667eea
          endColor: getBackgroundStyle(), // #764ba2
        };
      }
      // Fallback colors
      return {
        startColor: getBackgroundStyle(),
        endColor: getBackgroundStyle(),
      };
    };

    const waveColors = extractGradientColors();
    const handlePublishBundle = async () => {
      if (selectedIndex === tabs.length - 1) {
        // Prepare all the data to send
        const bundleData = {
          name,
          status,
          message,
          barPosition,
          barWidth,
          barHeight,
          customCSS,
          isCustomCSSEnabled,
          type: selectedOption,
          progressMessage,
          successMessage,
          totalOrderCount,
          selectedTheme,
          uploadedImage,
          showWaveOptions,
          showMessage,
          animateMessage,
          messageAnimationSpeed,
          generalColorSettings,
          messageDesktopFontSettings,
          showTimer,
          showCountdown,
          targetDate,
          targetTime,
          countdown,
          timerColorSettings,
          timerStylingSettings,
          timerDesktopFontSettings,
          timerLabelSettings,
          timerBlockSettings,
          showTimerBlockBackground,
          showTimerBlockBorder,
          // End Sale Message
          endSaleMessage,
          showEndSaleMessage,
          endSaleMessageSettings,
          // Shop Now Button
          showShopNowButton,
          shopNowButtonText,
          animateShopNowButton,
          shopNowButtonSettings,
          // Save Box
          showSaveBox,
          saveBoxText,
          saveBoxSettings,
          // Other settings
          showMessageOptions,
          showsaveOptions,
          showendsaleOptions,
          showTimerOptions,
          showEmojiPickerMessage,
          selectedIndex,
          timeRemaining,
          // Email Settings
          emailSettings,
        };

        // ✅ Frontend validation
        const requiredErrors = [];
        if (!bundleData.name || bundleData.name.trim() === "") {
          requiredErrors.push("Name is required");
        }
        if (!bundleData.status || bundleData.status.trim() === "") {
          requiredErrors.push("Status is required");
        }
        if (!bundleData.message || bundleData.message.trim() === "") {
          requiredErrors.push("Message is required");
        }
        if (!bundleData.type || bundleData.type.trim() === "") {
          requiredErrors.push("Type is required");
        }

        if (requiredErrors.length > 0) {
          shopify.toast.show(requiredErrors.join(", "), {
            duration: 5000,
          });
          return; // stop before calling backend
        }

        try {
          const url = editingBar
            ? `/api/announcement-bars/${editingBar._id}`
            : "/api/announcement-bars";

          const method = editingBar ? "PUT" : "POST";

          const response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bundleData),
          });
          const result = await response.json();
          if (!result.success) {
            let message = ``;
            if (result.errors) {
              message = result.errors.map((error) => error).join(", ");
            }
            shopify.toast.show(message, {
              duration: 5000,
            });
            return;
          }
          shopify.toast.show(result?.message, {
            duration: 5000,
          });
          // Reset the form or redirect as needed
          onMakeBundleClick(); // Call the parent function to reset or redirect
          if (onSuccess) {
            onSuccess(); // This will set showAction to false and return to DiscountList
          }
        } catch (error) {
          console.error("Error publishing bundle:", error);
          // Handle the error appropriately (show error message to user)
          shopify.toast.show(error, {
            duration: 5000,
          });
          return;
        }
      } else {
        handleNext();
      }
    };

    const fetchAnnouncementBars = async (page = 1) => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/announcement-bars?page=${page}&limit=${itemsPerPage}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch announcement bars");
        }
        const data = await response.json();
        setAnnouncementBars(data?.data?.announcementBars || []);
        setTotalItems(data?.data?.pagination?.total || 0);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchOrdersCount = async () => {
      try {
        setLoading(true);
        if (selectedOption === "Orders Counter") {
          const response = await fetch(`/api/products/fetchOrdersCount`);
          if (!response.ok) {
            throw new Error("Failed to fetch announcement bars");
          }
          const data = await response.json();
          setTotalOrderCount(data?.data || 0);
          setMessage(`This store has received ${data?.data} orders!`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
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
    const handleDropdownChange = (e) => {
      const value = e.target.value;
      setSelectedOption(value);
      if (value === "Free Shipping") {
        setMessage(`Spend ${targetAmount} and get free shipping`);
      } else if (value === "Orders Counter") {
        setMessage(`This store has received ${totalOrderCount} orders!`);
      } else {
        setMessage("Text is ticking");
      }
      handlePublishBundle();
    };
    if (showBundleAction) {
      return <AnnouncementBarActions />;
    }

    useEffect(() => {
      const updateCountdown = () => {
        let targetDate = null;
        let now = new Date();

        // both start and end date are provided
        if (timerStylingSettings?.startDate && timerStylingSettings?.endDate) {
          targetDate = new Date(timerStylingSettings?.endDate);
          now = new Date(timerStylingSettings?.startDate);
        }
        // only start date is provided
        else if (timerStylingSettings?.startDate) {
          targetDate = new Date(timerStylingSettings?.startDate);
          now = new Date();
        }
        // only end date is provided
        else if (timerStylingSettings?.endDate) {
          targetDate = new Date(timerStylingSettings?.endDate);
          now = new Date();
        } else {
          // Default case when neither date is provided
          targetDate = new Date();
        }

        const difference = targetDate - now;

        if (difference <= 0) {
          setTimeRemaining({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          });
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({
          days,
          hours,
          minutes,
          seconds,
        });
      };

      const interval = setInterval(updateCountdown, 1000);

      updateCountdown();

      return () => clearInterval(interval);
    }, [timerStylingSettings?.startDate, timerStylingSettings?.endDate]);

    return (
      <Container
        fluid
        className=""
        style={{ maxWidth: "auto", margin: "0 auto", height: "auto" }}
      >
        {/* Step Navigation */}
        <Row
          className="justify-content-center mb-2"
          style={{
            padding: "4px",
            boxShadow: "1px 1px 4px 0px #0000001A inset",
            backgroundColor: "#fff",
            borderRadius: "16px", // <— unified radius for container
          }}
        >
          <Col xs="" className="p-1">
            <ButtonGroup className="d-flex justify-content-center align-items-center">
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
                    style={{
                      borderRadius: "12px", // <— one radius for all steps
                      padding: "12px 18px",
                      backgroundColor:
                        selectedIndex === idx || idx < selectedIndex
                          ? "#000"
                          : "#F1F2F4",
                      color:
                        selectedIndex === idx || idx < selectedIndex
                          ? "#fff"
                          : "#222",
                      borderColor: "#000",
                      margin: 0,
                      boxShadow:
                        selectedIndex === idx || idx < selectedIndex
                          ? "none"
                          : "1px 1px 4px 0px #0000001A inset",
                    }}
                    className="d-flex align-items-center px-3"
                  >
                    <span>{String(idx + 1).padStart(2, "0")}</span>
                    <div
                      style={{
                        width: "1.5px",
                        height: "10px",
                        background:
                          selectedIndex === idx || idx < selectedIndex
                            ? "#fff"
                            : "#222",
                        opacity:
                          selectedIndex === idx || idx < selectedIndex
                            ? 0.2
                            : 0.1,
                        margin: "0 8px",
                      }}
                    />
                    <span>{tab}</span>
                  </ToggleButton>

                  {idx < tabs.length - 1 && (
                    <span
                      className="mx-2 d-flex align-items-center justify-content-center"
                      style={
                        idx < selectedIndex
                          ? {
                              width: "9px",
                              height: "9px",
                              borderRadius: "50%",
                              backgroundColor: "#222",
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
                // boxShadow: "1px 1px 4px 0px #0000001A inset",
                backgroundColor: "#fff",
                borderRadius: "20px",
                height: "fit-content",
              }}
            >
              {selectedIndex === 0 && (
                <Card className="border-0">
                  <div className="d-flex flex-column gap-3">
                    {/* Create New Announcement Bar Button */}
                    <Row className="g-0 linrrow">
                      <Card
                        className="border-0 "
                        // style={{ backgroundColor: "#F1F2F4", padding: "20px" }}
                      >
                        <Card.Body className="d-flex align-items-center justify-content-center">
                          <div className="d-flex align-items-center gap-3">
                            <div className="announcementbox">
                              <div className="bundletxxtb1">
                                <span className="bundletext">
                                  {announcementBars.length > 0
                                    ? "Create New Announcement Bar"
                                    : "Create your first Announcement Bar"}
                                </span>
                              </div>
                              <p
                                className="buymorebtn"
                                style={{ maxWidth: "400px" }}
                              >
                                Display an interactive Free Shipping message,
                                capture leads, or build trust using any of the 5
                                types of Announcement Bars.
                              </p>
                              <div style={{ width: "80%" }}>
                                <div className="position-relative">
                                  <Form.Select
                                    className="discountdropdownselect custom-dropdown"
                                    style={{
                                      backgroundColor: "#000",
                                      padding: "20px",
                                    }}
                                    onChange={handleDropdownChange}
                                    value={selectedOption}
                                  >
                                    {/* <option value="">Create</option> */}
                                    <option value="Text">Text</option>
                                    <option value="Countdown Timer">
                                      Countdown Timer
                                    </option>
                                    <option value="Free Shipping">
                                      Free Shipping
                                    </option>
                                    <option value="Orders Counter">
                                      Orders Counter
                                    </option>
                                    <option 
                                      value="Email"
                                      disabled={!isEmailProviderConnected}
                                    >
                                      Email Subscription {!isEmailProviderConnected && "(Not Available)"}
                                    </option>
                                  </Form.Select>
                                  <span className="dropdown-icon">
                                    <img src={dropdown} alt="dropdown icon" />
                                  </span>
                                </div>
                                
                                {/* Email Provider Not Connected Warning */}
                                {!isEmailProviderConnected && !isCheckingEmailProvider && (
                                  <div
                                    style={{
                                      marginTop: "12px",
                                      padding: "12px 15px",
                                      backgroundColor: "rgba(255, 193, 7, 0.1)",
                                      border: "1px solid #ffc107",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    <p
                                      style={{
                                        margin: 0,
                                        fontFamily: "Inter",
                                        fontWeight: 600,
                                        fontSize: "13px",
                                        color: "#856404",
                                      }}
                                    >
                                      ⚠️ Email Provider Not Connected
                                    </p>
                                    <p
                                      style={{
                                        margin: "5px 0 0 0",
                                        fontFamily: "Inter",
                                        fontWeight: 400,
                                        fontSize: "12px",
                                        color: "#856404",
                                      }}
                                    >
                                      To use the Email announcement bar type, please connect an email provider in the Settings tab first.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Row>
                  </div>
                </Card>
              )}
              {/* Select Products Step */}
              {selectedIndex === 1 && (
                <Card className="border-0">
                  <CardBody>
                    {/* Bundle Status Section */}
                    <Form
                      className="mt-3 p-3"
                      style={{ background: "#F1F2F4", borderRadius: "10px" }}
                    >
                      <div className="d-flex justify-content-between linewhite mb-2">
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
                        >
                          Internal Settings
                        </h2>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3 linewhite">
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
                            Announcement Bar Status
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
                            Only one announcement bar will be displayed at the
                            time
                          </p>
                        </div>

                        <Form.Check
                          type="switch"
                          id={`bundle-toggle`}
                          checked={status}
                          onChange={() => setStatus(!status)}
                          className="custom-switch-toggle"
                        />
                      </div>
                      <Form.Group>
                        <Form.Label className="inputtitle">Name</Form.Label>
                        <Form.Control
                          className="inputbox"
                          type="text"
                          placeholder="Enter title"
                          value={name} // controlled input
                          onChange={(e) => setName(e.target.value)} // update state
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
                    </Form>
                    <Form
                      className="mt-3 p-3"
                      style={{ background: "#F1F2F4", borderRadius: "10px" }}
                    >
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
                          onClick={() => {
                            setShowGeneralSettings(!showGeneralSettings);
                            if (selectedOption === "Free Shipping") {
                              setMessage(
                                `Spend ${targetAmount} and get free shipping`
                              );
                            } else if (selectedOption === "Orders Counter") {
                              setMessage(
                                `This store has received ${totalOrderCount} orders!`
                              );
                            } else {
                              setMessage("Text is ticking");
                            }
                            setColorSettings({
                              "Background Color": "#a18c8c",
                            });
                            setProgressMessage("");
                            setSuccessMessage("");
                            setMessageDesktopFontSettings({
                              fontSize: "18px",
                              fontFamily: "Inter",
                              fontWeight: "600",
                              letterSpacing: "0px",
                              lineHeight: "1.2",
                            });
                            setTargetAmount("2");
                            setTotalOrderCount("");
                          }}
                        >
                          General Settings
                        </h2>
                        <Form.Check
                          type="switch"
                          id="generalSettingsSwitch"
                          checked={showGeneralSettings}
                          onChange={(e) => {
                            setShowGeneralSettings(e.target.checked);
                            if (selectedOption === "Free Shipping") {
                              setMessage(
                                `Spend ${targetAmount} and get free shipping`
                              );
                            } else if (selectedOption === "Orders Counter") {
                              setMessage(
                                `This store has received ${totalOrderCount} orders!`
                              );
                            } else {
                              setMessage("Text is ticking");
                            }
                            setColorSettings({
                              "Background Color": "#a18c8c",
                            });
                            setProgressMessage("");
                            setSuccessMessage("");
                            setMessageDesktopFontSettings({
                              fontSize: "18px",
                              fontFamily: "Inter",
                              fontWeight: "600",
                              letterSpacing: "0px",
                              lineHeight: "1.2",
                            });
                            setTargetAmount("2");
                            setTotalOrderCount("");
                          }}
                        />
                      </div>

                      <div className="d-flex flex-column">
                        {showGeneralSettings && (
                          <div className="d-flex flex-column gap-4">
                            <div className="d-flex flex-column gap-2 py-3">
                              {selectedOption === "Free Shipping" ? (
                                <>
                                  {/* Initial Message */}
                                  <Form.Group className="mb-3">
                                    <Form.Label className="inputtitle">
                                      Initial Message
                                    </Form.Label>
                                    <div style={{ position: "relative" }}>
                                      <InputGroup className="position-relative">
                                        <Form.Control
                                          className="inputbox pe-7"
                                          type="text"
                                          placeholder={`Spend ${targetAmount} and get free shipping`}
                                          style={{ background: "white" }}
                                          value={message}
                                          onChange={(e) =>
                                            setMessage(e.target.value)
                                          }
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
                                              setShowMessage((prev) => !prev)
                                            }
                                            style={{
                                              cursor: "pointer",
                                              color: "#6c757d",
                                              fontSize: "1.2rem",
                                            }}
                                          >
                                            {showMessage ? (
                                              <EyeFill />
                                            ) : (
                                              <EyeSlashFill />
                                            )}
                                          </span>
                                        </div>
                                      </InputGroup>
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
                                        To render the price use #amount# in
                                        message
                                      </p>
                                    </div>
                                  </Form.Group>

                                  {/* Progress Message */}
                                  <Form.Group className="mb-3">
                                    <Form.Label className="inputtitle">
                                      Progress Message
                                    </Form.Label>
                                    <div style={{ position: "relative" }}>
                                      <InputGroup className="position-relative">
                                        <Form.Control
                                          className="inputbox pe-7"
                                          type="text"
                                          placeholder={`You only need to spend ${totalOrderCount} more to get free shipping`}
                                          style={{ background: "white" }}
                                          value={progressMessage}
                                          onChange={(e) =>
                                            setProgressMessage(e.target.value)
                                          }
                                        />
                                      </InputGroup>
                                    </div>
                                  </Form.Group>
                                  {/* Success  Message */}
                                  <Form.Group className="mb-3">
                                    <Form.Label className="inputtitle">
                                      Success Message
                                    </Form.Label>
                                    <div style={{ position: "relative" }}>
                                      <InputGroup className="position-relative">
                                        <Form.Control
                                          className="inputbox pe-7"
                                          type="text"
                                          placeholder="Congrats! you now have free shipping"
                                          style={{ background: "white" }}
                                          value={successMessage}
                                          onChange={(e) =>
                                            setSuccessMessage(e.target.value)
                                          }
                                        />
                                      </InputGroup>
                                    </div>
                                  </Form.Group>
                                </>
                              ) : (
                                // Default Message Text for other options
                                <Form.Group className="mb-3">
                                  <Form.Label className="inputtitle">
                                    Message Text
                                  </Form.Label>
                                  <div>
                                    <InputGroup>
                                      <Form.Control
                                        className="inputbox"
                                        type="text"
                                        placeholder="Enter message"
                                        style={{ background: "white" }}
                                        value={message}
                                        onChange={(e) =>
                                          setMessage(e.target.value)
                                        }
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
                                            setShowMessage((prev) => !prev)
                                          }
                                          style={{
                                            cursor: "pointer",
                                            color: "#6c757d",
                                            fontSize: "1.2rem",
                                          }}
                                        >
                                          <Form.Check
                                            type="switch"
                                            id="animateMessageSwitch"
                                            checked={showMessage}
                                            onChange={(e) =>
                                              setShowMessage(e.target.checked)
                                            }
                                            style={{
                                              width: "6px",
                                            }}
                                          />
                                        </span>
                                      </div>
                                    </InputGroup>
                                    {selectedOption === "Orders Counter" && (
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
                                        Show the real orders count value using
                                        the #orders_count# variable. Shopify
                                        doesn't allow fake information.
                                      </p>
                                    )}

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
                              )}

                              {/* Message Styling Options Content - Now always visible */}
                              <div className="py-3">
                                <Form.Group className="colorbox mb-3">
                                  <Form.Label>Font Color</Form.Label>
                                  <div className="colorinputbox">
                                    <input
                                      type="color"
                                      value={
                                        generalColorSettings[
                                          "Message Font Color"
                                        ]
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
                                        generalColorSettings[
                                          "Message Font Color"
                                        ]
                                      }
                                      readOnly
                                      style={{ background: "white" }}
                                    />
                                  </div>
                                </Form.Group>

                                {/* Desktop Message Styling - Removed "Message Styles" header */}
                                <div className="d-flex flex-wrap gap-3">
                                  <Form.Group className="flex-grow-1">
                                    <Form.Label>Font Size</Form.Label>
                                    <Form.Control
                                      as="select"
                                      className="inputbox"
                                      value={
                                        messageDesktopFontSettings.fontSize
                                      }
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
                                      value={
                                        messageDesktopFontSettings.fontFamily
                                      }
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
                                        <option
                                          key={`dmsg-ff-${i}`}
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
                                      value={
                                        messageDesktopFontSettings.fontWeight
                                      }
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
                                        <option
                                          key={`dmsg-fw-${i}`}
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
                              </div>

                              {selectedOption === "Free Shipping" && (
                                <Form.Group className="mb-3 mt-3">
                                  <h2
                                    style={{
                                      fontFamily: "Inter",
                                      fontStyle: "normal",
                                      fontWeight: "600",
                                      fontSize: "15px",
                                      lineHeight: "100%",
                                      color: "#303030",
                                    }}
                                    className="mb-3"
                                  >
                                    Target Amount
                                  </h2>
                                  <InputGroup className="position-relative">
                                    <Form.Control
                                      className="inputbox pe-7"
                                      type="number"
                                      placeholder="Enter free shipping target amount"
                                      style={{ background: "white" }}
                                      value={targetAmount}
                                      onChange={(e) =>
                                        setTargetAmount(e.target.value)
                                      }
                                    />
                                  </InputGroup>
                                </Form.Group>
                              )}
                              {selectedOption === "Orders Counter" && (
                                <Form.Group className="mb-3 mt-3">
                                  <h2
                                    style={{
                                      fontFamily: "Inter",
                                      fontStyle: "normal",
                                      fontWeight: "600",
                                      fontSize: "15px",
                                      lineHeight: "100%",
                                      color: "#303030",
                                    }}
                                    className="mb-3"
                                  >
                                    Your Total Order Count
                                  </h2>
                                  <InputGroup className="position-relative">
                                    <Form.Control
                                      className="inputbox pe-7"
                                      type="number"
                                      placeholder="Enter total order count"
                                      style={{ background: "grey" }}
                                      value={totalOrderCount}
                                      onChange={(e) =>
                                        setTotalOrderCount(e.target.value)
                                      }
                                      disabled={true}
                                    />
                                  </InputGroup>
                                </Form.Group>
                              )}
                              
                              {/* Email Bar Settings Section */}
                              {selectedOption === "Email" && (
                                <div className="mt-3">
                                  <EmailBarSettings
                                    emailSettings={emailSettings}
                                    onEmailSettingsChange={setEmailSettings}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Form>

                    {/* New Theme Animation & Dimensions Section */}
                    <Form
                      className="mt-3 p-3"
                      style={{ background: "#F1F2F4", borderRadius: "10px" }}
                    >
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
                          onClick={() => {
                            setShowThemeAnimationDimensions(
                              !showThemeAnimationDimensions
                            );
                            setAnimateMessage(false);
                            setMessageAnimationSpeed(20);
                            setShowWaveOptions(false);
                            setBarWidth(100);
                            setBarHeight(180);
                          }}
                        >
                          Theme Animation & Dimensions
                        </h2>
                        <Form.Check
                          type="switch"
                          id="themeAnimationDimensionsSwitch"
                          checked={showThemeAnimationDimensions}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setShowThemeAnimationDimensions(isChecked);
                            // When enabling Theme Animation & Dimensions, also enable Scroll Message
                            if (isChecked) {
                              setAnimateMessage(true);
                            }
                            if (!isChecked) {
                              setAnimateMessage(false);
                            }

                            setAnimateMessage(false);
                            setMessageAnimationSpeed(20);
                            setShowWaveOptions(false);
                            setBarWidth(100);
                            setBarHeight(180);
                          }}
                        />
                      </div>

                      <div className="d-flex flex-column">
                        {showThemeAnimationDimensions && (
                          <div className="d-flex flex-column gap-4">
                            <div className="d-flex flex-column gap-2 py-3">
                              {/* Scroll Message Toggle */}
                              <Form.Group className="d-flex justify-content-between linewhite mt-2 mb-2">
                                <Form.Label>Scroll Message</Form.Label>
                                <Form.Check
                                  type="switch"
                                  id="scrollMessageSwitch"
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
                              {/* Add Wave Toggle */}
                              <div
                                className="d-flex justify-content-between linewhite mt-2"
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
                                  Add Wave
                                </h2>
                                <Form.Check
                                  type="switch"
                                  id="waveOptionsSwitch"
                                  checked={showWaveOptions}
                                  onChange={(e) =>
                                    setShowWaveOptions(e.target.checked)
                                  }
                                />
                              </div>

                              {/* Bar Dimensions */}
                              <div className="mt-4">
                                <h2
                                  style={{
                                    fontFamily: "Inter",
                                    fontStyle: "normal",
                                    fontWeight: "600",
                                    fontSize: "15px",
                                    lineHeight: "100%",
                                    color: "#303030",
                                  }}
                                  className="mb-3"
                                >
                                  Bar Dimensions
                                </h2>
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
                        )}
                      </div>
                    </Form>
                    {selectedOption !== "Orders Counter" &&
                      selectedOption !== "Text" && (
                        <Form
                          className="mt-3 p-3"
                          style={{
                            background: "#F1F2F4",
                            borderRadius: "10px",
                          }}
                        >
                          <div className="d-flex flex-column gap-2 py-3">
                            <div className="linewhite  d-flex justify-content-between">
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
                                onClick={() => {
                                  setEndsaleOptions(!showendsaleOptions);
                                  setEndSaleMessage("End Sale in");
                                  setTargetDate("");
                                  setEndSaleMessageSettings({
                                    backgroundColor: "#FF0000",
                                    fontColor: "#FFFFFF",
                                    fontSize: "16px",
                                    fontFamily: "Inter",
                                    fontWeight: "700",
                                  });
                                }}
                              >
                                "End Sale" Message Settings
                              </h2>
                              <Form.Check
                                type="switch"
                                id="animateMessageSwitch"
                                checked={showendsaleOptions}
                                onChange={(e) => {
                                  setEndsaleOptions(e.target.checked);
                                  setEndSaleMessage("End Sale in");
                                  setTargetDate("");
                                  setEndSaleMessageSettings({
                                    backgroundColor: "#FF0000",
                                    fontColor: "#FFFFFF",
                                    fontSize: "16px",
                                    fontFamily: "Inter",
                                    fontWeight: "700",
                                  });
                                }}
                              />
                            </div>
                            {showendsaleOptions && (
                              <div className="d-flex flex-wrap gap-3">
                                <Form.Group>
                                  <Form.Label className="inputtitle">
                                    Message Text
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
                                        setShowEndSaleMessage(
                                          !showEndSaleMessage
                                        )
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
                                <Form.Group className="colorbox flex-grow-1">
                                  <Form.Label>Target Date & Time:</Form.Label>
                                  <input
                                    type="datetime-local"
                                    value={targetDate}
                                    onChange={(e) =>
                                      setTargetDate(e.target.value)
                                    }
                                    style={{
                                      padding: "6px",
                                      border: "1px solid #ccc",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                    }}
                                  />
                                </Form.Group>
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
                                      <option
                                        key={`esmsg-ff-${i}`}
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
                        </Form>
                      )}
                    {selectedOption !== "Free Shipping" &&
                      selectedOption !== "Orders Counter" &&
                      selectedOption !== "Text" && (
                        <Form
                          className="mt-3 p-3"
                          style={{
                            background: "#F1F2F4",
                            borderRadius: "10px",
                          }}
                        >
                          {/* --- Timer Section --- */}
                          <div className="d-flex justify-content-between linewhite mt-4">
                            <div
                              className=""
                              onClick={() => {
                                setShowTimerOptions(!showTimerOptions);
                                setTimerStylingSettings(
                                  initialTimerStylingSettings
                                );
                              }}
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
                                Timer Styling Options
                              </h2>
                            </div>

                            <Form.Check
                              type="switch"
                              id="animateMessageSwitch"
                              checked={showTimerOptions}
                              onChange={(e) => {
                                setShowTimerOptions(e.target.checked);
                                setTimerStylingSettings(
                                  initialTimerStylingSettings
                                );
                              }}
                            />
                          </div>
                          <div className="d-flex flex-column">
                            {showTimerOptions && (
                              <div className="py-3">
                                <div className="mt-1">
                                  <div className="d-flex flex-column mb-3">
                                    <label htmlFor="targetDate">
                                      Countdown starts At:
                                    </label>
                                    <input
                                      type="datetime-local"
                                      id="targetDate"
                                      min={new Date()
                                        .toISOString()
                                        .slice(0, 16)}
                                      value={timerStylingSettings.startDate}
                                      onChange={(e) =>
                                        setTimerStylingSettings({
                                          ...timerStylingSettings,
                                          startDate: e.target.value,
                                        })
                                      }
                                      className="form-control"
                                    />
                                  </div>
                                  <div className="d-flex flex-column mb-3">
                                    <label htmlFor="targetDate">
                                      Countdown ends At:
                                    </label>
                                    <input
                                      type="datetime-local"
                                      id="targetDate"
                                      min={timerStylingSettings.startDate}
                                      value={timerStylingSettings.endDate}
                                      onChange={(e) =>
                                        setTimerStylingSettings({
                                          ...timerStylingSettings,
                                          endDate: e.target.value,
                                        })
                                      }
                                      className="form-control"
                                    />
                                  </div>
                                </div>
                                <Form.Group className="flex-grow-1">
                                  <Form.Label>Theme</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerStylingSettings.theme}
                                    onChange={(e) =>
                                      setTimerStylingSettings({
                                        ...timerStylingSettings,
                                        theme: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {timerThemeOptions.map((theme, i) => (
                                      <option key={`theme-${i}`} value={theme}>
                                        {theme}
                                      </option>
                                    ))}
                                  </Form.Control>
                                </Form.Group>
                                <Form.Group className="flex-grow-1 mt-3">
                                  <Form.Label>Timer Alignment</Form.Label>
                                  <Form.Control
                                    as="select"
                                    className="inputbox"
                                    value={timerStylingSettings.alignment}
                                    onChange={(e) =>
                                      setTimerStylingSettings({
                                        ...timerStylingSettings,
                                        alignment: e.target.value,
                                      })
                                    }
                                    style={{
                                      background: "white",
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                    }}
                                  >
                                    {["Left", "Center", "Right"].map(
                                      (theme, i) => (
                                        <option
                                          key={`theme-${i}`}
                                          value={theme}
                                        >
                                          {theme}
                                        </option>
                                      )
                                    )}
                                  </Form.Control>
                                </Form.Group>
                                <div className="d-flex flex-column mt-3 mb-3">
                                  <label htmlFor="targetDate">Title</label>
                                  <input
                                    type="text"
                                    id="targetDate"
                                    value={timerStylingSettings.title}
                                    onChange={(e) =>
                                      setTimerStylingSettings({
                                        ...timerStylingSettings,
                                        title: e.target.value,
                                      })
                                    }
                                    className="form-control"
                                  />
                                </div>
                                <Form.Group className="colorbox mb-3">
                                  <Row>
                                    <Col md={6}>
                                      <Form.Label>Title Color</Form.Label>
                                      <div className="colorinputbox d-flex align-items-center">
                                        <input
                                          type="color"
                                          value={
                                            timerStylingSettings.colors.title
                                          }
                                          onChange={(e) =>
                                            setTimerStylingSettings({
                                              ...timerStylingSettings,
                                              colors: {
                                                ...timerStylingSettings.colors,
                                                title: e.target.value,
                                              },
                                            })
                                          }
                                          className="colorinput"
                                        />
                                        <Form.Control
                                          type="text"
                                          className="inputbox"
                                          value={
                                            timerStylingSettings.colors.title
                                          }
                                          readOnly
                                          style={{ background: "white" }}
                                        />
                                      </div>
                                    </Col>

                                    <Col md={6}>
                                      <Form.Label>Digits Color</Form.Label>
                                      <div className="colorinputbox d-flex align-items-center">
                                        <input
                                          type="color"
                                          value={
                                            timerStylingSettings.colors.digits
                                          }
                                          onChange={(e) =>
                                            setTimerStylingSettings({
                                              ...timerStylingSettings,
                                              colors: {
                                                ...timerStylingSettings.colors,
                                                digits: e.target.value,
                                              },
                                            })
                                          }
                                          className="colorinput"
                                        />
                                        <Form.Control
                                          type="text"
                                          className="inputbox"
                                          value={
                                            timerStylingSettings.colors.digits
                                          }
                                          readOnly
                                          style={{ background: "white" }}
                                        />
                                      </div>
                                    </Col>

                                    {![
                                      "Classic",
                                      "Cards",
                                      "Moderns",
                                      "Progress Bar",
                                    ].includes(timerStylingSettings.theme) && (
                                      <Col md={6} className="mt-3">
                                        <Form.Label>Border Color</Form.Label>
                                        <div className="colorinputbox d-flex align-items-center">
                                          <input
                                            type="color"
                                            value={
                                              timerStylingSettings.colors.border
                                            }
                                            onChange={(e) =>
                                              setTimerStylingSettings({
                                                ...timerStylingSettings,
                                                colors: {
                                                  ...timerStylingSettings.colors,
                                                  border: e.target.value,
                                                },
                                              })
                                            }
                                            className="colorinput"
                                          />
                                          <Form.Control
                                            type="text"
                                            className="inputbox"
                                            value={
                                              timerStylingSettings.colors.border
                                            }
                                            readOnly
                                            style={{ background: "white" }}
                                          />
                                        </div>
                                      </Col>
                                    )}

                                    {![
                                      "Classic",
                                      "Hexagon Timer",
                                      "Moderns",
                                      "Progress Circles",
                                      "Minimalist",
                                    ].includes(timerStylingSettings.theme) && (
                                      <Col md={6} className="mt-3">
                                        <Form.Label>
                                          Background Color
                                        </Form.Label>
                                        <div className="colorinputbox d-flex align-items-center">
                                          <input
                                            type="color"
                                            value={
                                              timerStylingSettings.colors
                                                .background
                                            }
                                            onChange={(e) =>
                                              setTimerStylingSettings({
                                                ...timerStylingSettings,
                                                colors: {
                                                  ...timerStylingSettings.colors,
                                                  background: e.target.value,
                                                },
                                              })
                                            }
                                            className="colorinput"
                                          />
                                          <Form.Control
                                            type="text"
                                            className="inputbox"
                                            value={
                                              timerStylingSettings.colors
                                                .background
                                            }
                                            readOnly
                                            style={{ background: "white" }}
                                          />
                                        </div>
                                      </Col>
                                    )}

                                    {timerStylingSettings.theme ===
                                      "Moderns" && (
                                      <>
                                        <Col md={6} className="mt-3">
                                          <Form.Label>
                                            Gradient Start Color
                                          </Form.Label>
                                          <div className="colorinputbox d-flex align-items-center">
                                            <input
                                              type="color"
                                              value={
                                                timerStylingSettings.colors
                                                  .gradientStart
                                              }
                                              onChange={(e) =>
                                                setTimerStylingSettings({
                                                  ...timerStylingSettings,
                                                  colors: {
                                                    ...timerStylingSettings.colors,
                                                    gradientStart:
                                                      e.target.value,
                                                  },
                                                })
                                              }
                                              className="colorinput"
                                            />
                                            <Form.Control
                                              type="text"
                                              className="inputbox"
                                              value={
                                                timerStylingSettings.colors
                                                  .gradientStart
                                              }
                                              readOnly
                                              style={{ background: "white" }}
                                            />
                                          </div>
                                        </Col>
                                        <Col md={6} className="mt-3">
                                          <Form.Label>
                                            Gradient End Color
                                          </Form.Label>
                                          <div className="colorinputbox d-flex align-items-center">
                                            <input
                                              type="color"
                                              value={
                                                timerStylingSettings.colors
                                                  .gradientEnd
                                              }
                                              onChange={(e) =>
                                                setTimerStylingSettings({
                                                  ...timerStylingSettings,
                                                  colors: {
                                                    ...timerStylingSettings.colors,
                                                    gradientEnd: e.target.value,
                                                  },
                                                })
                                              }
                                              className="colorinput"
                                            />
                                            <Form.Control
                                              type="text"
                                              className="inputbox"
                                              value={
                                                timerStylingSettings.colors
                                                  .gradientEnd
                                              }
                                              readOnly
                                              style={{ background: "white" }}
                                            />
                                          </div>
                                        </Col>
                                      </>
                                    )}
                                  </Row>
                                </Form.Group>
                                <Form.Group className="mb-3 mt-3">
                                  <Row>
                                    <Col md={6}>
                                      <Form.Label>Margin Bottom</Form.Label>
                                      <div className="d-flex">
                                        <Form.Control
                                          type="number"
                                          value={
                                            timerStylingSettings.margin.bottom
                                              .value
                                          }
                                          onChange={(e) =>
                                            setTimerStylingSettings({
                                              ...timerStylingSettings,
                                              margin: {
                                                ...timerStylingSettings.margin,
                                                bottom: {
                                                  ...timerStylingSettings.margin
                                                    .bottom,
                                                  value: e.target.value,
                                                },
                                              },
                                            })
                                          }
                                        />
                                        <Form.Select
                                          value={
                                            timerStylingSettings.margin.bottom
                                              .unit
                                          }
                                          onChange={(e) =>
                                            setTimerStylingSettings({
                                              ...timerStylingSettings,
                                              margin: {
                                                ...timerStylingSettings.margin,
                                                bottom: {
                                                  ...timerStylingSettings.margin
                                                    .bottom,
                                                  unit: e.target.value,
                                                },
                                              },
                                            })
                                          }
                                          style={{
                                            maxWidth: "100px",
                                            marginLeft: "8px",
                                          }}
                                        >
                                          <option value="rem">rem</option>
                                          <option value="px">px</option>
                                        </Form.Select>
                                      </div>
                                    </Col>

                                    <Col md={6}>
                                      <Form.Label>Margin Top</Form.Label>
                                      <div className="d-flex">
                                        <Form.Control
                                          type="number"
                                          value={
                                            timerStylingSettings.margin.top
                                              .value
                                          }
                                          onChange={(e) =>
                                            setTimerStylingSettings({
                                              ...timerStylingSettings,
                                              margin: {
                                                ...timerStylingSettings.margin,
                                                top: {
                                                  ...timerStylingSettings.margin
                                                    .top,
                                                  value: e.target.value,
                                                },
                                              },
                                            })
                                          }
                                        />
                                        <Form.Select
                                          value={
                                            timerStylingSettings.margin.top.unit
                                          }
                                          onChange={(e) =>
                                            setTimerStylingSettings({
                                              ...timerStylingSettings,
                                              margin: {
                                                ...timerStylingSettings.margin,
                                                top: {
                                                  ...timerStylingSettings.margin
                                                    .top,
                                                  unit: e.target.value,
                                                },
                                              },
                                            })
                                          }
                                          style={{
                                            maxWidth: "100px",
                                            marginLeft: "8px",
                                          }}
                                        >
                                          <option value="rem">rem</option>
                                          <option value="px">px</option>
                                        </Form.Select>
                                      </div>
                                    </Col>
                                  </Row>
                                </Form.Group>
                              </div>
                            )}
                          </div>
                        </Form>
                      )}
                    {selectedOption !== "Orders Counter" && (
                      <Form
                        className="mt-3 p-3"
                        style={{ background: "#F1F2F4", borderRadius: "10px" }}
                      >
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
                            onClick={() => {
                              setShowShopNowButton(!showShopNowButton);
                              setShopNowButtonText("Shop Now");
                              setAnimateShopNowButton(false);
                              setShopNowButtonSettings({
                                backgroundColor: "#000000", // Default Black
                                fontColor: "#FFFFFF", // Default White
                                fontSize: "14px",
                                fontFamily: "Inter",
                                fontWeight: "600",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                borderColor: "#000000",
                              });
                            }}
                          >
                            "Shop Now" Button Settings
                          </h2>
                          <Form.Check
                            type="switch"
                            id="animateMessageSwitch"
                            checked={showShopNowButton}
                            onChange={(e) => {
                              setShowShopNowButton(e.target.checked);
                              setShopNowButtonText("Shop Now");
                              setAnimateShopNowButton(false);
                              setShopNowButtonSettings({
                                backgroundColor: "#000000", // Default Black
                                fontColor: "#FFFFFF", // Default White
                                fontSize: "14px",
                                fontFamily: "Inter",
                                fontWeight: "600",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                borderColor: "#000000",
                              });
                            }}
                          />
                        </div>
                        <div className="d-flex flex-column">
                          {showShopNowButton && (
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
                              <div
                                className="d-flex justify-content-between linewhite mt-2 mb-2"
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
                                  Enable Shaky Animation
                                </h2>
                                <Form.Check
                                  type="switch"
                                  id="animateShopNowButtonSwitch"
                                  checked={animateShopNowButton}
                                  onChange={(e) =>
                                    setAnimateShopNowButton(e.target.checked)
                                  }
                                />
                              </div>
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
                      </Form>
                    )}

                    {selectedOption !== "Free Shipping" &&
                      selectedOption !== "Orders Counter" && (
                        <Form
                          className="mt-3 p-3"
                          style={{
                            background: "#F1F2F4",
                            borderRadius: "10px",
                          }}
                        >
                          <div className="d-flex justify-content-between linewhite">
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
                              onClick={() => {
                                setShowSaveBox(!showSaveBox);
                                setSaveBoxText("SAVE 30%");
                                setSaveBoxSettings({
                                  backgroundColor: "#FFFF00",
                                  fontColor: "#000000",
                                  fontSize: "14px",
                                  fontFamily: "Inter",
                                  fontWeight: "700",
                                  padding: "5px 10px",
                                  borderRadius: "3px",
                                  borderColor: "#FFFF00",
                                });
                              }}
                            >
                              "Save X%" Box Settings
                            </h2>
                            <Form.Check
                              type="switch"
                              id="animateMessageSwitch"
                              checked={showSaveBox}
                              onChange={(e) => {
                                setShowSaveBox(e.target.checked);
                                setSaveBoxText("SAVE 30%");
                                setSaveBoxSettings({
                                  backgroundColor: "#FFFF00",
                                  fontColor: "#000000",
                                  fontSize: "14px",
                                  fontFamily: "Inter",
                                  fontWeight: "700",
                                  padding: "5px 10px",
                                  borderRadius: "3px",
                                  borderColor: "#FFFF00",
                                });
                              }}
                            />
                          </div>
                          <div className="d-flex flex-column gap-2">
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
                        </Form>
                      )}
                    <Form
                      className="mt-3 p-3"
                      style={{ background: "#F1F2F4", borderRadius: "10px" }}
                    >
                      {/* --- Theme Style Section --- */}
                      <div className="d-flex justify-content-between linewhite">
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
                          onClick={() => {
                            setShowstyle(!showStyle);
                            setSelectedTheme("solid");
                            setColorSettings({
                              "Background Color": "#a18c8c",
                            });
                          }}
                        >
                          Theme Style
                        </h2>
                        <Form.Check
                          type="switch"
                          id="animateMessageSwitch"
                          checked={showStyle}
                          onChange={(e) => {
                            setShowstyle(e.target.checked);
                            setSelectedTheme("solid");
                            setColorSettings({
                              "Background Color": "#a18c8c",
                            });
                          }}
                        />
                      </div>

                      {showStyle && (
                        <div>
                          {/* Theme Options */}
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
                                {/* Solid Color Box */}
                                {theme.value === "solid" ? (
                                  <div
                                    style={{
                                      width: "100%",
                                      height: "60px",
                                      background:
                                        colorSettings["Background Color"],
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
                                      color: uploadedImage
                                        ? "transparent"
                                        : "#555",
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
                                <div
                                  style={{ marginTop: "5px", fontSize: "12px" }}
                                >
                                  {theme.name}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Color Picker for Solid Color */}
                          {selectedTheme === "solid" && (
                            <div style={{ marginTop: "15px" }}>
                              <Form.Label>Pick Background Color</Form.Label>
                              <SketchPicker
                                color={colorSettings["Background Color"]}
                                onChangeComplete={(color) =>
                                  setColorSettings({
                                    ...colorSettings,
                                    "Background Color": color.hex,
                                  })
                                }
                              />
                            </div>
                          )}

                          {/* Image Upload Option */}
                          {selectedTheme === "image-upload" && (
                            <div className="py-3">
                              <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label>
                                  Select your background image
                                </Form.Label>
                                <Form.Control
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                />
                              </Form.Group>
                            </div>
                          )}
                        </div>
                      )}
                    </Form>

                    {/* Margin Settings Section */}
                    <Form
                      className="mt-3 p-3"
                      style={{ background: "#F1F2F4", borderRadius: "10px" }}
                    >
                      <div className="d-flex justify-content-between linewhite">
                        <h2
                          className=""
                          style={{
                            fontFamily: "Inter",
                            fontStyle: "normal",
                            fontWeight: "600",
                            fontSize: "15px",
                            lineHeight: "100%",
                            color: "#303030",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setShowsettings(!showSettings);
                            setBarPosition("top");
                            setIsCustomCSSEnabled(false);
                            setCustomCSS("");
                          }}
                        >
                          Theme Settings
                        </h2>
                        <Form.Check
                          type="switch"
                          id="animateMessageSwitch"
                          checked={showSettings}
                          onChange={(e) => {
                            setShowsettings(e.target.checked);
                            setBarPosition("top");
                            setIsCustomCSSEnabled(false);
                            setCustomCSS("");
                          }}
                        />
                      </div>
                      {showSettings && (
                        <div>
                          {/* Bar Position */}
                          <div className="mt-3">
                            <Form.Group className="d-flex flex-column gap-2">
                              <Form.Label className="inputtitle">
                                Status
                              </Form.Label>
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
                                The announcement bar is displayed before/above
                                the page content. When scrolling down, the
                                announcement bar will not be visible anymore.
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
                                  overflow: "auto", // Adds scrollbars if content overflows
                                  resize: "both", // Allows user to drag to resize both height and width
                                  opacity: isCustomCSSEnabled ? 1 : 0.6,
                                  cursor: isCustomCSSEnabled
                                    ? "text"
                                    : "not-allowed",
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
                                appearance of the announcement bar or other
                                elements.
                              </p>
                            </Form.Group>
                          </div>
                        </div>
                      )}
                    </Form>
                  </CardBody>
                </Card>
              )}
              {/* Step 5: Summary */}
              {selectedIndex === 2 && (
                <Card className="border-0">
                  <CardBody>
                    <h2 className="cardtitle">Review Settings</h2>
                    <Form
                      className="mt-3 p-3"
                      style={{ background: "#F1F2F4", borderRadius: "10px" }}
                    >
                      {/* General Settings */}
                      <div className="d-flex justify-content-between align-items-center borderbox">
                        <div className="d-flex flex-column gap-2">
                          <h2 className="cardtitle2">General Settings</h2>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">Status</p>
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
                              {status === "active" ? "Active" : "Inactive"}
                            </p>
                          </div>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">Name</p>
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
                              {name || "Not set"}
                            </p>
                          </div>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">Bar Position</p>
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
                              {barPosition === "top"
                                ? "Top Relative"
                                : barPosition === "top-fixed"
                                  ? "Top Fixed"
                                  : "Bottom"}
                            </p>
                          </div>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">Bar Dimensions</p>
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
                              {barWidth}% width, {barHeight}px height
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
                          onClick={() => setSelectedIndex(0)}
                          style={{
                            backgroundColor: "rgba(81, 105, 221, 0.1)",
                            color: "#5169DD",
                            border: "1px solid #5169DD",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                        />
                      </div>

                      {/* Message Settings */}
                      <div className="d-flex justify-content-between align-items-center borderbox">
                        <div className="d-flex flex-column gap-2">
                          <h2 className="cardtitle2">Message Settings</h2>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">Message Text</p>
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
                              {message || "Not set"}
                            </p>
                          </div>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">Font Color</p>
                            <p
                              style={{
                                width: "1.5px",
                                height: "10px",
                                background: "#222222",
                                opacity: 0.1,
                                margin: "0 4px",
                              }}
                            ></p>
                            <div
                              style={{
                                width: "15px",
                                height: "15px",
                                backgroundColor:
                                  generalColorSettings["Message Font Color"],
                                border: "1px solid #ddd",
                                borderRadius: "3px",
                              }}
                            ></div>
                          </div>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">Animation</p>
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
                              {animateMessage
                                ? `Enabled (${messageAnimationSpeed}s)`
                                : "Disabled"}
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
                          onClick={() => setSelectedIndex(0)}
                          style={{
                            backgroundColor: "rgba(81, 105, 221, 0.1)",
                            color: "#5169DD",
                            border: "1px solid #5169DD",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                        />
                      </div>

                      {/* Timer Settings */}
                      {selectedOption === "Countdown Timer" && (
                        <div className="d-flex justify-content-between align-items-center borderbox">
                          <div className="d-flex flex-column gap-2">
                            <h2 className="cardtitle2">Timer Settings</h2>
                            <div className="d-flex gap-2 align-items-center">
                              <p className="carddesc">Status</p>
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
                                {showTimer ? "Visible" : "Hidden"}
                              </p>
                            </div>
                            {showCountdown && targetDate && targetTime && (
                              <div className="d-flex gap-2 align-items-center">
                                <p className="carddesc">Countdown Target</p>
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
                                  {new Date(
                                    `${targetDate}T${targetTime}`
                                  ).toLocaleString()}
                                </p>
                              </div>
                            )}
                            <div className="d-flex gap-2 align-items-center">
                              <p className="carddesc">Labels</p>
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
                                {timerLabelSettings.showDaysLabel
                                  ? "Days "
                                  : ""}
                                {timerLabelSettings.showHoursLabel
                                  ? "Hours "
                                  : ""}
                                {timerLabelSettings.showMinutesLabel
                                  ? "Minutes "
                                  : ""}
                                {timerLabelSettings.showSecondsLabel
                                  ? "Seconds"
                                  : ""}
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
                            onClick={() => setSelectedIndex(0)}
                            style={{
                              backgroundColor: "rgba(81, 105, 221, 0.1)",
                              color: "#5169DD",
                              border: "1px solid #5169DD",
                              borderRadius: "8px",
                              padding: "8px",
                            }}
                          />
                        </div>
                      )}

                      {/* Theme Settings */}
                      <div className="d-flex justify-content-between align-items-center borderbox">
                        <div className="d-flex flex-column gap-2">
                          <h2 className="cardtitle2">Theme Settings</h2>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">Theme</p>
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
                              {selectedTheme === "solid"
                                ? "Solid Color"
                                : selectedTheme === "image-upload"
                                  ? "Custom Image"
                                  : themeOptions.find(
                                      (t) => t.value === selectedTheme
                                    )?.name || "Theme"}
                            </p>
                          </div>
                          {selectedTheme === "solid" && (
                            <div className="d-flex gap-2 align-items-center">
                              <p className="carddesc">Background Color</p>
                              <p
                                style={{
                                  width: "1.5px",
                                  height: "10px",
                                  background: "#222222",
                                  opacity: 0.1,
                                  margin: "0 4px",
                                }}
                              ></p>
                              <div
                                style={{
                                  width: "15px",
                                  height: "15px",
                                  backgroundColor:
                                    colorSettings["Background Color"],
                                  border: "1px solid #ddd",
                                  borderRadius: "3px",
                                }}
                              ></div>
                            </div>
                          )}
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">Custom CSS</p>
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
                              {isCustomCSSEnabled ? "Enabled" : "Disabled"}
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
                          onClick={() => setSelectedIndex(0)}
                          style={{
                            backgroundColor: "rgba(81, 105, 221, 0.1)",
                            color: "#5169DD",
                            border: "1px solid #5169DD",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                        />
                      </div>

                      {/* Additional Elements */}
                      <div className="d-flex justify-content-between align-items-center borderbox">
                        <div className="d-flex flex-column gap-2">
                          <h2 className="cardtitle2">Additional Elements</h2>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">"Shop Now" Button</p>
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
                              {showShopNowButton
                                ? `"${shopNowButtonText}"`
                                : "Hidden"}
                            </p>
                          </div>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">"Save" Box</p>
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
                              {showSaveBox ? `"${saveBoxText}"` : "Hidden"}
                            </p>
                          </div>
                          <div className="d-flex gap-2 align-items-center">
                            <p className="carddesc">"End Sale" Message</p>
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
                              {showEndSaleMessage
                                ? `"${endSaleMessage}"`
                                : "Hidden"}
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
                          onClick={() => setSelectedIndex(0)}
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
                  onClick={handlePublishBundle}
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
              position: "sticky",
              top: "10px", // Distance from top of viewport when stuck
              maxHeight: "calc(100vh - 40px)", // Prevent it from being taller than viewport
              overflowY: "auto", // Allow scrolling within the sticky element if content is too long
              zIndex: 10, // Ensure it stays above other content
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
                </div>

                <div
                  style={{
                    backgroundColor: "rgb(241, 242, 244)",
                    padding: "15px",
                    borderRadius: "18px",
                    position: "relative",
                    overflow: "hidden",
                    height: "600px",
                  }}
                >
                  <div className="d-flex flex-column align-items-center gap-2">
                    <div
                      style={{
                        position:
                          barPosition === "top-fixed"
                            ? "sticky"
                            : barPosition === "bottom"
                              ? "absolute"
                              : "relative",
                        // position: "absolute",
                        top: barPosition === "top-fixed" ? "0" : "auto",
                        bottom: barPosition === "bottom" ? "12px" : "auto",
                        width: barPosition === "bottom" ? "94%" : "100%",
                        zIndex: 4,
                        background: getBackgroundStyle(),
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        padding: "12px 16px",
                        borderRadius:
                          barPosition === "bottom"
                            ? "0 0 8px 8px"
                            : "8px 8px 0 0", // Rounded corners for both cases
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "15px",
                        height: `${barHeight}px`,
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
                            textAlign: "center",
                            // whiteSpace: "nowrap",
                            whiteSpace: "normal",
                            maxWidth: "100%",
                          }}
                        >
                          {/* The h2 element is now always rendered */}
                          <h2
                            className={`cardtitle ${showMessage && animateMessage ? "scrolling-text" : ""}`}
                            style={{
                              margin: 0,
                              color: generalColorSettings["Message Font Color"],
                              fontSize: messageDesktopFontSettings.fontSize,
                              fontFamily: messageDesktopFontSettings.fontFamily,
                              fontWeight: messageDesktopFontSettings.fontWeight,
                              letterSpacing:
                                messageDesktopFontSettings.letterSpacing,
                              lineHeight: messageDesktopFontSettings.lineHeight,
                              display: "inline-block",
                              borderBottom: "none",
                              animationName:
                                showMessage && animateMessage
                                  ? "scrollText"
                                  : "none",
                              animationDuration: `${messageAnimationSpeed}s`,
                              animationTimingFunction: "linear",
                              animationIterationCount:
                                showMessage && animateMessage ? scrollCount : 0,
                            }}
                            onAnimationEnd={() => {
                              // Keep message visible, but stop animation
                              setAnimateMessage(false);
                            }}
                          >
                            {/* Conditionally render the content based on whether the animation is active */}
                            {showMessage && animateMessage
                              ? Array(10)
                                  .fill(message || "Type text here")
                                  .map((msg, i) => (
                                    <span
                                      key={i}
                                      style={{ marginRight: "40px" }}
                                    >
                                      {msg}
                                    </span>
                                  ))
                              : message || "Type text here"}
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
                              zIndex: 3, // Increased z-index to appear above wave
                              position: "relative", // Required for z-index to work
                            }}
                          >
                            {saveBoxText}
                          </div>
                        )}

                        {showTimerOptions && (
                          <div
                            className="timer-display d-flex align-items-center justify-content-center"
                            style={{
                              fontSize: timerDesktopFontSettings.fontSize, // ✅ Apply font size dynamically only here
                              zIndex: 3, // Increased z-index to appear above wave
                              position: "relative", // Required for z-index to work
                              display: "flex",
                              justifyContent:
                                timerStylingSettings.alignment.toLowerCase(),
                              alignItems:
                                timerStylingSettings.alignment.toLowerCase(),
                              textAlign:
                                timerStylingSettings.alignment.toLowerCase(),
                              marginTop: `${timerStylingSettings.margin.top.value}${timerStylingSettings.margin.top.unit}`,
                              marginBottom: `${timerStylingSettings.margin.bottom.value}${timerStylingSettings.margin.bottom.unit}`,
                            }}
                          >
                            {renderTimerBlock()}
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
                              zIndex: 3, // Increased z-index to appear above wave
                              position: "relative", // Required for z-index to work
                            }}
                          >
                            {shopNowButtonText}{" "}
                            {/* This is the corrected line */}
                          </div>
                        )}
                      </div>

                      {showWaveOptions && (
                        <div
                          className="ocean"
                          style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0",
                            width: "100%",
                            height: "80px",
                            overflow: "hidden",
                            zIndex: 1, // Lower z-index to appear behind other elements
                          }}
                        >
                          <div className="wave"></div>
                          <div className="wave"></div>
                          <div className="wave"></div>
                        </div>
                      )}
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
                        width: "fit-content",
                        height: "29px",
                        right: "0px",
                        top: "0.5px",
                        zIndex: 99,
                      }}
                    >
                      {/* {endSaleMessage} */}
                      {endSaleMessage} {timeLeft && <span>{timeLeft}</span>}
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
                      <div
                        style={{ marginBottom: "10px", position: "relative" }}
                      >
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
);

export default BundleDiscountActions;
