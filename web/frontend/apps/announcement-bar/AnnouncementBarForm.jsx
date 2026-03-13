import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import DiscountList from "./DiscountList";
import Button from "../../components/Button";
import ToggleSwitch from "../../components/ToggelSwitch";
import { useEditorNavigation } from "../../hooks";

export default function AnnouncementBarForm({ goBack, setActiveAction }) {
  const [refreshTrigger, setRefreshTrigger] = useState(1);
  const { openEditor } = useEditorNavigation();

  const handleCreateNew = () => {
    openEditor(); // Opens editor in fullscreen (no bar ID = create new)
  };

  const handleRefreshList = () => {
    setRefreshTrigger((prev) => prev + 1);
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
              onClick={() => {
                goBack(true);
                setActiveAction(null);
              }}
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
              Announcement Bar
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
              Get Noticed! 🔔 Want to make sure your message doesn't get missed? Announcement Bar lets you
              display important alerts right at the top of your store. Whether it's a sale, promotion, or
              update, it's impossible to ignore!
            </p>
          </Col>

          <Col xs="auto" className="d-flex align-items-center gap-2">
            <Button
              text="Create Announcement Bar"
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
            <ToggleSwitch appId="announcement_bar" />
          </Col>
        </Row>
      </Container>
      <DiscountList
        refreshTrigger={refreshTrigger}
        onSaveSuccess={handleRefreshList}
      />
    </div>
  );
}
