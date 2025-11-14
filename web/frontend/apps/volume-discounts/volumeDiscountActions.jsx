import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Container, Row, Col, ButtonGroup, ToggleButton, Card, CardBody, Form } from "react-bootstrap";
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
import Products from "./products";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Navigation } from "@shopify/polaris";
import DatePicker from "../../components/DatePicker";

const volumeDiscountActions = React.forwardRef(({ onSuccess, editData }, ref) => {
  const shopify = useAppBridge();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [variantPricing, setVariantPricing] = useState([]);
  const [isBundleActive, setIsBundleActive] = useState(true);
  const [colorSettings, setColorSettings] = useState({
    "Primary Text Color": "#303030",
    "Secondary Text Color": "#000000",
    "Primary Background Color": "#fff",
    "Secondary Background Color": "#f1f2f4",
    "Border Color": "#FFFFFF",
    "Button Color": "#5169DD",
    "Countdown Timer background Color": "#C4290E",
    "Countdown Timer Text Color": "#FFFFFF",
  });

  const [count, setCount] = useState(50);
  const [isAvailableLongTime, setIsAvailableLongTime] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [timezone, setTimezone] = useState("GMT");
  const tabs = [
    "Select Products",
    "Discount Settings",
    "Bundle Settings",
    "Display Settings",
    "Review Settings",
  ];
  const [discountType, setDiscountType] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showProductPage, setShowProductPage] = useState(false);
  const [bundleTitle, setBundleTitle] = useState("Buy Together & Save More!🔥");
  const [bundleInternalName, setBundleInternalName] = useState("");
  const [statusToggle, setStatusToggle] = useState(false);
  const [previewProductsSelectedOptions, setPreviewProductsSelectedOptions] = useState([]);

  const [quantityBreaks, setQuantityBreaks] = useState([
    {
      quantity: 1,
      discount: 10,
      name: "Buy [quantity], get [discount] OFF",
      banner: "",
      default: true,
    },
  ]); // Initialize with one quantity break

  const defaultProductItem = quantityBreaks.find((item) => item.default);
  const [margins, setMargins] = useState({
    top: 20,
    bottom: 20,
  });
  const [cornerRadius, setCornerRadius] = useState("20");
  const [bundlePriority, setBundlePriority] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Add this line
  const [timeLeft, setTimeLeft] = useState({
    hours: "23",
    minutes: "59",
    seconds: "59",
  });
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingToastId, setSavingToastId] = useState(null);
  const [currency, setCurrency] = useState("$");
  useEffect(() => {
    getCurrency();
  }, []);
  // Countdown timer effect
  useEffect(() => {
    if (!showCountdown) {
      setIsCountdownActive(false);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999); // Set to end of day

      const difference = endOfDay - now;

      if (difference <= 0) {
        // If past midnight, calculate for next day
        endOfDay.setDate(endOfDay.getDate() + 1);
        const newDifference = endOfDay - now;
        return formatTimeLeft(newDifference);
      }

      return formatTimeLeft(difference);
    };

    const formatTimeLeft = (difference) => {
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return {
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      };
    };

    // Calculate initial time
    setTimeLeft(calculateTimeLeft());
    setIsCountdownActive(true);

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup interval on unmount or when showCountdown changes
    return () => clearInterval(timer);
  }, [showCountdown]);
  // Change 2: Add useEffect to initialize form with edit data
  useEffect(() => {
    if (editData) {
      setIsEditing(true);
      // Populate form fields with existing data
      setBundleTitle(editData.title || "");
      setBundleInternalName(editData.internalName || "");
      setBundlePriority(editData.priority || 0);
      setStatusToggle(editData.status || false);
      setDiscountType(editData.discountType || "");
      setInputValue(editData.discountValue || "");

      // Set products if available
      if (editData.products) {
        setSelectedProducts(editData.products);
      }

      // Set quantity breaks if available
      if (editData.quantityBreaks) {
        setQuantityBreaks(editData.quantityBreaks);
      }

      // Set widget appearance settings
      if (editData.widgetAppearance) {
        console.log("color settings", colorSettings);
        console.log("editData.widgetAppearance", editData.widgetAppearance);
        setColorSettings({
          "Primary Text Color": editData.widgetAppearance.primaryTextColor || "#303030",
          "Secondary Text Color": editData.widgetAppearance.secondaryTextColor || "#000000",
          "Primary Background Color": editData.widgetAppearance.PrimaryBackgroundColor || "#fff",
          "Secondary Background Color": editData.widgetAppearance.secondaryBackgroundColor || "#f1f2f4",
          "Border Color": editData.widgetAppearance.borderColor || "#FFFFFF",
          "Button Color": editData.widgetAppearance.buttonColor || "#000000",
          "Countdown Timer background Color": editData.widgetAppearance.offerTagBackgroundColor || "#C4290E",
          "Countdown Timer Text Color": editData.widgetAppearance.offerTagTextColor || "#FFFFFF",
        });
        setShowCountdown(editData.widgetAppearance.isShowCountDownTimer || false);
        setShowEmoji(editData.widgetAppearance.addEmoji || false);
        setMargins({
          top: editData.widgetAppearance.topMargin || 20,
          bottom: editData.widgetAppearance.bottomMargin || 20,
        });
        setCornerRadius(editData.widgetAppearance.cardCornerRadius || "20");
      }

      // Set dates
      if (editData.startDate) {
        setStartDate(new Date(editData.startDate));
      }
      if (editData.endDate) {
        setEndDate(new Date(editData.endDate));
      }
      fetchProductPricesForEdit(editData);
    }
  }, [editData]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (savingToastId) {
        dismissToast(savingToastId);
      }
    };
  }, [savingToastId]);
  // Function to fetch product prices when editing using your existing products API
  const fetchProductPricesForEdit = async (editData) => {
    try {
      const allProducts = editData.products || [];
      const variantPrices = [];

      // Fetch all products data using your existing API
      const response = await fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const productsData = await response.json();
        const allProductsFromAPI = productsData.data?.products?.edges || [];

        // For each product in edit data, find its variants and prices
        for (const product of allProducts) {
          const apiProduct = allProductsFromAPI.find((p) => p.node.id === product.productId);

          if (apiProduct && apiProduct.node.variants) {
            const variants = apiProduct.node.variants.nodes || [];

            // Get variant prices for this product
            variants.forEach((variant) => {
              variantPrices.push({
                productId: product.productId,
                title: variant.title,
                price: parseFloat(variant.price) || 0,
              });
            });
          }
        }

        setVariantPricing(variantPrices);
      }
    } catch (error) {
      console.error("Error fetching product prices for edit:", error);
    }
  };
  async function getCurrency() {
    try {
      const response = await fetch("/api/products/currency", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      console.log("Products data in BundleDiscountActions:", data);
      setCurrency(data.symbol || "$");
    } catch (error) {
      console.log("GetProductsError in BundleDiscountActions", error);
    }
  }
  const handleSelectChange = (e) => {
    const value = e.target.value;
    setDiscountType(value);

    // if (value === "Percentage") {
    //   setInputValue("%");
    // } else if (value === "Fixed Amount") {
    //   setInputValue("499");
    // } else if (value === "Free Gift") {
    //   setInputValue("{currency} 0");
    // } else {
    //   setInputValue("");
    // }
  };
  const handleCalendarChange = (value) => {
    if (Array.isArray(value)) {
      setStartDate(value[0]);
      setEndDate(value[1]);
    } else {
      if (!startDate || value < startDate) {
        setStartDate(value);
        setEndDate(null);
      } else {
        setEndDate(value);
      }
    }
  };
  const handleVariationChange = (event) => {
    setSelectedVariation(event.target.value);
  };
  const [toggles, setToggles] = useState(true);

  const handleIncrement = () => {
    if (count < 100) setCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (count > 0) setCount((prev) => prev - 1);
  };
  const handleNext = async () => {
    if (selectedIndex < tabs.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      return;
    }

    if (selectedIndex == tabs.length - 1) {
      quantityBreaks.forEach((breakItem) => {
        breakItem.uniqueName = breakItem.name
          .replace("[quantity]", breakItem.quantity)
          .replace(
            "[discount]",
            discountType == "Percentage" ? `${breakItem.discount}%` : `${currency} ${breakItem.discount}`
          );
      });
      if (!selectedProducts || selectedProducts.length === 0) {
        shopify.toast.show("Please select at least one product.", {
          duration: 4000,
          style: { backgroundColor: "#f44336", color: "#fff" },
        });
        return;
      }
      if (!bundleTitle || bundleTitle.trim() === "") {
        shopify.toast.show("Please enter a bundle title.", {
          duration: 4000,
          style: { backgroundColor: "#f44336", color: "#fff" },
        });
        return;
      }
      if (!discountType) {
        shopify.toast.show("Please select a discount type.", {
          duration: 4000,
          style: { backgroundColor: "#f44336", color: "#fff" },
        });
        return;
      }

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        shopify.toast.show("End date must be after start date.", {
          duration: 4000,
          style: { backgroundColor: "#f44336", color: "#fff" },
        });
        return;
      }

      setIsSaving(true);
      // Show persistent saving toast
      const toastId = showPersistentToast("Saving bundle...");
      setSavingToastId(toastId);
      const internalNameToUse =
        bundleInternalName && bundleInternalName.trim() !== ""
          ? bundleInternalName.trim()
          : bundleTitle.trim();
      const bundleData = {
        title: bundleTitle,
        products: selectedProducts,
        quantityBreaks: quantityBreaks,
        discountType: discountType,
        discountValue: inputValue,
        status: statusToggle,
        internalName: internalNameToUse,
        type: "Volume Discount",
        bundlePriority: bundlePriority,
        widgetAppearance: {
          primaryTextColor: colorSettings["Primary Text Color"],
          secondaryTextColor: colorSettings["Secondary Text Color"],
          PrimaryBackgroundColor: colorSettings["Primary Background Color"],
          secondaryBackgroundColor: colorSettings["Secondary Background Color"],
          borderColor: colorSettings["Border Color"],
          buttonColor: colorSettings["Button Color"],
          offerTagBackgroundColor: colorSettings["Countdown Timer background Color"],
          offerTagTextColor: colorSettings["Countdown Timer Text Color"],
          isShowCountDownTimer: showCountdown,
          addEmoji: showEmoji,
          topMargin: margins.top,
          bottomMargin: margins.bottom,
          cardCornerRadius: cornerRadius,
        },
        startDate: startDate,
        endDate: endDate,
      };

      console.log("Bundle Data: ", bundleData);

      // Change 4: Use dynamic URL and method based on edit mode
      const url = isEditing ? `/api/bundles/${editData._id}` : "/api/bundles";
      const method = isEditing ? "PUT" : "POST";
      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bundleData),
        });
        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonErr) {
          console.warn("Response is not valid JSON:", jsonErr);
          responseData = { message: "Unexpected server response." };
        }
        if (response.ok) {
          dismissToast(savingToastId);
          shopify.toast.show(`Bundle ${isEditing ? "updated" : "created"} successfully!`, {
            duration: 5000,
            style: { backgroundColor: "#4CAF50", color: "#fff", fontSize: "16px" },
          });
          if (onSuccess) onSuccess();
        } else {
          console.error("Backend error response:", responseData);
          dismissToast(savingToastId);

          const errorMessage =
            responseData?.message ||
            responseData?.error ||
            `Oops! Something went wrong while ${isEditing ? "updating" : "creating"} the bundle.`;

          // Force flush to ensure toast shows even during rapid state updates
          setTimeout(() => {
            shopify.toast.show(errorMessage, {
              duration: 8000,
              style: { backgroundColor: "#f44336", color: "#fff", fontSize: "16px" },
            });
          }, 100);
        }
      } catch (error) {
        console.error("Network or parsing error:", error);
        dismissToast(savingToastId);

        const errorMessage = error?.message || "Network error. Please check your connection and try again.";

        setTimeout(() => {
          shopify.toast.show(errorMessage, {
            duration: 8000,
            style: { backgroundColor: "#f44336", color: "#fff", fontSize: "16px" },
          });
        }, 100);
      } finally {
        setIsSaving(false);
        setSavingToastId(null);
      }
    }
  };
  useImperativeHandle(ref, () => ({
    handleSaveChanges: handleNext,
  }));
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
    setPreviewProductsSelectedOptions([]);
  };
  const handleAddProducts = () => {
    setShowProductPage(true);
  };

  const handleCloseProducts = () => {
    setShowProductPage(false);
  };

  useEffect(() => {
    let defaultOptions = {};

    if (selectedProducts.length > 0) {
      quantityBreaks.forEach((breakItem, index) => {
        const product = selectedProducts[0];
        defaultOptions[`${product.productId}-${index}`] = { options: {} };
        product.optionSelections.forEach((option) => {
          defaultOptions[`${product.productId}-${index}`].options[option.name] = option.values[0];
          if (!defaultOptions[`${product.productId}-${index}`].title) {
            defaultOptions[`${product.productId}-${index}`].title = [];
          }
          defaultOptions[`${product.productId}-${index}`].title.push(option.values[0]);
        });
        defaultOptions[`${product.productId}-${index}`].title =
          defaultOptions[`${product.productId}-${index}`].title.join(" / ");
      });
    }
    setPreviewProductsSelectedOptions(defaultOptions);
  }, [selectedProducts, quantityBreaks]);

  const handlePreviewOptionChange = (productId, optionName, value, index) => {
    setPreviewProductsSelectedOptions((prev) => {
      const updatedOptions = { ...prev };
      if (!updatedOptions[`${productId}-${index}`]) {
        updatedOptions[`${productId}-${index}`] = { options: {} };
      }
      updatedOptions[`${productId}-${index}`].options[optionName] = value;
      if (!updatedOptions[`${productId}-${index}`].title) {
        updatedOptions[`${productId}-${index}`].title = [];
      }
      // return an array with option values only
      updatedOptions[`${productId}-${index}`].title = Object.keys(
        updatedOptions[`${productId}-${index}`].options
      ).map((key) => updatedOptions[`${productId}-${index}`].options[key]);
      updatedOptions[`${productId}-${index}`].title =
        updatedOptions[`${productId}-${index}`].title.join(" / ");
      return updatedOptions;
    });
  };

  // useEffect(() => {
  //   console.log("preview options", previewProductsSelectedOptions);
  // }, [previewProductsSelectedOptions]);

  // useEffect(() => {
  //   console.log("variant price", variantPricing);
  // }, [variantPricing]);

  // Add this function to calculate price for a specific product
  const getProductPrice = (productId, index) => {
    const product = variantPricing.find(
      (p) =>
        p.productId === productId &&
        p.title === previewProductsSelectedOptions[`${productId}-${index}`]?.title
    );

    const breakItem = quantityBreaks[index];
    // const breakItem = defaultProductItem;

    if (product) {
      // calculate discount price if discountType is defined
      let price = null;
      if (discountType === "Percentage" && breakItem.discount) {
        const percentage = parseFloat(breakItem.discount) || 0;
        price = product.price * (1 - percentage / 100);
      } else if (discountType === "Fixed Amount" && breakItem.discount) {
        const discount = parseFloat(breakItem.discount) / selectedProducts.length || 0;
        price = Math.max(0, product.price - discount);
      } else {
        price = product.price;
      }
      return {
        price: price * (breakItem.quantity || 1),
        compareAtPrice: product.price * (breakItem.quantity || 1),
      };
    }
    return { price: 0, compareAtPrice: 0 };
  };

  // Function to calculate total bundle price
  const calculateTotalPrice = () => {
    let total = 0;
    let originalTotal = 0;

    const defaultProdIndex = quantityBreaks.findIndex((item) => item.default);

    selectedProducts.forEach((product) => {
      // const { price, compareAtPrice } = getProductPrice(product.productId, 0);
      const { price, compareAtPrice } = getProductPrice(product.productId, defaultProdIndex);
      total += price;
      originalTotal += compareAtPrice;
    });

    return {
      finalPrice: total.toFixed(2),
      compareAtPrice: originalTotal.toFixed(2),
      saved: (originalTotal - total).toFixed(2),
      discountPercentage: Math.round(((originalTotal - total) / originalTotal) * 100),
    };
  };

  // Calculate pricing information for the bundle
  const bundlePricing = calculateTotalPrice();
  // Handler function to update margin values
  const handleMarginChange = (type, value) => {
    setMargins({
      ...margins,
      [type]: parseInt(value) || 0,
    });
  };
  const handleRadiusChange = (e) => {
    setCornerRadius(e.target.value);
  };
  const showPersistentToast = (message, style = {}) => {
    // Show toast and store the ID to dismiss later
    const toastId = shopify.toast.show(message, {
      duration: 86400000, // Very long duration (24 hours)
      style: { backgroundColor: "#2196F3", color: "#fff", ...style },
      isError: false,
    });
    return toastId;
  };

  const dismissToast = (toastId) => {
    if (toastId) {
      shopify.toast.hide(toastId);
    }
  };
  return (
    <>
      {!showProductPage ? (
        <Container fluid className="" style={{ margin: "0 auto", height: "auto" }}>
          {/* Step Navigation */}
          <Row
            className="justify-content-center mb-2"
            style={{
              padding: "4px",
              boxShadow: "1px 1px 4px 0px #0000001A inset",
              backgroundColor: "#fff",
              borderRadius: "16px",
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
                        borderRadius: "12px", // << one standard radius
                        padding: "12px 18px",
                        backgroundColor: selectedIndex === idx || idx < selectedIndex ? "#000" : "#F1F2F4",
                        color: selectedIndex === idx || idx < selectedIndex ? "#fff" : "#222",
                        boxShadow:
                          selectedIndex === idx || idx < selectedIndex
                            ? "none"
                            : "1px 1px 4px 0px #0000001A inset",
                        borderColor: "#000",
                        margin: 0,
                      }}
                      className="d-flex justify-content-start align-items-center px-3"
                    >
                      <>
                        <span>{String(idx + 1).padStart(2, "0")}</span>
                        <p
                          style={{
                            width: "1.5px",
                            height: "10px",
                            background: selectedIndex === idx || idx < selectedIndex ? "white" : "#222222",
                            opacity: selectedIndex === idx || idx < selectedIndex ? 0.2 : 0.1,
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
                            : {
                                width: "5.5px",
                                height: "9.5px",
                                color: "#000",
                              }
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
                      <div className="d-flex justify-content-between  mb-3">
                        <Button
                          text="+ Add to Products"
                          onClick={handleAddProducts}
                          style={{
                            backgroundColor: "white",
                            color: "#5169DD",
                            border: "1px solid #5169DD",
                            borderRadius: "8px",
                            padding: "7px 10px 7px 7px",
                          }}
                        />

                        <Button
                          text={
                            <>
                              <Trash style={{ marginRight: "6px" }} />
                              Clear All
                            </>
                          }
                          onClick={clearAllProducts}
                          style={{
                            backgroundColor: "white",
                            color: "#C4290E",
                            border: "1px solid #C4290E",
                            borderRadius: "8px",
                            padding: "7px 10px 7px 7px",
                          }}
                        />
                      </div>

                      {/* Selected Products */}
                      {selectedProducts.map((product, idx) => (
                        <Card
                          className="border-0 mb-2"
                          key={idx}
                          style={{
                            background: "rgb(241, 242, 244)",
                            borderRadius: "16px",
                          }}
                        >
                          <CardBody className="d-flex align-items-center justify-content-between linrrow">
                            <div className="d-flex align-items-center">
                              <img src={verticalicon} alt="T-Shirt" width={20} height={20} className="me-2" />
                              <img
                                src={product.media}
                                alt="T-Shirt"
                                width={60}
                                height={60}
                                className="me-2"
                              />
                              <div className="bundlebox">
                                <span className="productname">{product.title}</span>
                                <div className="bundletxtb2">
                                  <p>{product?.optionSelections?.length} Option</p>
                                  <p>
                                    {product?.optionSelections?.reduce(
                                      (acc, option) => acc * option.values.length,
                                      1
                                    )}{" "}
                                    Variants
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between gap-2">
                              <div className="d-flex align-items-center gap-2">
                                <p
                                  className="mb-1"
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "normal",
                                    fontWeight: "500",
                                    color: "#616161",
                                  }}
                                >
                                  Available Quantity
                                </p>
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: "normal",
                                      fontWeight: "500",
                                      color: "#222222",
                                    }}
                                  >
                                    50 /{" "}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: "normal",
                                      fontWeight: "500",
                                      color: "#222222",
                                      opacity: 0.5,
                                    }}
                                  >
                                    100
                                  </span>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "10px",
                                  gap: "10px",
                                  width: "100px",
                                  height: "35px",
                                  background: "#FFFFFF",
                                  border: "1px solid rgba(34, 34, 34, 0.1)",
                                  borderRadius: "8px",
                                }}
                              >
                                <button
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    padding: 0,
                                    fontSize: "15px",
                                    fontWeight: "normal",
                                    lineHeight: "1",
                                    color: "#4A4A4A",
                                  }}
                                  onClick={handleDecrement}
                                >
                                  -
                                </button>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {count}
                                </span>
                                <button
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    padding: 0,
                                    fontSize: "15px",
                                    fontWeight: "normal",
                                    lineHeight: "1",
                                    color: "#4A4A4A",
                                  }}
                                  onClick={handleIncrement}
                                >
                                  +
                                </button>
                              </div>

                              <Button
                                text={<X className="crossicon" />}
                                variant="link"
                                className="border-0 p-0 d-flex justify-content-center align-items-center"
                                onClick={() => removeProduct(product)}
                                style={{
                                  color: "black",
                                  width: "18px",
                                  height: "18px",
                                }}
                              />
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </CardBody>
                  </Card>
                )}

                {/* Discount Settings Step */}
                {selectedIndex === 1 && (
                  <Card className="border-0">
                    <CardBody>
                      <Form.Group
                        controlId="discountSelect"
                        className="discountdropdown position-relative d-flex justify-content-between gap-[1px]"
                      >
                        <div style={{ width: "100%" }}>
                          <Form.Label className="inputtitle mb-1">Discount Type</Form.Label>
                          <div className="position-relative">
                            <Form.Select
                              value={discountType}
                              onChange={handleSelectChange}
                              className="discountdropdownselect custom-dropdown text-black"
                            >
                              <option value="">Select Discount Setting</option>
                              <option value="Percentage">Percentage</option>
                              <option value="Fixed Amount">Fixed Discount</option>
                            </Form.Select>

                            {/* Dropdown icon */}
                            <span className="dropdown-icon">
                              <img src={dropdown} alt="dropdown icon" />
                            </span>
                          </div>
                        </div>
                      </Form.Group>

                      <p
                        style={{
                          fontFamily: "Inter",
                          fontStyle: "normal",
                          fontWeight: 500,
                          fontSize: "13px",
                          lineHeight: "100%",
                          color: "#616161",
                        }}
                        className="linrrow"
                      >
                        A ‘Percentage’ discount reduces the bundle products prices.
                      </p>
                      {/* Tier Section */}
                      {discountType && (
                        <>
                          <div className="mt-4">
                            <h3 className="mb-3" style={{ fontWeight: "600", fontSize: "16px" }}>
                              Quantity Breaks
                            </h3>
                            {quantityBreaks.map((quantityBreak, index) => (
                              <div
                                key={index}
                                className="p-3 mb-3"
                                style={{
                                  border: "1px solid #ccc",
                                  borderRadius: "10px",
                                  background: "#F9F9F9",
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h4
                                    style={{
                                      fontWeight: "600",
                                      fontSize: "14px",
                                      marginBottom: "10px",
                                    }}
                                  >
                                    QUANTITY BREAK {index + 1}
                                  </h4>
                                  {index > 0 && (
                                    <Button
                                      text={"Remove"}
                                      variant="link"
                                      className="d-flex justify-content-center align-items-center"
                                      onClick={() => {
                                        const newQuantityBreaks = [...quantityBreaks];
                                        newQuantityBreaks.splice(index, 1);
                                        setQuantityBreaks(newQuantityBreaks);
                                      }}
                                      style={{
                                        color: "#ca141b",
                                        backgroundColor: "#eedcda",
                                        borderRadius: "8px",
                                        border: "1px solid #ca141b",
                                        padding: "1px 8px",
                                        fontWeight: 500,
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="d-flex gap-3 mb-3">
                                  <Form.Group style={{ flex: 1 }}>
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                      type="number"
                                      placeholder="Enter quantity"
                                      value={quantityBreak.quantity}
                                      onChange={(e) => {
                                        const newQuantityBreaks = [...quantityBreaks];
                                        newQuantityBreaks[index].quantity = e.target.value;
                                        setQuantityBreaks(newQuantityBreaks);
                                      }}
                                      min={1}
                                      style={{ background: "white" }}
                                    />
                                  </Form.Group>
                                  <Form.Group style={{ flex: 1 }}>
                                    <Form.Label>
                                      Discount {discountType === "Percentage" ? "Percentage" : "Amount"}
                                    </Form.Label>
                                    <Form.Control
                                      type="number"
                                      placeholder="Enter discount"
                                      value={quantityBreak.discount}
                                      onChange={(e) => {
                                        const newQuantityBreaks = [...quantityBreaks];
                                        newQuantityBreaks[index].discount = e.target.value;
                                        setQuantityBreaks(newQuantityBreaks);
                                      }}
                                      style={{ background: "white" }}
                                      min={0}
                                      max={discountType === "Percentage" ? 100 : undefined}
                                    />
                                  </Form.Group>
                                </div>
                                <div className="d-flex gap-3 mb-3">
                                  <Form.Group style={{ flex: 1 }}>
                                    <Form.Label>Discount Name</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Enter discount name"
                                      value={quantityBreak.name}
                                      onChange={(e) => {
                                        const newQuantityBreaks = [...quantityBreaks];
                                        newQuantityBreaks[index].name = e.target.value;
                                        setQuantityBreaks(newQuantityBreaks);
                                      }}
                                      style={{ background: "white" }}
                                    />
                                  </Form.Group>
                                  <Form.Group style={{ flex: 1 }}>
                                    <Form.Label>Banner</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Enter banner text"
                                      value={quantityBreak.banner}
                                      onChange={(e) => {
                                        const newQuantityBreaks = [...quantityBreaks];
                                        newQuantityBreaks[index].banner = e.target.value;
                                        setQuantityBreaks(newQuantityBreaks);
                                      }}
                                      style={{ background: "white" }}
                                    />
                                  </Form.Group>
                                </div>
                                <Form.Check
                                  type="checkbox"
                                  label="Selected by default"
                                  style={{
                                    fontWeight: "500",
                                    fontSize: "14px",
                                  }}
                                  checked={quantityBreak.default}
                                  onChange={(e) => {
                                    const newQuantityBreaks = [...quantityBreaks];
                                    // Uncheck all other checkboxes
                                    newQuantityBreaks.forEach((qb, i) => {
                                      if (i !== index) {
                                        qb.default = false;
                                      }
                                    });
                                    newQuantityBreaks[index].default = e.target.checked;
                                    setQuantityBreaks(newQuantityBreaks);
                                  }}
                                />
                              </div>
                            ))}
                            <Button
                              text="+ Add Another Quantity Break"
                              onClick={() => {
                                setQuantityBreaks([
                                  ...quantityBreaks,
                                  {
                                    quantity: 1,
                                    discount: 10,
                                    name: "Buy [quantity], get [discount] OFF",
                                    banner: "",
                                    default: false,
                                  },
                                ]);
                              }}
                              style={{
                                backgroundColor: "rgb(231 239 255)",
                                color: "#5169DD",
                                border: "1px solid #5169DD",
                                borderRadius: "8px",
                                padding: "7px 10px",
                                marginTop: "10px",
                              }}
                            />
                          </div>
                        </>
                      )}
                    </CardBody>
                  </Card>
                )}

                {selectedIndex === 2 && (
                  <Card className="border-0">
                    <CardBody>
                      {/* Bundle Status Section */}
                      <Form
                        className="mt-3 p-3"
                        style={{
                          background: "#F1F2F4",
                          borderRadius: "10px",
                        }}
                      >
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
                              Bundle Status
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
                              Activate Your Bundle
                            </p>
                          </div>

                          <Form.Check
                            type="switch"
                            id={`bundle-toggle`}
                            checked={statusToggle}
                            onChange={() => setStatusToggle(!statusToggle)}
                            className="custom-switch-toggle"
                          />
                        </div>
                        <div className="d-flex flex-column gap-4">
                          <Form.Group>
                            <Form.Label className="inputtitle">Title</Form.Label>
                            <Form.Control
                              className="inputbox"
                              type="text"
                              placeholder="Enter title"
                              value={bundleTitle}
                              onChange={(e) => setBundleTitle(e.target.value)}
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
                              Show at the top of the bundle.
                            </p>
                          </Form.Group>
                          <Form.Group>
                            <Form.Label className="inputtitle">Internal Name</Form.Label>
                            <Form.Control
                              className="inputbox"
                              type="text"
                              placeholder="Enter internal name"
                              value={bundleInternalName}
                              onChange={(e) => setBundleInternalName(e.target.value)}
                              style={{ background: "white" }}
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
                              Used internally to identify the bundle.
                            </p>
                          </Form.Group>
                          <Form.Group>
                            <Form.Label className="inputtitle">Bundle Priority</Form.Label>
                            <Form.Control
                              className="inputbox"
                              type="number"
                              placeholder="Priority"
                              value={bundlePriority}
                              onChange={(e) => setBundlePriority(e.target.value)}
                              style={{ background: "white" }}
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
                              Used internally to identify the bundle.
                            </p>
                          </Form.Group>
                        </div>
                      </Form>

                      {/* Appearance Settings Section */}
                      <Form
                        className="mt-3 p-3"
                        style={{
                          background: "#F1F2F4",
                          borderRadius: "10px",
                        }}
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
                            Appearance Settings
                          </h2>
                        </div>

                        <div className="py-3">
                          <div className="colorgrid">
                            {Object.keys(colorSettings).map((key) => {
                              if (
                                ["Countdown Timer background Color", "Countdown Timer Text Color"].includes(
                                  key
                                )
                              )
                                return;
                              return (
                                <Form.Group className="colorbox" key={key}>
                                  <Form.Label>{key.replace(/([A-Z])/g, " $1")}</Form.Label>
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
                              );
                            })}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 py-3">
                          {/* Countdown Timer and Emoji Options */}
                          <Form.Check
                            type="checkbox"
                            className="custom-checkbox"
                            checked={showCountdown}
                            onChange={() => setShowCountdown(!showCountdown)}
                            label={<span style={{ marginLeft: "6px" }}>Show Countdown Timer</span>}
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
                              color: "#616161",
                              width: "90%",
                            }}
                          >
                            Show countdown timer this will include a ((counter)) tag in the Secondary text.
                            can reposition the countdown timer anywhere in the Secondary text by moving the
                            tag
                          </p>
                        </div>
                        <div className="py-3">
                          <div className="colorgrid">
                            {Object.keys(colorSettings).map((key) => {
                              if (
                                !["Countdown Timer background Color", "Countdown Timer Text Color"].includes(
                                  key
                                )
                              )
                                return;
                              return (
                                <Form.Group className="colorbox" key={key}>
                                  <Form.Label>{key.replace(/([A-Z])/g, " $1")}</Form.Label>
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
                              );
                            })}
                          </div>
                        </div>
                        {/* <div className="d-flex align-items-center justify-content-between gap-2">
                          <Form.Check
                            type="checkbox"
                            className="custom-checkbox"
                            checked={showEmoji}
                            onChange={() => setShowEmoji(!showEmoji)}
                            label={<span style={{ marginLeft: "6px" }}>Add an Emoji 🔥</span>}
                            style={{
                              fontFamily: "Inter",
                              fontStyle: "normal",
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "#303030",
                              whiteSpace: "nowrap",
                            }}
                          />

                          <Button
                            text="+ Select an Emoji"
                            onClick={() => console.log("+ Select an Emoji")}
                            style={{
                              backgroundColor: "rgba(81, 105, 221, 0.1)",
                              color: "#5169DD",
                              border: "1px solid #5169DD",
                              borderRadius: "8px",
                              padding: "7px 10px 7px 7px",
                            }}
                          />
                        </div> */}
                      </Form>

                      {/* Margin Settings Section */}
                      <Form
                        className="mt-3 p-3"
                        style={{
                          background: "#F1F2F4",
                          borderRadius: "10px",
                        }}
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
                          Margin Settings
                        </h2>
                        <div className="colorgrid mt-3">
                          {[
                            { key: "top", label: "Top Margin" },
                            { key: "bottom", label: "Bottom Margin" },
                          ].map((margin) => (
                            <Form.Group className="mb-3" key={margin.label}>
                              <Form.Label className="inputtitle">{margin.label}</Form.Label>
                              <Form.Control
                                className="inputbox"
                                type="number"
                                placeholder="20"
                                value={margins[margin.key]}
                                onChange={(e) => handleMarginChange(margin.key, e.target.value)}
                                style={{ background: "white" }}
                              />
                            </Form.Group>
                          ))}
                        </div>
                      </Form>

                      {/* Card Settings Section */}
                      <Form
                        className="mt-3 p-3"
                        style={{
                          background: "#F1F2F4",
                          borderRadius: "10px",
                        }}
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
                          Card Settings
                        </h2>

                        <Form.Group className="mt-3 mb-3">
                          <Form.Label className="inputtitle">Corner Radius</Form.Label>
                          <Form.Control
                            type="text"
                            className="inputbox"
                            placeholder="20"
                            value={cornerRadius}
                            onChange={handleRadiusChange}
                            style={{ background: "white" }}
                          />
                        </Form.Group>
                      </Form>
                    </CardBody>
                  </Card>
                )}

                {selectedIndex === 3 && (
                  <Card className="border-0">
                    <CardBody className="d-flex flex-column gap-2">
                      {/* Date and Time Configuration */}
                      <Form
                        style={{
                          background: "#F1F2F4",
                          borderRadius: "10px",
                          padding: "10px 10px",
                        }}
                      >
                        {" "}
                        <Form.Group
                          className=" position-relative"
                          style={{
                            background: "#F1F2F4",
                            borderRadius: "10px",
                            padding: "0px 10px",
                            border: "none",
                          }}
                        >
                          <div className="d-flex flex-column gap-2 linewhite">
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
                              Plan Bundle
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
                              Fixed bundles deactivate ar a designated time | Evergreen bundles are available
                              indefinitely
                            </p>
                          </div>

                          <div className="position-relative mt-3">
                            <Form.Control
                              type="text"
                              value="Make it available for Long time"
                              readOnly
                              className="pe-5"
                              style={{
                                backgroundColor: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                paddingRight: "80px", // More space for both elements
                                padding: "15px 10px",
                                fontFamily: "Inter",
                                fontSize: "13px",
                              }}
                            />

                            {/* Switch */}
                            <div
                              className="position-absolute"
                              style={{
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            >
                              <Form.Check
                                type="switch"
                                id={`bundle-toggle`}
                                checked={toggles}
                                onChange={() => setToggles(!toggles)}
                                className="custom-switch-toggle"
                              />
                            </div>
                          </div>
                        </Form.Group>
                        {!toggles && (
                          <Row
                            style={{
                              background: "#fff",
                              borderRadius: "10px",
                              padding: "30px 8px",
                              margin: "15px",
                            }}
                          >
                            {/* Start Date Calendar */}
                            <Col md={12}>
                              <DatePicker
                                onDatePicked={(dateTimeValue) => {
                                  setStartDate(new Date(dateTimeValue));
                                }}
                                initialValue={startDate.toISOString().slice(0, 16)} // Format: "YYYY-MM-DDTHH:mm"
                                label={"Start Date & Time"}
                                helpText={"Select the start date and time"}
                              />

                              <div className="mt-3">
                                <DatePicker
                                  onDatePicked={(dateTimeValue) => {
                                    setEndDate(new Date(dateTimeValue));
                                  }}
                                  initialValue={endDate.toISOString().slice(0, 16)}
                                  label={"End Date & Time"}
                                  helpText={"Select the end date and time"}
                                  minValue={startDate.toISOString().slice(0, 16)} // Prevent end date/time before start
                                />
                              </div>
                            </Col>
                          </Row>
                        )}
                      </Form>
                    </CardBody>
                  </Card>
                )}

                {/* Step 5: Summary */}
                {selectedIndex === 4 && (
                  <Card className="border-0">
                    <CardBody>
                      <h2 className="cardtitle">Review Settings</h2>
                      <Form
                        className="mt-3 p-3"
                        style={{
                          background: "#F1F2F4",
                          borderRadius: "10px",
                        }}
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
                                {/* 4 Products */}
                                {selectedProducts?.length} Products
                              </p>
                            </div>
                          </div>
                          <Button
                            text={
                              <>
                                <img src={edit} width={12} height={12} /> Change Setting
                              </>
                            }
                            onClick={() => setSelectedIndex(0)} // Navigate to Discount Settings
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
                              <p className="carddesc">Bundel Product Discount</p>
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
                                {/* {discountType},{inputValue} */}
                                {discountType},{" "}
                                {discountType === "Percentage" ? inputValue + "%" : inputValue}
                              </p>
                            </div>
                          </div>
                          <Button
                            text={
                              <>
                                <img src={edit} width={12} height={12} /> Change Setting
                              </>
                            }
                            onClick={() => setSelectedIndex(1)}
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
                              <p className="carddesc">Product Placement</p>
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
                              <p className="carddesc">Plan Bundle</p>
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
                                <img src={edit} width={12} height={12} /> Change Setting
                              </>
                            }
                            onClick={() => setSelectedIndex(2)} // Navigate to Display Settings
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
                            <h2 className="cardtitle2">Bundle Setting</h2>
                            <div className="d-flex gap-2 align-items-center">
                              <p className="carddesc">Bundle status Settings</p>
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
                                {statusToggle}
                              </p>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                              <p className="carddesc">Bundle Title Settings</p>
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
                                {bundleTitle}
                              </p>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                              <p className="carddesc">Priority of Bundle Settings</p>
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
                                {bundlePriority}
                              </p>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                              <p className="carddesc">Apperance Settings</p>
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
                                {`${colorSettings["Border Color"]},
                                ${colorSettings["Button Color"]}, ${colorSettings["Countdown Timer background Color"]},
                                ${colorSettings["Countdown Timer Text Color"]}, ${colorSettings["Primary Background Color"]},
                                ${colorSettings["Primary Text Color"]}, ${colorSettings["Secondary Background Color"]},
                                ${colorSettings["Secondary Text Color"]}`}
                              </p>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                              <p className="carddesc">Marging Settings</p>
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
                                Top:{margins.top}, Bottom:{margins.bottom}
                              </p>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                              <p className="carddesc">Card Settings</p>
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
                                cornerRadius:{cornerRadius}
                              </p>
                            </div>
                          </div>
                          <Button
                            text={
                              <>
                                <img src={edit} width={12} height={12} /> Change Setting
                              </>
                            }
                            onClick={() => setSelectedIndex(3)} // Navigate to Bundle Settings
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
                        {isSaving
                          ? "Saving..."
                          : selectedIndex === tabs.length - 1
                            ? isEditing
                              ? "Update Bundle"
                              : "Confirm and Publish Bundle"
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
                position: "sticky",
                top: "10px",
                maxHeight: "calc(100vh - 40px)",
                overflowY: "auto",
                zIndex: 10,
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

                    {/* <div
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
                    </div> */}
                  </div>

                  <div
                    style={{
                      backgroundColor: colorSettings["Secondary Background Color"],
                      padding: "15px",
                      borderRadius: `${cornerRadius}px`,
                      position: "relative",
                      marginTop: `${margins.top}px`,
                      marginBottom: `${margins.bottom}px`,
                    }}
                  >
                    <h2
                      className="cardtitle"
                      style={{
                        color: colorSettings["Primary Text Color"],
                      }}
                    >
                      {bundleTitle || "Buy Together & Save More!🔥"}
                    </h2>

                    {showCountdown && (
                      <div
                        style={{
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
                          background: colorSettings["Countdown Timer background Color"],
                          border: `1px solid ${colorSettings["Border Color"]}`,
                          borderRadius: "8px 18px 8px 8px",
                          color: colorSettings["Countdown Timer Text Color"],
                          fontSize: "12px",
                          fontWeight: "500",
                          zIndex: 3,
                        }}
                      >
                        {showEmoji && "🔥 "}Ends In {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
                      </div>
                    )}

                    {/* Dynamically render selected products in preview */}
                    {selectedProducts.length > 0 && quantityBreaks.length > 0 ? (
                      quantityBreaks.map((breakItem, index) => {
                        const product = selectedProducts[0];
                        const { price, compareAtPrice } = getProductPrice(product.productId, index);
                        const defaultSelected = breakItem.default;
                        return (
                          <React.Fragment key={`${product.productId}-${index}`}>
                            {/* Product Item */}
                            <div
                              style={{
                                padding: "15px",
                                borderRadius: `${parseInt(cornerRadius) - 5}px`,
                                marginBottom: "15px",
                                backgroundColor: defaultSelected ? "#EAEDFB" : "white",
                                // colorSettings["Primary Background Color"],
                                // border: `1px solid ${colorSettings["Border Color"]}`,
                                border: `1px solid ${defaultSelected ? "#5169DD" : colorSettings["Border Color"]}`,
                              }}
                              className={`previewbox ${breakItem.default ? "active" : ""}`}
                              onClick={() => {
                                const newQuantityBreaks = [...quantityBreaks];
                                newQuantityBreaks.forEach((qb, i) => {
                                  if (i !== index) {
                                    qb.default = false;
                                  }
                                });
                                newQuantityBreaks[index].default = true;
                                setQuantityBreaks(newQuantityBreaks);
                              }}
                            >
                              <div className="d-flex flex-column">
                                <div className="d-flex align-items-center">
                                  <img
                                    src={product.media || tshirtp}
                                    alt={product.title}
                                    width={100}
                                    height={100}
                                    style={{
                                      borderRadius: "10px",
                                      marginRight: "15px",
                                      border: `1px solid ${colorSettings["Border Color"]}`,
                                    }}
                                  />
                                  <div className="w-100">
                                    <p
                                      style={{
                                        fontWeight: 600,
                                        fontSize: "13px",
                                        marginBottom: "5px",
                                        color: colorSettings["Primary Text Color"],
                                      }}
                                    >
                                      {product.title}
                                    </p>

                                    <div className="d-flex align-items-center justify-content-start gap-2 linrrow">
                                      <p
                                        style={{
                                          fontWeight: 600,
                                          fontSize: "14px",
                                          margin: 0,
                                          color: colorSettings["Primary Text Color"],
                                        }}
                                      >
                                        {currency}.{price}
                                      </p>
                                      {compareAtPrice != price && (
                                        <>
                                          <p
                                            style={{
                                              width: "1.5px",
                                              height: "10px",
                                              background: colorSettings["Primary Text Color"],
                                              opacity: 0.3,
                                            }}
                                          ></p>
                                          <p
                                            style={{
                                              color: colorSettings["Secondary Text Color"],
                                              fontSize: "12px",
                                              textDecoration: "line-through",
                                              margin: 0,
                                            }}
                                          >
                                            {currency}.{compareAtPrice}
                                          </p>
                                          {/* badge displaying discount percentage */}
                                          <span
                                            style={{
                                              background:
                                                // colorSettings[
                                                //   "Countdown Timer background Color"
                                                // ],
                                                "#5169DD",
                                              color: colorSettings["Countdown Timer Text Color"],
                                              padding: "5px",
                                              borderRadius: "8px",
                                              fontSize: "15px",
                                            }}
                                          >
                                            {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
                                            OFF
                                          </span>
                                        </>
                                      )}
                                    </div>

                                    <p
                                      className="pt-2"
                                      style={{
                                        color: "#303030",
                                        // colorSettings["Secondary Text Color"],
                                        fontSize: "13px",
                                        margin: 0,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {breakItem.name
                                        .replace("[quantity]", breakItem.quantity)
                                        .replace(
                                          "[discount]",
                                          discountType == "Percentage"
                                            ? `${breakItem.discount}%`
                                            : `${currency}.${breakItem.discount}`
                                        )}
                                    </p>
                                  </div>
                                </div>
                                {product.optionSelections && product.optionSelections.length > 0 && (
                                  <div className="mt-2">
                                    {product.optionSelections.map((option, optIdx) => {
                                      if (option.values.length === 1) return;
                                      return (
                                        <div
                                          key={`${option.name}-${optIdx}`}
                                          style={{ marginBottom: "10px" }}
                                        >
                                          <label
                                            style={{
                                              fontSize: "12px",
                                              fontWeight: "500",
                                              color: colorSettings["Secondary Text Color"],
                                              marginBottom: "4px",
                                              display: "block",
                                            }}
                                          >
                                            {option.name}
                                          </label>
                                          <div
                                            style={{
                                              position: "relative",
                                            }}
                                          >
                                            {option.values.length === 1 ? (
                                              option.values.map((value, vIdx) => (
                                                <span
                                                  style={{
                                                    right: "15px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    pointerEvents: "none",
                                                    fontSize: "10px",
                                                  }}
                                                >
                                                  {value}
                                                </span>
                                              ))
                                            ) : (
                                              <>
                                                <select
                                                  className="form-select"
                                                  onChange={(e) =>
                                                    handlePreviewOptionChange(
                                                      product.productId,
                                                      option.name,
                                                      e.target.value
                                                    )
                                                  }
                                                  style={{
                                                    fontSize: "12px",
                                                    background: colorSettings["Secondary Background Color"],
                                                    color: colorSettings["Primary Text Color"],
                                                    padding: "8px 12px",
                                                    borderRadius: "8px",
                                                    border: `1px solid ${colorSettings["Border Color"]}`,
                                                    width: "100%",
                                                    appearance: "none",
                                                    WebkitAppearance: "none",
                                                    MozAppearance: "none",
                                                  }}
                                                >
                                                  {option.values.map((value, vIdx) => (
                                                    <option key={`value-${vIdx}`}>{value}</option>
                                                  ))}
                                                </select>
                                                <span
                                                  style={{
                                                    position: "absolute",
                                                    right: "15px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    pointerEvents: "none",
                                                    fontSize: "10px",
                                                    color: colorSettings["Primary Text Color"],
                                                  }}
                                                >
                                                  <CaretDownFill />
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          padding: "30px 15px",
                          textAlign: "center",
                          backgroundColor: colorSettings["Primary Background Color"],
                          borderRadius: `${parseInt(cornerRadius) - 5}px`,
                          border: `1px solid ${colorSettings["Border Color"]}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: "14px",
                            color: colorSettings["Secondary Text Color"],
                          }}
                        >
                          No products selected. Add products to see the preview.
                        </p>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="d-flex flex-column gap-2">
                      <div
                        className="d-flex align-items-center justify-content-between gap-2"
                        style={{
                          background: colorSettings["Primary Background Color"],
                          border: `1px solid ${colorSettings["Border Color"]}`,
                          borderRadius: `${parseInt(cornerRadius) - 5}px`,
                          padding: "20px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontFamily: "Inter",
                              fontStyle: "normal",
                              fontWeight: "600",
                              fontSize: "15px",
                              lineHeight: "100%",
                              color: colorSettings["Primary Text Color"],
                              margin: 0,
                            }}
                          >
                            Total
                          </p>
                          {bundlePricing.discountPercentage > 0 && (
                            <p
                              style={{
                                fontFamily: "Inter",
                                fontStyle: "normal",
                                fontWeight: "500",
                                fontSize: "11px",
                                lineHeight: "100%",
                                color: colorSettings["Countdown Timer background Color"],
                                margin: "5px 0 0 0",
                              }}
                            >
                              Save {bundlePricing.discountPercentage}% ({currency}.
                              {bundlePricing.saved})
                            </p>
                          )}
                        </div>

                        <div className="text-end">
                          <p
                            style={{
                              fontFamily: "Inter",
                              fontStyle: "normal",
                              fontWeight: "600",
                              fontSize: "15px",
                              lineHeight: "100%",
                              color: colorSettings["Primary Text Color"],
                              margin: 0,
                            }}
                          >
                            {currency}.{bundlePricing.finalPrice}
                          </p>
                          {bundlePricing.discountPercentage > 0 && (
                            <p
                              style={{
                                fontFamily: "Inter",
                                fontStyle: "normal",
                                fontWeight: "500",
                                fontSize: "11px",
                                textDecoration: "line-through",
                                color: colorSettings["Secondary Text Color"],
                                margin: "5px 0 0 0",
                              }}
                            >
                              {currency}.{bundlePricing.compareAtPrice}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        text="Add To Cart"
                        onClick={handleBack}
                        style={{
                          backgroundColor: colorSettings["Button Color"],
                          color: "white",
                          border: "none",
                          borderRadius: `${parseInt(cornerRadius) - 5}px`,
                          borderRadius: `${15}px`,
                          padding: "15px 25px",
                          fontSize: "15px",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      />
                      <Button
                        text="Skip Offer"
                        onClick={handleBack}
                        style={{
                          backgroundColor: colorSettings["Secondary Background Color"],
                          color: colorSettings["Primary Text Color"],
                          border: `1px solid ${colorSettings["Border Color"]}`,
                          borderRadius: `${parseInt(cornerRadius) - 5}px`,
                          padding: "15px 25px",
                          fontSize: "15px",
                          display: "flex",
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
      ) : (
        <Products
          onClose={handleCloseProducts}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          setVariantPricing={setVariantPricing}
        />
      )}
    </>
  );
});

export default volumeDiscountActions;
