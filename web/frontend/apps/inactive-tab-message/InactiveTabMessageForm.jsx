import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import DiscountList from "./DiscountList";
import Button from "../../components/Button";
import ToggleSwitch from "../../components/ToggelSwitch";

export default function InactiveTabMessageForm({ goBack, setActiveAction }) {
  const [fromDiscountPage, setFromDiscountPage] = useState(false);
  const [resetDiscountList, setResetDiscountList] = useState(false);
  
  const handleDiscard = () => {
    setFromDiscountPage(false);
    setResetDiscountList((prev) => !prev);
  };

  return (
    <div>
      <Container fluid style={{ maxWidth: "1500px", margin: "0 auto" }}>
        {/* Header Row: [Back] [Title ... Toggle] [Create Inactive Tab Message] */}
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
              Inactive Tab Message
            </h5>
            <ToggleSwitch appId="inactive_tab" />
          </Col>
          {/* No create button for Inactive Tab Message */}
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
              Don't Let Them Forget! 🔖 Keep your store top-of-mind – even when
              customers switch tabs! Inactive Tab Message displays a custom
              alert in the title of their browser tab, so they'll remember their
              cart, discounts, or promotions!
            </p>
          </Col>
        </Row>
      </Container>
      <DiscountList
        key={resetDiscountList ? "reset" : "normal"}
        onMakeBundleClick={() => setFromDiscountPage(true)}
      />
    </div>
  );
}
