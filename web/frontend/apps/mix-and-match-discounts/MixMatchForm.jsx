import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DiscountList from "../../components/BundelDiscountList";
import Button from "../../components/Button";
import ToggleSwitch from "../../components/ToggelSwitch";
import { useEditorNavigation } from "../../hooks";

export default function MixMatchForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { openEditor } = useEditorNavigation('mix-and-match');

  const handleCreateNew = () => {
    openEditor(); // Opens editor in new tab
  };

  const handleRefreshList = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleBack = () => {
    navigate('/' + location.search);
  };

  return (
    <div>
      <Container fluid style={{ maxWidth: "1500px", margin: "0 auto" }}>
        <Row className="mb-4 align-items-start">
          <Col xs="auto">
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
              Mix & Match
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
              Let customers create their own bundles by mixing and matching products
              from selected collections to unlock special discounts.
            </p>
          </Col>

          <Col xs="auto" className="d-flex align-items-center gap-2">
            <Button
              text="Create Mix & Match"
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
            <ToggleSwitch appId="mix_and_match" />
          </Col>
        </Row>
      </Container>
      <DiscountList
        discountType="Mix and Match"
        refreshTrigger={refreshTrigger}
        onBundleCreated={handleRefreshList}
      />
    </div>
  );
}
