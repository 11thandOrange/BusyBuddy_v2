import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DiscountList from "../../components/BundelDiscountList";
import Button from "../../components/Button";
import ToggleSwitch from "../../components/ToggelSwitch";
import { useEditorNavigation } from "../../hooks";

export default function BundleForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { openEditor } = useEditorNavigation('bundle-discount');

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
      <Container fluid style={{ margin: "0 auto" }}>
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
              Create bundle discounts to encourage customers to buy more products together.
              Offer special pricing when customers purchase specific product combinations.
            </p>
          </Col>

          <Col xs="auto" className="d-flex align-items-center gap-2">
            <Button
              text="Create Bundle Discount"
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
            <ToggleSwitch appId="bundle_discount" />
          </Col>
        </Row>
      </Container>
      <DiscountList
        discountType="Bundle Discount"
        refreshTrigger={refreshTrigger}
        onBundleCreated={handleRefreshList}
      />
    </div>
  );
}
