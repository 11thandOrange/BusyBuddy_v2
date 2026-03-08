import React from "react";
import { Row, Col } from "react-bootstrap";
import Button from "./Button";
import ToggleSwitch from "./ToggelSwitch";

/**
 * AppHeader Component - Header for app detail pages
 * Shows app title with toggle inline, and create button in top right
 * 
 * @param {string} appTitle - The title of the app
 * @param {string} appId - The app identifier for toggle switch
 * @param {string} createButtonText - Text for the create button
 * @param {function} onCreateClick - Click handler for create button
 * @param {boolean} showCreateButton - Whether to show the create button (default: true)
 */
const AppHeader = ({ 
  appTitle, 
  appId, 
  createButtonText = "Create", 
  onCreateClick,
  showCreateButton = true 
}) => {
  return (
    <Row 
      className="align-items-center mb-4" 
      style={{ 
        padding: "20px 0",
        borderBottom: "1px solid #e3e3e3"
      }}
    >
      {/* Left side - App Title and Toggle */}
      <Col xs={12} md={8} className="d-flex align-items-center gap-3">
        <h2 style={{ 
          fontWeight: 600, 
          fontSize: "24px", 
          margin: 0,
          color: "#303030"
        }}>
          {appTitle}
        </h2>
        <ToggleSwitch appId={appId} />
      </Col>
      
      {/* Right side - Create Button */}
      {showCreateButton && (
        <Col xs={12} md={4} className="d-flex justify-content-end mt-3 mt-md-0">
          <Button
            text={createButtonText}
            onClick={onCreateClick}
            style={{
              background: "black",
              borderRadius: "12px",
              padding: "12px 24px",
              color: "white",
              fontWeight: 600,
              fontSize: "14px",
              minWidth: "180px",
              height: "48px"
            }}
          />
        </Col>
      )}
    </Row>
  );
};

export default AppHeader;
