import React, { useState, useRef,useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
// import DiscountModal from "../../pages/DiscountModal";
// import DiscountList from "./DiscountList";
import DiscountList from "../../components/BundelDiscountList";
import Button from "../../components/Button";
import DiscountModal from "../../components/Modals/GlobalDisountModal";
import ToggleSwitch from "../../components/ToggelSwitch";

export default function VolumeForm({ goBack, setActiveAction }) {
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [fromDiscountPage, setFromDiscountPage] = useState(false);
  const [resetDiscountList, setResetDiscountList] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger state
  const [autoTriggerActions, setAutoTriggerActions] = useState(true); // Add this state
  const discountActionsRef = useRef();
  useEffect(() => {
    if (autoTriggerActions) {
      // Automatically set fromDiscountPage to true and trigger the flow
      setFromDiscountPage(true);
      setAutoTriggerActions(false); // Prevent infinite loop
    }
  }, [autoTriggerActions]);
  const handleOpenDiscountModal = () => {
    setShowDiscountModal(true);
  };

  const handleCloseDiscountModal = () => {
    setShowDiscountModal(false);
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
  return (
    <div>
      <Container fluid style={{ maxWidth: "1500px", margin: "0 auto" }}>
        {/* Header Row: [Back] [Title ... Toggle] [Create Another Discount] [Create Volume Discount] */}
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
              Volume Discount
            </h5>
            <ToggleSwitch appId="volume_discounts" />
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
            <Col xs="auto" className="d-flex align-items-center gap-2">
              <Button
                text="Create Another Discount"
                onClick={handleOpenDiscountModal}
                style={{
                  borderRadius: "15px",
                  backgroundColor: "#fff",
                  color: "#000",
                  border: "1px solid #dee2e6",
                  padding: "15px 25px",
                  fontWeight: "500",
                  fontSize: "15px",
                }}
              />
              <Button
                text="Create Volume Discount"
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
              Get Noticed! Want to make sure your message doesn't get missed? Announcement Bar lets you
              display important alerts right at the top of your store. Whether it's a sale, promotion, or
              update, it's impossible to ignore!
            </p>
          </Col>
        </Row>

        <DiscountModal show={showDiscountModal} onHide={handleCloseDiscountModal} setActiveAction={setActiveAction} />
      </Container>
      {/* <DiscountList 
        key={resetDiscountList ? 'reset' : 'normal'} 
        onMakeBundleClick={() => setFromDiscountPage(true)} 
      /> */}
      <DiscountList
        key={resetDiscountList ? "reset" : "normal"}
        onMakeBundleClick={() => setFromDiscountPage(true)}
        discountType="Volume Discount"
        refreshTrigger={refreshTrigger}
        onBundleCreated={handleBundleCreated}
        discountActionsRef={discountActionsRef}
        autoTriggerActions={fromDiscountPage}
      />
    </div>
  );
}
