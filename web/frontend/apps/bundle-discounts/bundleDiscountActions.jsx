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
import DatePicker from "../../components/DatePicker";

const BundleDiscountActions = React.forwardRef(({ onSuccess, editData }, ref) => {
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
    "Button Color": "#000000",
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
  const [margins, setMargins] = useState({
    top: 20,
    bottom: 20,
  });
  const [cornerRadius, setCornerRadius] = useState("20");
  const [bundlePriority, setBundlePriority] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  // Add countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: "23",
    minutes: "59",
    seconds: "59",
  });
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [products, setProducts] = useState([]); // Add products state
  useEffect(() => {
    getProducts();
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
  // Initialize form with edit data if provided
  useEffect(() => {
    if (editData) {
      setIsEditing(true);
      // Populate form fields with existing data
      setBundleTitle(editData.title || "");
      setBundleInternalName(editData.internalName || "");
      setBundlePriority(editData.bundlePriority || 0);
      setStatusToggle(editData.status || false);
      setDiscountType(editData.discountType || "");
      setInputValue(String(editData.discountValue) || "");

      // Set products if available
      if (editData.products) {
        setSelectedProducts(editData.products);
      }

      // Set widget appearance settings
      if (editData.widgetAppearance) {
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
    }
  }, [editData]);
  useEffect(() => {
    if (selectedProducts && selectedProducts.length > 0 && products.length > 0) {
      calculateVariantPricing();
    }
  }, [selectedProducts, products, discountType, inputValue]);

  // Same cartesian product function as in Products component
  const cartesianProduct = (arrays) => {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0].map((value) => [value]);

    return arrays.reduce(
      (acc, curr) => {
        const res = [];
        acc.forEach((a) => {
          curr.forEach((b) => {
            res.push([...a, b]);
          });
        });
        return res;
      },
      [[]]
    );
  };

  // Calculate variant pricing using the same logic as Products component
  const calculateVariantPricing = () => {
    if (!selectedProducts || selectedProducts.length === 0 || products.length === 0) return;

    const variantTitles = [];

    selectedProducts.forEach((product) => {
      // Find the full product details from products state
      const productDetails = products.find(({ node }) => node.id === product.productId)?.node;

      if (!productDetails) {
        console.warn(`Product details not found for productId: ${product.productId}`);
        return;
      }

      const optionValues = product.optionSelections.map((opt) => opt.values);
      const combinations = cartesianProduct(optionValues);

      combinations.forEach((combo) => {
        let title = combo.join(" / ");

        // Find the variant that matches this combination
        const variant = productDetails.variants.nodes.find((variant) => variant.title === title);

        if (variant) {
          let finalPrice = parseFloat(variant.price) || 0;
          let originalPrice = parseFloat(variant.price) || 0;

          // Apply discount based on discountType and inputValue
          if (discountType === "Percentage" && inputValue) {
            const percentage = parseFloat(inputValue.replace("%", "")) || 0;
            finalPrice = originalPrice * (1 - percentage / 100);
          } else if (discountType === "Fixed Amount" && inputValue) {
            const discount = parseFloat(inputValue) / selectedProducts.length || 0;
            finalPrice = Math.max(0, originalPrice - discount);
          }

          variantTitles.push({
            productId: product.productId,
            title: title,
            price: finalPrice,
            compareAtPrice: originalPrice,
            variantId: variant.id,
          });
        } else {
          console.warn(`Variant not found for combination: ${title}`);
        }
      });
    });

    console.log("Calculated variant pricing:", variantTitles);
    setVariantPricing(variantTitles);
  };

  // Enhanced getProductPrice function
  const getProductPrice = (productId) => {
    const productVariantTitle = previewProductsSelectedOptions[productId]?.title;

    if (!productVariantTitle) {
      return { price: 0, compareAtPrice: 0 };
    }

    const product = variantPricing.find((p) => p.productId === productId && p.title === productVariantTitle);

    if (product) {
      return {
        price: product.price,
        compareAtPrice: product.compareAtPrice,
      };
    }

    // Fallback: find any variant for this product
    const fallbackProduct = variantPricing.find((p) => p.productId === productId);
    if (fallbackProduct) {
      return {
        price: fallbackProduct.price,
        compareAtPrice: fallbackProduct.compareAtPrice,
      };
    }

    return { price: 0, compareAtPrice: 0 };
  };

  // Update calculateTotalPrice to use the new structure
  const calculateTotalPrice = () => {
    let total = 0;
    let originalTotal = 0;

    selectedProducts.forEach((product) => {
      const { price, compareAtPrice } = getProductPrice(product.productId);
      total += price;
      originalTotal += compareAtPrice;
    });

    return {
      finalPrice: total.toFixed(2),
      compareAtPrice: originalTotal.toFixed(2),
      saved: (originalTotal - total).toFixed(2),
      discountPercentage: originalTotal > 0 ? Math.round(((originalTotal - total) / originalTotal) * 100) : 0,
    };
  };

  // Recalculate when preview options change
  useEffect(() => {
    if (selectedProducts && selectedProducts.length > 0) {
      calculateVariantPricing();
    }
  }, [previewProductsSelectedOptions]);
  async function getProducts() {
    try {
      const response = await fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      console.log("Products data in BundleDiscountActions:", data.data.products.edges);
      const edges = data.data.products.edges || [];
      setProducts(edges);
    } catch (error) {
      console.log("GetProductsError in BundleDiscountActions", error);
    }
  }
  const handleSelectChange = (e) => {
    const value = e.target.value;
    setDiscountType(value);
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

      if (!inputValue || isNaN(inputValue) || inputValue <= 0) {
        shopify.toast.show("Please enter a valid discount value.", {
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
      const internalNameToUse =
        bundleInternalName && bundleInternalName.trim() !== ""
          ? bundleInternalName.trim()
          : bundleTitle.trim();
      const bundleData = {
        title: bundleTitle,
        products: selectedProducts,
        discountType: discountType,
        discountValue: inputValue,
        status: statusToggle,
        internalName: internalNameToUse,
        type: "Bundle Discount",
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
      const url = isEditing ? `/api/bundles/${editData._id}` : "/api/bundles";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bundleData),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Bundle " + (isEditing ? "updated" : "created") + " successfully:", data);
        shopify.toast.show(`Bundle ${isEditing ? "updated" : "created"} successfully!`, {
          duration: 5000,
          style: {
            backgroundColor: "#4CAF50",
            color: "#fff",
            fontSize: "16px",
          },
        });
        if (onSuccess) {
          onSuccess(); // This will set showAction to false and return to DiscountList
        }
      } else {
        console.error("Error " + (isEditing ? "updating" : "creating") + " bundle");
        shopify.toast.show(
          `Oops! Something went wrong while ${isEditing ? "updating" : "creating"} the bundle.`,
          {
            duration: 5000,
            style: {
              backgroundColor: "#f44336",
              color: "#fff",
              fontSize: "16px",
            },
          }
        );
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
    selectedProducts.forEach((product) => {
      defaultOptions[product.productId] = { options: {} };
      product.optionSelections.forEach((option) => {
        defaultOptions[product.productId].options[option.name] = option.values[0];
        if (!defaultOptions[product.productId].title) {
          defaultOptions[product.productId].title = [];
        }
        defaultOptions[product.productId].title.push(option.values[0]);
      });
      defaultOptions[product.productId].title = defaultOptions[product.productId].title.join(" / ");
    });
    setPreviewProductsSelectedOptions(defaultOptions);
  }, [selectedProducts]);

  const handlePreviewOptionChange = (productId, optionName, value) => {
    setPreviewProductsSelectedOptions((prev) => {
      const updatedOptions = { ...prev };
      if (!updatedOptions[productId]) {
        updatedOptions[productId] = { options: {} };
      }
      updatedOptions[productId].options[optionName] = value;
      if (!updatedOptions[productId].title) {
        updatedOptions[productId].title = [];
      }
      // return an array with option values only
      updatedOptions[productId].title = Object.keys(updatedOptions[productId].options).map(
        (key) => updatedOptions[productId].options[key]
      );
      updatedOptions[productId].title = updatedOptions[productId].title.join(" / ");
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
  // const getProductPrice = (productId) => {
  //   const product = variantPricing.find(
  //     (p) => p.productId === productId && p.title === previewProductsSelectedOptions[productId]?.title
  //   );
  //   if (product) {
  //     // calculate discount price if discountType is defined
  //     let price = null;
  //     if (discountType === "Percentage" && inputValue) {
  //       console.log(" getProductPrice | product:", product);
  //       console.log(" inputValue | inputValue:", inputValue);
  //       console.log(" discountType | discountType:", discountType);
  //       const percentage = parseFloat(inputValue.replace("%", "")) || 0;
  //       price = product.price * (1 - percentage / 100);
  //     } else if (discountType === "Fixed Amount" && inputValue) {
  //       const discount = parseFloat(inputValue) / selectedProducts.length || 0;
  //       price = Math.max(0, product.price - discount);
  //     } else {
  //       price = product.price;
  //     }
  //     return {
  //       price: price,
  //       compareAtPrice: product.price,
  //     };
  //   }
  //   return { price: 0, compareAtPrice: 0 };
  // };

  // Function to calculate total bundle price
  // const calculateTotalPrice = () => {
  //   let total = 0;
  //   let originalTotal = 0;

  //   selectedProducts.forEach((product) => {
  //     const { price, compareAtPrice } = getProductPrice(product.productId);
  //     total += price;
  //     originalTotal += compareAtPrice;
  //   });

  //   // Apply discount based on selectedType and inputValue
  //   // let finalPrice = total;
  //   // if (discountType === "Percentage" && inputValue) {
  //   // 	const percentage = parseFloat(inputValue.replace('%', '')) || 0;
  //   // 	finalPrice = total * (1 - percentage / 100);
  //   // } else if (discountType === "Fixed Amount" && inputValue) {
  //   // 	const discount = parseFloat(inputValue) || 0;
  //   // 	console.log(" calculateTotalPrice | discount:", discount)
  //   // 	finalPrice = Math.max(0, total - discount);
  //   // }

  //   return {
  //     finalPrice: total.toFixed(2),
  //     compareAtPrice: originalTotal.toFixed(2),
  //     saved: (originalTotal - total).toFixed(2),
  //     discountPercentage: Math.round(((originalTotal - total) / originalTotal) * 100),
  //   };
  // };

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
  return (
    <>
      {!showProductPage ? (
        <Container fluid className="" style={{ margin: "0 auto", height: "auto" }}>
          {/* Step Navigation */}
          <Row
            className="justify-content-center mb-2" // centers inside the row
            style={{
              padding: "4px",
              boxShadow: "1px 1px 4px 0px #0000001A inset",
              backgroundColor: "#fff",
              borderRadius: "16px", // unified radius for wrapper
            }}
          >
            {/* <Col xs="auto" className="p-1"> */}
            <Col xs="" className="p-1">
              {/* auto width, keeps center */}
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
                      className="d-flex align-items-center"
                    >
                      <span>{String(idx + 1).padStart(2, "0")}</span>
                      <div
                        style={{
                          width: "1.5px",
                          height: "10px",
                          background: selectedIndex === idx || idx < selectedIndex ? "white" : "#222",
                          opacity: selectedIndex === idx || idx < selectedIndex ? 0.2 : 0.1,
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
                  // boxShadow: "1px 1px 4px 0px #0000001A inset",
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
                        <div style={{ width: "80%" }}>
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

                        {/* Right Input */}
                        <div style={{ width: "20%" }}>
                          <Form.Label className="inputtitle mb-1 invisible">Value</Form.Label>{" "}
                          {/* keeps height aligned */}
                          <Form.Control
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="discountdropdownselect custom-dropdown"
                            style={{
                              fontFamily: "Inter",
                              fontWeight: "600",
                              fontSize: "15px",
                              lineHeight: "100%",
                            }}
                          />
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
                              {toggles
                                ? "Evergreen bundles are available indefinitely with daily countdown"
                                : "Fixed bundles deactivate at a designated time"}
                            </p>
                          </div>
                          <div className="position-relative mt-3">
                            <Form.Control
                              type="text"
                              value={toggles ? "Make it available for Long time" : "Set specific dates"}
                              readOnly
                              className="pe-5"
                              style={{
                                backgroundColor: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                paddingRight: "80px",
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
                                onChange={() => {
                                  setToggles(!toggles);
                                  // If enabling long-term, set end date to far future
                                  if (!toggles) {
                                    const farFuture = new Date();
                                    farFuture.setFullYear(farFuture.getFullYear() + 10); // 10 years from now
                                    setEndDate(farFuture);
                                  }
                                }}
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
                            <Col md={12}>
                              <DatePicker
                                onDatePicked={(dateTimeValue) => {
                                  setStartDate(new Date(dateTimeValue));
                                }}
                                initialValue={startDate.toISOString().slice(0, 16)}
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
                                  minValue={startDate.toISOString().slice(0, 16)}
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
                            onClick={() => setSelectedIndex(3)}
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
                                {statusToggle ? "Active" : "Inactive"}
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
                            onClick={() => setSelectedIndex(2)}
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

                  {/* Dynamic Preview Sections */}
                  <div
                    style={{
                      backgroundColor: colorSettings["Secondary Background Color"],
                      padding: "15px",
                      borderRadius: "18px",
                      position: "relative",
                      marginTop: `${margins.top}px`,
                      marginBottom: `${margins.bottom}px`,
                      borderRadius: `${cornerRadius}px`,
                    }}
                  >
                    {/* Bundle Title with dynamic colors */}
                    <h2
                      className="cardtitle"
                      style={{
                        color: colorSettings["Primary Text Color"],
                        marginBottom: "15px",
                      }}
                    >
                      {bundleTitle || "Buy Together & Save More!🔥"}
                    </h2>

                    {/* Countdown Timer (only shows if enabled) */}
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
                    {selectedProducts.length > 0 ? (
                      selectedProducts.map((product, index) => {
                        // Get pricing information for this product
                        const { price, compareAtPrice } = getProductPrice(product.productId);

                        return (
                          <React.Fragment key={product.productId || index}>
                            {/* Product Item */}
                            <div
                              style={{
                                padding: "15px",
                                borderRadius: "12px",
                                marginBottom: "15px",
                                backgroundColor: colorSettings["Primary Background Color"],
                                border: `1px solid ${colorSettings["Border Color"]}`,
                              }}
                              className="previewbox"
                            >
                              <div className="d-flex flex-column">
                                <div className="d-flex align-items-center">
                                  <img
                                    src={product.media || tshirtp}
                                    alt={product.title}
                                    width={100}
                                    height={100}
                                    style={{
                                      borderRadius: "8px",
                                      marginRight: "15px",
                                      border: `1px solid ${colorSettings["Border Color"]}`,
                                    }}
                                  />
                                  <div className="w-100">
                                    <p
                                      style={{
                                        fontWeight: 600,
                                        fontSize: "14px",
                                        marginBottom: "5px",
                                        color: colorSettings["Primary Text Color"],
                                      }}
                                    >
                                      {product.title}
                                    </p>

                                    <div className="d-flex align-items-center justify-content-start gap-2">
                                      <p
                                        style={{
                                          fontWeight: 600,
                                          fontSize: "14px",
                                          margin: 0,
                                          color: colorSettings["Primary Text Color"],
                                        }}
                                      >
                                        Rs.{price}
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
                                              color: "#999",
                                              fontSize: "12px",
                                              textDecoration: "line-through",
                                              margin: 0,
                                            }}
                                          >
                                            Rs.{compareAtPrice}
                                          </p>
                                        </>
                                      )}
                                    </div>
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

                            {/* Add plus sign between products, except after the last one */}
                            {index < selectedProducts.length - 1 && (
                              <div
                                style={{
                                  position: "relative",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  marginTop: "-25px",
                                  marginBottom: "-10px",
                                  zIndex: 1,
                                }}
                              >
                                <div
                                  style={{
                                    width: "29.9px",
                                    height: "29.9px",
                                    background: colorSettings["Button Color"],
                                    color: "white",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    border: `2px solid ${colorSettings["Secondary Background Color"]}`,
                                    padding: "15px",
                                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  +
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          padding: "30px 15px",
                          textAlign: "center",
                          backgroundColor: colorSettings["Primary Background Color"],
                          borderRadius: "12px",
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
                          borderRadius: "12px",
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
                              Save {bundlePricing.discountPercentage}% (Rs.
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
                            Rs.{bundlePricing.finalPrice}
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
                              Rs.{bundlePricing.compareAtPrice}
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
                          borderRadius: "12px",
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
                          borderRadius: "12px",
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
      {/* {showProductPage ? <Products onClose={handleCloseProducts} />} */}
    </>
  );
});
export default BundleDiscountActions;
