import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Nav,
  ListGroup,
} from "react-bootstrap";
import { Play } from "react-bootstrap-icons";
import { useNavigate, useLocation } from "react-router-dom";
import videoimg from "../assets/videoimg.png";
import tshirtImg from "../assets/tshirt.png";

const initialCart = [
  {
    id: 1,
    title: "T-shirt",
    price: 885.95,
    quantity: 1,
    image: tshirtImg,
  },
];

const MarshallPage = ({ activeTab, setActiveTab, onMakeBundleNowClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState(initialCart);

  // Route mapping for each app
  const appRoutes = {
    "Announcement Bar": "/announcement-bar",
    "Inactive Tab Message": "/inactive-tab-message",
    "Bundle Discount": "/bundle-discount",
    "Buy One Get One": "/buy-one-get-one",
    "Volume Discounts": "/volume-discounts",
    "Mix & Match": "/mix-and-match",
  };

  const tabData = {
    "Announcement Bar": {
      title: "Announcement Bar",
      description:
        "Display important updates, promotions, or messages across your store to capture visitors’ attention instantly.",
      features: [
        {
          title: "Customizable",
          description: "Easily adjust text, colors, style, and placement to match your brand.",
        },
        {
          title: "Responsive",
          description: "Automatically adapts to any screen size for a seamless customer experience.",
        },
        {
          title: "Attention Grabbing",
          description:
            "Boost engagement by highlighting offers or announcements without interrupting shopping.",
        },
      ],
    },
    "Inactive Tab Message": {
      title: "Inactive Tab Message",
      description:
        "Bring customers back when they switch tabs by showing a playful or promotional browser title message.",
      features: [
        {
          title: "Customizable",
          description: "Set your own messages, emojis, and triggers to suit your brand’s tone.",
        },
        {
          title: "Engaging",
          description: "Encourages users to return to your store and complete their purchase.",
        },
        {
          title: "Simple Setup",
          description:
            "Activate in seconds—no coding required, just pick your message and go live.",
        },
      ],
    },
    "Bundle Discount": {
      title: "Bundle Discount",
      description:
        "Boost average order value by letting customers buy related products together at a discount.",
      features: [
        {
          title: "Flexible Discounts",
          description: "Offer percentage or fixed discounts for product bundles.",
        },
        {
          title: "Customizable Display",
          description: "Choose where and how bundles appear on your store pages.",
        },
        {
          title: "Automated Savings",
          description:
            "Discounts apply automatically at checkout for a frictionless experience.",
        },
      ],
    },
    "Buy 'X' Get 'Y'": {
      title: "Buy One Get One",
      description:
        "Run classic BOGO campaigns that reward shoppers with free or discounted products automatically.",
      features: [
        {
          title: "Versatile Setup",
          description: "Create ‘Buy X Get Y’ offers for any product combination.",
        },
        {
          title: "Auto Application",
          description: "No discount codes needed—Shopify applies the deal instantly.",
        },
        {
          title: "Conversion Boosting",
          description:
            "Encourages larger purchases and repeat customers with irresistible deals.",
        },
      ],
    },
    "Volume Discounts": {
      title: "Volume Discounts",
      description:
        "Encourage bulk buying by offering tiered discounts based on the quantity purchased.",
      features: [
        {
          title: "Tiered Pricing",
          description: "Set dynamic price breaks to reward higher order quantities.",
        },
        {
          title: "Visual Display",
          description: "Show customers how much they’ll save as they add more items.",
        },
        {
          title: "Increased Revenue",
          description:
            "Boost cart size and profit margins by motivating shoppers to buy more per order.",
        },
      ],
    },
    "Mix & Match": {
      title: "Mix & Match",
      description:
        "Let shoppers build their own custom bundles by mixing products at a special combined price.",
      features: [
        {
          title: "Flexible Rules",
          description: "Define eligible products and discounts for any combination.",
        },
        {
          title: "Engaging Experience",
          description: "Encourages exploration and personalization while shopping.",
        },
        {
          title: "Sales Growth",
          description:
            "Increase average order value by making it fun and rewarding to bundle products.",
        },
      ],
    },
  };

  const handleMakeBundleNowClick = () => {
    const route = appRoutes[activeTab];
    if (route) {
      // Preserve query params (especially 'host' for App Bridge)
      navigate(route + location.search);
    }
  };
  const getButtonLabel = () => {
    switch (activeTab) {
      case "Announcement Bar":
        return "Create Announcement Bar";
      case "Inactive Tab Message":
        return "Set Inactive Tab Message";
      case "Bundle Discount":
        return "Make your Bundle Now!";
      case "Buy One Get One":
        return "Set Up Buy One Get One Offer";
      case "Volume Discounts":
        return "Add Volume Discounts";
      case "Mix & Match":
        return "Create Mix & Match Bundle";
      default:
        return "Make your Bundle Now!";
    }
  };

  const updateQuantity = (id, amount) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  return (
    <>
    <div
      className="container-fluid"
      style={{
        maxWidth: "auto",
        margin: "0 auto",
        // boxShadow: "1px 1px 4px 0px #0000001A inset",
        borderRadius: "19px",
        background: "#FFFFFF",
        padding: "5px",
        gap: "10px",
      }}
    >
      <Row className="justify-content-center ">
        <Col lg={12} style={{ borderRadius: "15px" }}>
          <Row>
            {tabData[activeTab].title === "T-Shirt" ? (
              activeTab !== "Cart Notice" ? (
                <>
                  {/* Left Section - Image Only */}
                  <Col lg={6} md={12}>
                    <Card
                      className="border-0"
                      style={{ backgroundColor: "transparent" }}
                    >
                      <Card.Body className="p-0">
                        <img
                          src={tshirtImg}
                          alt="tshirt"
                          width={780}
                          height={550}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                  {/* Right Section - Dynamic Data */}
                  <Col lg={6} md={12}>
                    <Card className="border-0 h-100 p-1">
                      <Card.Body className="d-flex justify-content-between flex-column h-100 p-4">
                        <div>
                          <h2
                            className="mb-3 mt-3 "
                            style={{ fontWeight: 600, fontSize: "28px" }}
                          >
                            {tabData[activeTab].title}
                          </h2>
                          <p
                            className="text-muted mb-4"
                            style={{
                              fontWeight: 500,
                              fontSize: "14px",
                              lineHeight: "1.3",
                              letterSpacing: "0%",
                            }}
                          >
                            {tabData[activeTab].description}
                          </p>

                          {/* Feature Icons - Dynamic for all tabs */}
                          <Row
                            className="mb-4"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "35px",
                            }}
                          >
                            {tabData[activeTab].features.map(
                              (feature, index) => (
                                <Col md={6} key={index}>
                                  <div>
                                    <h5
                                      className="mb-2"
                                      style={{
                                        fontWeight: 600,
                                        fontSize: "16px",
                                      }}
                                    >
                                      {feature.title}
                                    </h5>

                                    {feature.title ===
                                    "Quantity (1 in cart)" ? (
                                      <div className="mt-2">
                                        <Button
                                          variant="light"
                                          size="sm"
                                          onClick={() => updateQuantity(1, -1)}
                                        >
                                          -
                                        </Button>
                                        <span className="mx-2">
                                          {feature.description}
                                        </span>
                                        <Button
                                          variant="light"
                                          size="sm"
                                          onClick={() => updateQuantity(1, 1)}
                                        >
                                          +
                                        </Button>
                                      </div>
                                    ) : feature.title ===
                                      "Buy Together & Save More!🔥!" ? (
                                      <Card
                                        className="p-1"
                                        style={{
                                          backgroundColor: "#ffeaea",
                                          height: "50px",
                                          width: "205px",
                                          display: "flex",
                                          alignItems: "start",
                                          justifyContent: "center",
                                          border: "1px solid red",
                                        }}
                                      >
                                        <Card.Body className="ms-2 p-0 d-flex justify-content-center align-items-center">
                                          <input
                                            type="radio"
                                            defaultChecked
                                            style={{ accentColor: "red" }}
                                          />
                                          <p
                                            className="small text-muted ms-1"
                                            style={{
                                              color: "#616161",
                                              fontSize: "14px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {feature.description}
                                          </p>
                                        </Card.Body>
                                      </Card>
                                    ) : (
                                      <p
                                        className="small text-muted"
                                        style={{
                                          color: "#616161",
                                          fontSize: "14px",
                                          fontWeight: "500",
                                        }}
                                      >
                                        {feature.description}
                                      </p>
                                    )}
                                  </div>
                                </Col>
                              )
                            )}
                          </Row>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </>
              ) : (
                <Container className="my-5">
                  <h2
                    className="mb-4 ms-2"
                    style={{ fontWeight: 400, fontSize: "28px" }}
                  >
                    Your cart
                  </h2>
                  <Card
                    className="border-yellow-100 p-1"
                    style={{
                      backgroundColor: "#fdf7da",
                      height: "20%",
                      display: "flex",
                      alignItems: "start",
                      justifyContent: "center",
                    }}
                  >
                    <Card.Body className="p-0">
                      <div className="d-flex align-items-start mt-2">
                        <span
                          className="me-2 mt-1"
                          style={{ fontSize: "16px" }}
                        >
                          😎
                        </span>
                        <div>
                          <h2
                            style={{
                              fontWeight: 500,
                              fontSize: "12px",
                              marginBottom: "0",
                            }}
                          >
                            Don't Miss Out A Great Deals!
                          </h2>
                          <p
                            style={{
                              fontWeight: "bold",
                              fontSize: "12px",
                              marginBottom: "0",
                            }}
                          >
                            The Holiday's are not Over yet!
                          </p>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                  <hr />
                  <ListGroup variant="flush">
                    {cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <ListGroup.Item key={item.id}>
                          <Row className="align-items-center justify-content-between">
                            <Col md={2}>
                              <img
                                src={item.image}
                                className="rounded fluid"
                                width={50}
                                height={50}
                              />
                              <span className="ms-2">{item.title}</span>
                            </Col>
                            {/* <Col md={4}>{item.title}</Col> */}
                            <Col md={2}>
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                -
                              </Button>
                              <span className="mx-2">{item.quantity}</span>
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                +
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="ms-3"
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </Col>
                            <Col md={2}>${item.price.toFixed(2)}</Col>
                          </Row>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item>
                        <p className="text-center">Your cart is empty.</p>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                  <hr />
                  <Row className="justify-content-end">
                    <Col md={4}>
                      <h4>Estimated Total: ${total}</h4>
                      <p className="text-muted small mt-3">
                        Tax and shipping calculated at checkout
                      </p>
                    </Col>
                  </Row>
                </Container>
              )
            ) : (
              <>
                {/* Left Section - Video Only */}
                <Col lg={6} md={12}>
                  <Card
                    className="border-0"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <Card.Body className="p-0">
                      {/* Video Component */}
                      <div className="video-container position-relative">
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
                            variant="light"
                            className="rounded-circle p-3"
                          >
                            <Play size={24} />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                {/* Right Section - Dynamic Data */}
                <Col lg={6} md={12}>
                  <Card className="border-0 h-100 p-1">
                    <Card.Body className="d-flex justify-content-between flex-column h-100 p-4">
                      <div>
                        <h2
                          className="mb-3 mt-3 "
                          style={{ fontWeight: 600, fontSize: "20px" }}
                        >
                          {tabData[activeTab].title}
                        </h2>
                        <p
                          className="text-muted mb-4 linrrow"
                          style={{
                            fontWeight: 500,
                            fontSize: "14px",
                            lineHeight: "1.3",
                            letterSpacing: "0%",
                          }}
                        >
                          {tabData[activeTab].description}
                        </p>

                        {/* Feature Icons - Dynamic for all tabs */}
                        <Row className="mb-4">
                          {tabData[activeTab].features.map((feature, index) => (
                            <Col md={4} className="mb-3 mb-md-0" key={index}>
                              <div className="">
                                {/* Use the same icon for all features */}
                                <div className="bg-dark text-white rounded-circle p-3 d-inline-flex mb-3">
                                  {/* Icon SVG - You can replace this with your desired icon */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                  >
                                    <g clipPath="url(#clip0_14004_1299)">
                                      <path
                                        d="M11.7281 3.2379C12.3491 2.56509 12.6596 2.22868 12.9895 2.03246C13.7856 1.55899 14.7659 1.54426 15.5753 1.99362C15.9108 2.17985 16.2308 2.50679 16.8709 3.16066C17.511 3.81452 17.831 4.14146 18.0133 4.48413C18.4532 5.31095 18.4388 6.31235 17.9753 7.12561C17.7832 7.46265 17.4539 7.77983 16.7953 8.4142L8.95888 15.9619C7.71075 17.1641 7.08669 17.7652 6.30674 18.0698C5.52679 18.3744 4.66936 18.352 2.95449 18.3072L2.72117 18.3011C2.19911 18.2874 1.93808 18.2806 1.78634 18.1084C1.63461 17.9362 1.65532 17.6703 1.69675 17.1385L1.71925 16.8497C1.83586 15.353 1.89417 14.6046 2.18644 13.9319C2.47872 13.2591 2.98288 12.7129 3.99121 11.6204L11.7281 3.2379Z"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M10.8334 3.33337L16.6667 9.16671"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M11.6667 18.3334L18.3334 18.3334"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </g>
                                    <defs>
                                      <clipPath id="clip0_14004_1299">
                                        <rect
                                          width="20"
                                          height="20"
                                          fill="white"
                                        />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                </div>
                                <h5
                                  style={{ fontWeight: 600, fontSize: "16px" }}
                                >
                                  {feature.title}
                                </h5>
                                <p
                                  className="small text-muted"
                                  style={{
                                    color: "#616161",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {feature.description}
                                </p>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                      <div className="mt-5">
                        <Button
                          variant="dark"
                          className="rounded-pill px-4 me-3"
                          style={{
                            height: "45px",
                            fontWeight: 500,
                            fontSize: "15px",
                            lineHeight: "100%",
                            letterSpacing: "0%",
                          }}
                          onClick={handleMakeBundleNowClick}
                        >
                          {getButtonLabel()}
                        </Button>

                        <span
                          className="align-middle"
                          style={{
                            fontWeight: 600,
                            fontSize: "14px",
                            textAlign: "center",
                          }}
                        >
                          Learn More about{" "}
                          <a href="#" className="text-primary">
                            How to create bundle?
                          </a>
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </>
            )}
          </Row>
        </Col>
      </Row>
    </div>
    </>
  );
};

export default MarshallPage;
