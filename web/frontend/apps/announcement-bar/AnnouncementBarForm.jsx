import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import DiscountList from "./DiscountList";
import Button from "../../components/Button";
import ToggleSwitch from "../../components/ToggelSwitch";

export default function AnnouncementBarForm({ goBack, setActiveAction }) {
  const [fromDiscountPage, setFromDiscountPage] = useState(false);
  const [resetDiscountList, setResetDiscountList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(1);
  const [autoTriggerActions, setAutoTriggerActions] = useState(true);
  const discountActionsRef = useRef();
  
  useEffect(() => {
    if (autoTriggerActions) {
      setFromDiscountPage(true);
      setAutoTriggerActions(false);
    }
  }, [autoTriggerActions]);
  
  const handleOpenDiscountModal = () => {
    setAutoTriggerActions(true);
  };
  
  const handleDiscard = () => {
    setFromDiscountPage(false);
    setResetDiscountList((prev) => !prev);
  };
  
  const handleBundleCreated = () => {
    setFromDiscountPage(false);
    setRefreshTrigger((prev) => prev + 1);
  };
  
  const handleSaveChanges = () => {
    if (discountActionsRef.current) {
      discountActionsRef.current.handleSaveChanges();
    }
  };
  
  return (
    <div>
      <Container fluid style={{ maxWidth: "1500px", margin: "0 auto" }}>
        {/* Header Row: [Back] [Title ... Toggle] [Create Announcement Bar] */}
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
          <Col className="d-flex align-items-center justify-content-between">
            <h5
              className="mb-0"
              style={{
                fontWeight: 600,
                fontSize: "20px",
                lineHeight: "1",
              }}
            >
              Announcement Bar
            </h5>
            <ToggleSwitch appId="announcement_bar" />
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
            <Col xs="auto" className="d-flex align-items-center">
              <Button
                text="Create Announcement Bar"
                onClick={handleOpenDiscountModal}
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
              Get Noticed! 🔔 Want to make sure your message doesn't get missed? Announcement Bar lets you
              display important alerts right at the top of your store. Whether it's a sale, promotion, or
              update, it's impossible to ignore!
            </p>
          </Col>
        </Row>
      </Container>
      <DiscountList
        key={resetDiscountList ? "reset" : "normal"}
        onMakeBundleClick={() => setFromDiscountPage(true)}
        refreshTrigger={refreshTrigger}
        onBundleCreated={handleBundleCreated}
        discountActionsRef={discountActionsRef}
        autoTriggerActions={fromDiscountPage}
      />
    </div>
  );
}
