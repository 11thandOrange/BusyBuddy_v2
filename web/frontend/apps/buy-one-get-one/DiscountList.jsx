import React, { useState } from "react";
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
import BuyoneGetoneActions from "./buyoneGetoneActions";
import tshirt from "./tshirt.png";
import "./buyoneGetoneStyles.css";
import Button from "../../components/Button";
import { X, Trash } from "react-bootstrap-icons";
import view from "../../assets/view.png";
import videoimg from "../../assets/videoimg.png";
import VideoList from "../../components/VideoList";

// BOGO specific videos
const bogoVideos = [
  {
    id: 1,
    title: "BOGO Basics",
    description: "Create your first Buy One Get One offer",
    src: "/videos/bogo-getting-started.mp4",
    poster: null,
    duration: "2:20"
  },
  {
    id: 2,
    title: "Discount Configurations",
    description: "Set up different BOGO discount types",
    src: "/videos/bogo-discounts.mp4",
    poster: null,
    duration: "3:15"
  },
  {
    id: 3,
    title: "Product Selection",
    description: "Choose which products to include",
    src: "/videos/bogo-products.mp4",
    poster: null,
    duration: "2:40"
  },
  {
    id: 4,
    title: "BOGO Best Practices",
    description: "Tips for maximizing BOGO sales",
    src: "/videos/bogo-best-practices.mp4",
    poster: null,
    duration: "3:30"
  }
];

export default function DiscountList({ onMakeBundleClick }) {
  const tabs = ["Overview", "Discounts", "Setting", "Analytics"];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [bundles, setBundles] = useState({ bundle1: false, bundle2: false });
  const [showBundleAction, setShowBundleAction] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isToggled, setIsToggled] = useState(true); // Toggle button in active state
  const [checkboxes, setCheckboxes] = useState([false, false, false, false]);
  const [toggles, setToggles] = useState([true, true, true, true]);
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
  const handleBundleChange = (e) => {
    setBundles({
      ...bundles,
      [e.target.name]: e.target.checked,
    });
  };

  if (showBundleAction) {
    return <BuyoneGetoneActions />;
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
          <VideoList videos={bogoVideos} appName="Buy One Get One" />
        )}

        {selectedTab === "Discounts" && (
          <div className="d-flex flex-column gap-3 ">
            {" "}
            {checkboxes.map((isChecked, index) => (
              <>
                <Row key={index} className="g-0 linrrow">
                  {" "}
                  {/* Each bundle in a separate row */}
                  <Col sm={9} md={9} lg={12}>
                  <Card
                    className="border-0 w-150"
                    style={{ background: "rgb(241, 242, 244)" }}
                  >
                    <Card.Body className="d-flex align-items-center justify-content-between">
                      {/* Left side - Checkbox and Bundle Name */}
                      <div className="d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(index)}
                          className="custom-checkbox me-2"
                        />

                        <img
                          src={tshirt}
                          alt="T-Shirt"
                          width={80}
                          height={80}
                          className="me-2"
                        />
                        <div className="bundlebox">
                          <div className="bundletxxtb1">
                            <span className="bundletext">
                              Bundle #{index + 1}
                            </span>
                            <div className="previewbtn">
                              <img src={view} width={13} height={13} />
                              Preview
                            </div>
                          </div>
                          <p className="buymorebtn">Buy Together & Save More!🔥!</p>
                          <div className="bundletxtb2">
                            <p>Product 1</p>
                            <p>Product 3</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="d-flex align-items-center justify-content-between gap-2"
                        style={{ width: "25%" }}
                      >
                        <Form.Group className="mt-1 d-flex align-items-center gap-2">
                          <Form.Label className="inputtitle mt-1">
                            Priority
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder=""
                            style={{
                              background: "white",
                              width: "80px",
                              height: "29px",
                            }}
                            className="inputbox"
                          />
                        </Form.Group>

                        <div className="togglebox">
                          <p className="datetext mt-2">Feb 13 at 12:59pm</p>
                          <Form.Check
                            type="switch"
                            id={`bundle-toggle-${index}`}
                            checked={toggles[index]}
                            onChange={() => handleToggleChange(index)}
                            className="custom-switch-toggle"
                            style={{ width: "41px", height: "21px" }}
                          />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                  </Col>
                </Row>
              </>
            ))}
          </div>
        )}
      </Row>
    </Container>
  );
}
