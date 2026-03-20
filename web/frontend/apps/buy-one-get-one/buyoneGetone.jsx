import React, { useState, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DiscountList from "../../components/BundelDiscountList";
import Button from "../../components/Button";
import ToggleSwitch from "../../components/ToggelSwitch";

export default function BuyonegetoneForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fromDiscountPage, setFromDiscountPage] = useState(false);
  const [resetDiscountList, setResetDiscountList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const discountActionsRef = useRef();

  const handleCreateNew = () => {
    // Open editor in new fullscreen tab without App Bridge
    const params = new URLSearchParams(location.search);
    const shop = params.get("shop");
    const queryString = shop ? `?shop=${shop}` : "";
    window.open(`/editor.html${queryString}#/buy-one-get-one/editor`, "_blank");
  };
  const handleDiscard = () => {
    setFromDiscountPage(false);
    setResetDiscountList((prev) => !prev); // Toggle to force re-render
  };
  const handleBundleCreated = () => {
    setFromDiscountPage(false);
    // Trigger refresh by incrementing the trigger value
    setRefreshTrigger((prev) => prev + 1);
  };
  const handleSaveChanges = () => {
    if (discountActionsRef.current) {
      discountActionsRef.current.handleSaveChanges();
    }
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
              Buy One Get One
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
              Get Noticed! Want to make sure your message doesn't get missed? Announcement Bar lets you
              display important alerts right at the top of your store. Whether it's a sale, promotion, or
              update, it's impossible to ignore!
            </p>
          </Col>

          {fromDiscountPage ? (
            <Col xs="auto" className="d-flex align-items-center" style={{ maxWidth: "300px", width: "100%" }}>
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
                onClick={handleSaveChanges}
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
              <Button
                text="Create New BOGO"
                onClick={handleCreateNew}
                style={{
                  borderRadius: "15px",
                  backgroundColor: "#000",
                  color: "#FFFFFF",
                  padding: "15px 25px",
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fontWeight: "500",
                  fontSize: "15px",
                  lineHeight: "100%",
                }}
              />
              <ToggleSwitch appId="buy_one_get_one" />
            </Col>
          )}
        </Row>
      </Container>
      <DiscountList
        key={resetDiscountList ? "reset" : "normal"}
        onMakeBundleClick={() => setFromDiscountPage(true)}
        discountType="Buy One Get One"
        refreshTrigger={refreshTrigger}
        onBundleCreated={handleBundleCreated}
        discountActionsRef={discountActionsRef}
      />
    </div>
  );
}
