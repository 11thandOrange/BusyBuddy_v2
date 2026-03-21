import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DiscountList from "./DiscountList";
import Button from "../../components/Button";
import ToggleSwitch from "../../components/ToggelSwitch";

export default function InactiveTabMessageForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fromDiscountPage, setFromDiscountPage] = useState(false);
  const [resetDiscountList, setResetDiscountList] = useState(false);
  
  const handleDiscard = () => {
    setFromDiscountPage(false);
    setResetDiscountList((prev) => !prev);
  };

  const handleBack = () => {
    navigate('/' + location.search);
  };

  return (
    <div>
      <Container fluid style={{ maxWidth: "1500px", margin: "0 auto" }}>
        <Row className="mb-4 align-items-start">
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
                onClick={handleBack}
              >
                <ArrowLeft size={24} />
              </div>
            )}
          </Col>
          <Col>
            <h5
              className="mb-2"
              style={{
                fontWeight: 600,
                fontSize: "20px",
                lineHeight: "1",
              }}
            >
              Inactive Tab Message
            </h5>
            <p
              className="mb-0"
              style={{
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "1.3",
                color: "#616161",
              }}
            >
              Don’t Let Them Forget! 🔖 Keep your store top-of-mind – even when
              customers switch tabs! Inactive Tab Message displays a custom
              alert in the title of their browser tab, so they’ll remember their
              cart, discounts, or promotions!
            </p>
          </Col>

          {fromDiscountPage ? (
            <Col
              xs="auto"
              className="d-flex align-items-center"
              style={{ maxWidth: "300px", width: "100%" }}
            >
              <Button
                text="Discard"
                onClick={handleDiscard}
                style={{
                  background: "white",
                  border: "1px solid #dee2e6",
                  height: "45px",
                  fontWeight: 500,
                  fontSize: "15px",
                  maxWidth: "95px",
                  borderRadius: "8px",
                  marginRight: "10px",
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
            <Col xs="auto" className="d-flex align-items-center gap-2">
              <ToggleSwitch appId="inactive_tab" />
            </Col>
          )}
        </Row>
      </Container>
      <DiscountList
        key={resetDiscountList ? "reset" : "normal"}
        onMakeBundleClick={() => setFromDiscountPage(true)}
      />
    </div>
  );
}


