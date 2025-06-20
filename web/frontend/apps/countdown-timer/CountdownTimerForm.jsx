import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
// import DiscountModal from "../../pages/DiscountModal";
import DiscountList from "./DiscountList";
import Button from "../../components/Button";
import DiscountModal from "../../components/Modals/GlobalDisountModal";

export default function InactiveTabMessageForm() {
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [fromDiscountPage, setFromDiscountPage] = useState(false);
  const [resetDiscountList, setResetDiscountList] = useState(false); 
  const handleOpenDiscountModal = () => {
    setShowDiscountModal(true);
  };

  const handleCloseDiscountModal = () => {
    setShowDiscountModal(false);
  };
  const handleDiscard = () => {
    setFromDiscountPage(false);
    setResetDiscountList(prev => !prev); // Toggle to force re-render
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
                onClick={() => console.log("Go back")}
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
              Bundle Discount
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
              Get Noticed! Want to make sure your message doesn't get missed?
              Announcement Bar lets you display important alerts right at the
              top of your store. Whether it's a sale, promotion, or update, it's
              impossible to ignore!
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
                  background:"white",
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
              <Button
                text="Create Another Discount"
                onClick={handleOpenDiscountModal}
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
              <ToggleSwitch />
            </Col>
          )}
        </Row>

        <DiscountModal
          show={showDiscountModal}
          onHide={handleCloseDiscountModal}
        />
      </Container>
      <DiscountList 
        key={resetDiscountList ? 'reset' : 'normal'} 
        onMakeBundleClick={() => setFromDiscountPage(true)} 
      />
    </div>
  );
}

const ToggleSwitch = () => {
  const [active, setActive] = useState(false);

  const toggleSwitch = () => {
    setActive(!active);
  };

  return (
    <div
      className="d-flex align-items-center"
      style={{ cursor: "pointer" }}
      onClick={toggleSwitch}
    >
      <div
        className={`position-relative ${active ? "bg-success" : "bg-danger"}`}
        style={{
          width: "132px",
          height: "48px",
          padding: "4px",
          borderRadius: "15px",
        }}
      >
        <div
          className="bg-white position-absolute"
          style={{
            width: "50px",
            height: "40px",
            transition: "all 0.3s ease",
            left: active ? "78px" : "5px",
            top: "4px",
            borderRadius: "11px",
          }}
        />
        <div className="d-flex align-items-center justify-content-between h-100 px-3">
          <span
            className="text-white fw-medium"
            style={{
              visibility: active ? "visible" : "hidden",
              zIndex: 1,
            }}
          >
            Active
          </span>
          <span
            className="text-white fw-medium ms-auto"
            style={{
              visibility: active ? "hidden" : "visible",
              zIndex: 1,
            }}
          >
            Inactive
          </span>
        </div>
      </div>
    </div>
  );
};
