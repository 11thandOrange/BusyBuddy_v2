import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import DiscountList from "./DiscountList";
import Button from "../../components/Button";
import ToggleSwitch from "../../components/ToggelSwitch";

export default function CarNoticeForm({ goBack, setActiveAction }) {
  const [fromDiscountPage, setFromDiscountPage] = useState(false);
  const [resetDiscountList, setResetDiscountList] = useState(false);
  
  const handleDiscard = () => {
    setFromDiscountPage(false);
    setResetDiscountList(prev => !prev);
  };
  
  return (
    <div>
      <Container fluid style={{ maxWidth: "1500px", margin: "0 auto" }}>
        {/* Header Row: [Back] [Title ... Toggle] [Create Cart Notice] */}
        <Row className="mb-2 align-items-center">
          <Col xs="auto">
            {fromDiscountPage ? (
              <></>
            ) : (
              <div
                className="text-dark p-0"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => {
                  goBack(true);
                  setActiveAction(null);
                }}
              >
                <ArrowLeft size={24} />
              </div>
            )}
          </Col>
          {/* Left Column: Title + Toggle */}
          <Col className="d-flex align-items-center gap-3">
            <h5
              className="mb-0"
              style={{
                fontWeight: 600,
                fontSize: "20px",
                lineHeight: "1",
              }}
            >
              Cart Notice
            </h5>
            <ToggleSwitch size="small" appId="cart_notice" />
          </Col>
          {/* Right Column: Buttons */}
          {fromDiscountPage ? (
            <Col xs="auto" className="d-flex align-items-center gap-2">
              <Button
                text="Discard"
                onClick={handleDiscard}
                style={{
                  background: "white",
                  border: "1px solid #dee2e6",
                  height: "45px",
                  fontWeight: 500,
                  fontSize: "15px",
                  borderRadius: "8px",
                  padding: "10px 20px",
                }}
              />
              <Button
                text="Save Changes"
                onClick={() => console.log("Save")}
                style={{
                  height: "45px",
                  fontWeight: 500,
                  fontSize: "15px",
                  borderRadius: "8px",
                  backgroundColor: "#000",
                  color: "#fff",
                  padding: "10px 20px",
                }}
              />
            </Col>
          ) : (
            <Col xs="auto" className="d-flex align-items-center">
              <Button
                text="Create Cart Notice"
                onClick={() => setFromDiscountPage(true)}
                style={{
                  borderRadius: "15px",
                  backgroundColor: "#000",
                  color: "#FFFFFF",
                  padding: "15px 25px",
                  fontWeight: "500",
                  fontSize: "15px",
                }}
              />
            </Col>
          )}
        </Row>

        {/* Description Row */}
        <Row className="mb-4">
          <Col>
            <p
              className="mb-0"
              style={{
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "1.3",
                color: "#616161",
              }}
            >
              Display helpful notices in the shopping cart! Show shipping thresholds,
              promotional messages, or important information to customers as they shop.
            </p>
          </Col>
        </Row>
      </Container>
      <DiscountList
        key={resetDiscountList ? 'reset' : 'normal'}
        onMakeBundleClick={() => setFromDiscountPage(true)}
      />
    </div>
  );
}

