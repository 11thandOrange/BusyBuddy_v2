import React, { useEffect, useState } from "react";
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

export default function BundleDiscountActions() {
  const shopify = useAppBridge();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [variantPricing, setVariantPricing] = useState([]);
  const [isBundleActive, setIsBundleActive] = useState(true);
  const [colorSettings, setColorSettings] = useState({
    "Primary Text Color": "#ff0000",
    "Secondary Text Color": "#000000",
    "Primary Background Color": "#cccccc",
    "Secondary Background Color": "#f1f2f4",
    "Border Color": "#FFFFFF",
    "Button Color": "#000000",
    "Offer Tag Background Color": "#C4290E",
    "Offer Tag Text Color": "#FFFFFF",
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
  const [bundleTitle, setBundleTitle] = useState("");
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
  const handleSelectChange = (e) => {
    const value = e.target.value;
    setDiscountType(value);

    // if (value === "Percentage") {
    //   setInputValue("%");
    // } else if (value === "Fixed Amount") {
    //   setInputValue("499");
    // } else if (value === "Free Gift") {
    //   setInputValue("Rs 0");
    // } else {
    //   setInputValue("");
    // }
  };
  const handleVariationChange = (event) => {
    setSelectedVariation(event.target.value);
  };
  const [toggles, setToggles] = useState([true, true, true, true]);

  const handleToggleChange = (index) => {
    setToggles((prev) => prev.map((toggled, i) => (i === index ? !toggled : toggled)));
  };

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
      const bundleData = {
        title: bundleTitle,
        products: selectedProducts,
        discountType: discountType,
        discountValue: inputValue,
        status: statusToggle,
        internalName: bundleInternalName,
        type: "Bundle Discount",
        bundlePriority: bundlePriority,
        widgetAppearance: {
          primaryTextColor: colorSettings["Primary Text Color"],
          secondaryTextColor: colorSettings["Secondary Text Color"],
          PrimaryBackgroundColor: colorSettings["Primary Background Color"],
          secondaryBackgroundColor: colorSettings["Secondary Background Color"],
          borderColor: colorSettings["Border Color"],
          buttonColor: colorSettings["Button Color"],
          offerTagBackgroundColor: colorSettings["Offer Tag Background Color"],
          offerTagTextColor: colorSettings["Offer Tag Text Color"],
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
      const response = await fetch("/api/bundles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bundleData),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Bundle created successfully:", data);
        shopify.toast.show("Bundle created successfully!", {
          duration: 5000,
          style: {
            backgroundColor: "#4CAF50",
            color: "#fff",
            fontSize: "16px",
          },
        });
        open("shopify://admin/products", "_top");
      } else {
        console.error("Error creating bundle");
        shopify.toast.show("Oops! Something went wrong.", {
          duration: 5000,
          style: {
            backgroundColor: "#f44336",
            color: "#fff",
            fontSize: "16px",
          },
        });
      }
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

  useEffect(() => {
    console.log("preview options", previewProductsSelectedOptions);
  }, [previewProductsSelectedOptions]);

  useEffect(() => {
    console.log("variant price", variantPricing);
  }, [variantPricing]);

  // Add this function to calculate price for a specific product
  const getProductPrice = (productId) => {
    const product = variantPricing.find(
      (p) => p.productId === productId && p.title === previewProductsSelectedOptions[productId]?.title
    );
    if (product) {
      // calculate discount price if discountType is defined
      let price = null;
      if (discountType === "Percentage" && inputValue) {
        const percentage = parseFloat(inputValue.replace("%", "")) || 0;
        price = product.price * (1 - percentage / 100);
      } else if (discountType === "Fixed Amount" && inputValue) {
        const discount = parseFloat(inputValue) / selectedProducts.length || 0;
        price = Math.max(0, product.price - discount);
      } else {
        price = product.price;
      }
      return {
        price: price,
        compareAtPrice: product.price,
      };
    }
    return { price: 0, compareAtPrice: 0 };
  };

  // Function to calculate total bundle price
  const calculateTotalPrice = () => {
    let total = 0;
    let originalTotal = 0;

    selectedProducts.forEach((product) => {
      const { price, compareAtPrice } = getProductPrice(product.productId);
      total += price;
      originalTotal += compareAtPrice;
    });

    // Apply discount based on selectedType and inputValue
    // let finalPrice = total;
    // if (discountType === "Percentage" && inputValue) {
    // 	const percentage = parseFloat(inputValue.replace('%', '')) || 0;
    // 	finalPrice = total * (1 - percentage / 100);
    // } else if (discountType === "Fixed Amount" && inputValue) {
    // 	const discount = parseFloat(inputValue) || 0;
    // 	console.log(" calculateTotalPrice | discount:", discount)
    // 	finalPrice = Math.max(0, total - discount);
    // }

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
  return (
    <>
      {!showProductPage ? (
        <Container fluid className="" style={{ margin: "0 auto", height: "auto" }}>
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
                              <option value="Free Gift" disabled>
                                Free Gift
                              </option>
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
                      <div className="d-flex flex-nowrap gap-1 align-items-center justify-content-start px-2 py-2 mt-2">
                        <Form.Check
                          type="checkbox"
                          className="custom-checkbox"
                          checked={showCountdown}
                          onChange={() => setShowCountdown(!showCountdown)}
                          label={<span style={{ marginLeft: "6px", marginTop: "5px" }}>Free Shipping</span>}
                          style={{
                            fontFamily: "Inter",
                            fontStyle: "bold",
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "#303030",
                            whiteSpace: "nowrap",
                          }}
                        />

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
                            fontStyle: "normal",
                            fontWeight: 500,
                            fontSize: "14px",
                            color: "#616161",
                            margin: 0,
                            whiteSpace: "wrap",

                            textOverflow: "ellipsis",
                            maxWidth: "800px", // Adjust as needed
                          }}
                        >
                          Customers are eligible for complimentary shipping on all orders placed within this
                          bundled discount offer.
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {selectedIndex === 2 && (
                  <Card className="border-0">
                    <CardBody>
                      {/* Bundle Status Section */}
                      <Form className="mt-3 p-3" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
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
                              Get Noticed! Want to make sure your message doesn't get missed? Announcement Bar
                              lets you display important alerts right at the top of your store. Whether it's a
                              sale, promotion, or update, it's impossible to ignore!
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
                      <Form className="mt-3 p-3" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
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
                            {Object.keys(colorSettings).map((key) => (
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
                            ))}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
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
                        <div className="d-flex align-items-center justify-content-between gap-2">
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
                        </div>
                      </Form>

                      {/* Margin Settings Section */}
                      <Form className="mt-3 p-3" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
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
                      <Form className="mt-3 p-3" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
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
                      <Form.Group
                        className="position-relative"
                        style={{
                          background: "#F1F2F4",
                          borderRadius: "10px",
                          padding: "10px 20px",
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
                            Placements
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
                            Choose where to display this bundle.
                          </p>
                        </div>
                        <Form.Label className="inputtitle mt-3">Select Variation</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            as="select"
                            className="pe-5"
                            style={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #ccc",
                              borderRadius: "8px",
                              paddingRight: "40px",
                              border: "none",
                              padding: "15px 10px",
                            }}
                            value={selectedVariation} // Step 3: Bind the value to the state variable
                            onChange={handleVariationChange} // Step 4: Set the onChange handler
                          >
                            <option value="productPages">Select the bundle on the product pages</option>
                            <option value="fixed_discount">Fixed Discount</option>
                            <option value="buy_x_get_y">Buy X Get Y</option>
                          </Form.Control>
                          <span
                            className="dropdown-icon position-absolute"
                            style={{
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          >
                            <img src={dropdown} alt="Dropdown Icon" />
                          </span>
                        </div>
                      </Form.Group>
                      <Form.Group
                        className=" position-relative"
                        style={{
                          background: "#F1F2F4",
                          borderRadius: "10px",
                          padding: "10px 20px",
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
                            Embed the bundle anywhere
                          </h2>
                        </div>
                        <Form.Label className="inputtitle mt-3">
                          Display this bundle anywhere by placing this HTML Tag in your theme file.
                        </Form.Label>

                        <div className="position-relative mt-3">
                          <Form.Control
                            type="text"
                            value='<div data-revy-bundle-id="5a030243-265-4570-8122-613bcca82421"></div>'
                            readOnly
                            className="pe-5"
                            style={{
                              backgroundColor: "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              paddingRight: "40px",
                              padding: "15px 10px",
                              fontFamily: "Inter",
                              fontSize: "13px",
                            }}
                          />
                          <span
                            className="dropdown-icon position-absolute"
                            style={{
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontFamily: "Inter",
                              fontWeight: 600,
                              fontSize: "15px",
                              color: "#222222",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              navigator.clipboard.writeText(
                                '<div data-revy-bundle-id="5a030243-265-4570-8122-613bcca82421"></div>'
                              );
                            }}
                          >
                            Copy{" "}
                            <Copy
                              style={{
                                width: "12.5px",
                                height: "12.5px",
                                color: "#222222",
                                fontWeight: "bold",
                              }}
                            />
                          </span>
                        </div>
                        <p
                          className="mt-3"
                          style={{
                            fontFamily: "Inter",
                            fontStyle: "normal",
                            fontWeight: "500",
                            fontSize: "13px",
                            lineHeight: "100%",
                            color: "#616161",
                          }}
                        >
                          Bundle ID. Se030243-1265-4010-122-e13bcca82421
                        </p>

                        <p
                          className="mt-3"
                          style={{
                            fontFamily: "Inter",
                            fontStyle: "normal",
                            fontWeight: "500",
                            fontSize: "13px",
                            lineHeight: "100%",
                            color: "#616161",
                            display: "flex",
                            gap: "2px",
                          }}
                        >
                          <img src={learnmore} width={15} height={15} />
                          Learn More about embed in specific pages
                        </p>
                      </Form.Group>

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
                                paddingRight: "40px",
                                padding: "15px 10px",
                                fontFamily: "Inter",
                                fontSize: "13px",
                              }}
                            />
                            <span
                              className="dropdown-icon position-absolute"
                              style={{
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontFamily: "Inter",
                                fontWeight: 600,
                                fontSize: "15px",
                                color: "#222222",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                navigator.clipboard.writeText("Make it available for Long time");
                              }}
                            >
                              <Form.Check
                                type="switch"
                                id={`bundle-toggle`}
                                checked={toggles}
                                onChange={() => handleToggleChange()}
                                className="custom-switch-toggle"
                              />
                            </span>
                          </div>
                        </Form.Group>
                        <Row
                          style={{
                            background: "#fff",
                            borderRadius: "10px",
                            padding: "30px 8px",
                            margin: "15px",
                          }}
                        >
                          {/* Start Date Calendar */}
                          <Col md={7}>
                            <Form.Group>
                              <Calendar
                                onChange={setStartDate}
                                value={startDate}
                                className="border-0"
                                showDoubleView
                              />
                            </Form.Group>
                          </Col>

                          {/* Inputs Section */}
                          <Col md={5}>
                            <Form.Group>
                              <Form.Label className="inputtitle">Start Date</Form.Label>
                              <Form.Control
                                type="text"
                                value={startDate?.toLocaleDateString() || ""}
                                readOnly
                                style={{ backgroundColor: "#f5f5f5" }}
                                className="inputbox2"
                              />
                            </Form.Group>

                            <Form.Group className="mt-3">
                              <Form.Label className="inputtitle">End Date</Form.Label>
                              <Form.Control
                                type="text"
                                value={endDate?.toLocaleDateString() || ""}
                                onChange={(e) => setEndDate(new Date(e.target.value))}
                                style={{ backgroundColor: "#f5f5f5" }}
                                className="inputbox2"
                              />
                            </Form.Group>

                            <Form.Group className="mt-3">
                              <Form.Label className="inputtitle">Timezone</Form.Label>
                              <Form.Select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                style={{ backgroundColor: "#f5f5f5" }}
                                className="inputbox2"
                              >
                                <option value="">Select Timezone</option>
                                <option value="America/New_York">America/New_York</option>
                                <option value="Europe/London">Europe/London</option>
                                <option value="Asia/Kolkata">Asia/Kolkata</option>
                                <option value="Asia/Tokyo">Asia/Tokyo</option>
                                <option value="Australia/Sydney">Australia/Sydney</option>
                              </Form.Select>
                            </Form.Group>

                            <div className="mt-4 d-flex gap-2">
                              <Button
                                text="Cancel"
                                onClick={() => console.log("Cancel")}
                                className="cancelbtn ms-2"
                              />

                              <Button
                                text="Save Changes"
                                onClick={() => console.log("Save Changes")}
                                className="savebtn"
                              />
                            </div>
                          </Col>
                        </Row>
                      </Form>
                    </CardBody>
                  </Card>
                )}

                {/* Step 5: Summary */}
                {selectedIndex === 4 && (
                  <Card className="border-0">
                    <CardBody>
                      <h2 className="cardtitle">Review Settings</h2>
                      <Form className="mt-3 p-3" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
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
                                ${colorSettings["Button Color"]}, ${colorSettings["Offer Tag Background Color"]},
                                ${colorSettings["Offer Tag Text Color"]}, ${colorSettings["Primary Background Color"]},
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
                      backgroundColor: colorSettings["Secondary Background Color"],
                      padding: "15px",
                      borderRadius: "18px",
                      position: "relative",
                    }}
                  >
                    <h2 className="cardtitle">Bought together and save more!🔥</h2>
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
                        background: colorSettings["Offer Tag Background Color"],
                        border: `1px solid ${colorSettings["Offer Tag Background Color"]}`,
                        borderRadius: "8px 18px 8px 8px",
                        color: colorSettings["Offer Tag Text Color"],
                        fontSize: "12px",
                        fontWeight: "500",
                        zIndex: 3,
                      }}
                    >
                      Ends In 23 10 10
                    </div>

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
                                borderRadius: "18px",
                                marginBottom: "15px",
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
                                      {product.title}
                                    </p>

                                    <div className="d-flex align-items-center justify-content-start gap-2">
                                      <p
                                        style={{
                                          fontWeight: 600,
                                          fontSize: "14px",
                                          margin: 0,
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
                                            Rs.{compareAtPrice}
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {product.optionSelections && product.optionSelections.length > 0 && (
                                  <div className="mt-2">
                                    {product.optionSelections.map((option, optIdx) => (
                                      <div key={`${option.name}-${optIdx}`} style={{ marginBottom: "10px" }}>
                                        <label
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            color: "#616161",
                                            marginBottom: "4px",
                                            display: "block",
                                          }}
                                        >
                                          {option.name}
                                        </label>
                                        <div style={{ position: "relative" }}>
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
                                              background: "#F1F1F1",
                                              padding: "8px 12px",
                                              borderRadius: "8px",
                                              border: "1px solid rgba(34, 34, 34, 0.1)",
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
                                            }}
                                          >
                                            <CaretDownFill />
                                          </span>
                                        </div>
                                      </div>
                                    ))}
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
                                    background: "#2A353D",
                                    color: "white",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    border: "2px solid white",
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
                          backgroundColor: "#f8f8f8",
                          borderRadius: "18px",
                        }}
                      >
                        <p style={{ fontSize: "14px", color: "#666" }}>
                          No products selected. Add products to see the preview.
                        </p>
                      </div>
                    )}
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
                        <div>
                          <p
                            style={{
                              fontFamily: "Inter",
                              fontStyle: "normal",
                              fontWeight: "600",
                              fontSize: "15px",
                              lineHeight: "100%",
                              color: "#303030",
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
                                color: "#C4290E",
                                margin: "5px 0 0 0",
                              }}
                            >
                              Save {bundlePricing.discountPercentage}% (Rs.{bundlePricing.saved})
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
                              color: "#222222",
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
                                color: "#999",
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
                      />
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
}
