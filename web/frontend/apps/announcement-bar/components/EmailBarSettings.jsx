import React, { useState, useEffect } from "react";
import { Card, Form, InputGroup, Spinner, Alert, Row, Col } from "react-bootstrap";
import { Palette } from "react-bootstrap-icons";

export default function EmailBarSettings({ 
  emailSettings, 
  onEmailSettingsChange,
  isExpanded = false,
  onToggleExpand 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [emailProviderData, setEmailProviderData] = useState({
    isConnected: false,
    lists: [],
    templates: [],
    provider: null,
  });
  const [showInputStyles, setShowInputStyles] = useState(false);
  const [showButtonStyles, setShowButtonStyles] = useState(false);

  // Default email settings
  const defaultEmailSettings = {
    templateId: "",
    templateName: "",
    listId: "",
    listName: "",
    emailSuccessMessage: "Thank you for subscribing!",
    buttonText: "Subscribe",
    placeholderText: "Enter your email",
    inputStyles: {
      backgroundColor: "#ffffff",
      borderColor: "#cccccc",
      borderRadius: "4px",
      fontColor: "#000000",
      fontSize: "14px",
      padding: "10px 15px",
    },
    buttonStyles: {
      backgroundColor: "#000000",
      fontColor: "#ffffff",
      borderRadius: "4px",
      fontSize: "14px",
      padding: "10px 20px",
      hoverBackgroundColor: "#333333",
    },
  };

  const settings = { ...defaultEmailSettings, ...emailSettings };

  useEffect(() => {
    fetchEmailProviderData();
  }, []);

  const fetchEmailProviderData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/email-provider');
      const data = await response.json();

      if (data.success && data.data) {
        setEmailProviderData({
          isConnected: data.data.isConnected || false,
          lists: data.data.lists || [],
          templates: data.data.templates || [],
          provider: data.data.provider,
        });
      }
    } catch (err) {
      console.error("Error fetching email provider:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...settings, [field]: value };
    onEmailSettingsChange(updated);
  };

  const handleInputStyleChange = (field, value) => {
    const updated = {
      ...settings,
      inputStyles: { ...settings.inputStyles, [field]: value },
    };
    onEmailSettingsChange(updated);
  };

  const handleButtonStyleChange = (field, value) => {
    const updated = {
      ...settings,
      buttonStyles: { ...settings.buttonStyles, [field]: value },
    };
    onEmailSettingsChange(updated);
  };

  const handleListChange = (listId) => {
    const selectedList = emailProviderData.lists.find(l => l.listId === listId);
    const updated = {
      ...settings,
      listId,
      listName: selectedList ? selectedList.listName : "",
    };
    onEmailSettingsChange(updated);
  };

  const handleTemplateChange = (templateId) => {
    const selectedTemplate = emailProviderData.templates.find(t => t.templateId === templateId);
    const updated = {
      ...settings,
      templateId,
      templateName: selectedTemplate ? selectedTemplate.templateName : "",
    };
    onEmailSettingsChange(updated);
  };

  if (isLoading) {
    return (
      <Card className="border-0 mb-3" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
        <Card.Body className="d-flex justify-content-center align-items-center py-4">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Loading email settings...</span>
        </Card.Body>
      </Card>
    );
  }

  if (!emailProviderData.isConnected) {
    return (
      <Card className="border-0 mb-3" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
        <Card.Body>
          <Alert variant="warning" className="mb-0">
            <strong>Email Provider Not Connected</strong>
            <p className="mb-0 mt-2" style={{ fontSize: "13px" }}>
              To use the Email announcement bar type, please connect an email provider 
              in the Settings tab first.
            </p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="email-bar-settings">
      {/* Email Settings Section */}
      <Card className="border-0 mb-3" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
        <Card.Body>
          <h6 style={{ fontWeight: 600, marginBottom: "15px" }}>
            📧 Email Settings
          </h6>

          {/* Email List Selection */}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 500, fontSize: "13px" }}>
              Email List
            </Form.Label>
            <Form.Select
              value={settings.listId}
              onChange={(e) => handleListChange(e.target.value)}
              style={{
                background: "#fff",
                border: "1px solid rgba(34, 34, 34, 0.1)",
                borderRadius: "8px",
                padding: "10px 15px",
              }}
            >
              <option value="">Select an email list</option>
              {emailProviderData.lists.map((list) => (
                <option key={list.listId} value={list.listId}>
                  {list.listName} {list.memberCount ? `(${list.memberCount} members)` : ''}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Subscribers will be added to this list
            </Form.Text>
          </Form.Group>

          {/* Email Template Selection */}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 500, fontSize: "13px" }}>
              Email Template (Optional)
            </Form.Label>
            <Form.Select
              value={settings.templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              style={{
                background: "#fff",
                border: "1px solid rgba(34, 34, 34, 0.1)",
                borderRadius: "8px",
                padding: "10px 15px",
              }}
            >
              <option value="">No automated email</option>
              {emailProviderData.templates.map((template) => (
                <option key={template.templateId} value={template.templateId}>
                  {template.templateName}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              This template will be sent when a customer subscribes
            </Form.Text>
          </Form.Group>

          {/* Success Message */}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 500, fontSize: "13px" }}>
              Success Message
            </Form.Label>
            <Form.Control
              type="text"
              value={settings.emailSuccessMessage}
              onChange={(e) => handleChange("emailSuccessMessage", e.target.value)}
              placeholder="Thank you for subscribing!"
              style={{
                background: "#fff",
                border: "1px solid rgba(34, 34, 34, 0.1)",
                borderRadius: "8px",
                padding: "10px 15px",
              }}
            />
            <Form.Text className="text-muted">
              Message shown after successful subscription
            </Form.Text>
          </Form.Group>

          {/* Button Text */}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 500, fontSize: "13px" }}>
              Button Text
            </Form.Label>
            <Form.Control
              type="text"
              value={settings.buttonText}
              onChange={(e) => handleChange("buttonText", e.target.value)}
              placeholder="Subscribe"
              style={{
                background: "#fff",
                border: "1px solid rgba(34, 34, 34, 0.1)",
                borderRadius: "8px",
                padding: "10px 15px",
              }}
            />
          </Form.Group>

          {/* Placeholder Text */}
          <Form.Group className="mb-0">
            <Form.Label style={{ fontWeight: 500, fontSize: "13px" }}>
              Input Placeholder
            </Form.Label>
            <Form.Control
              type="text"
              value={settings.placeholderText}
              onChange={(e) => handleChange("placeholderText", e.target.value)}
              placeholder="Enter your email"
              style={{
                background: "#fff",
                border: "1px solid rgba(34, 34, 34, 0.1)",
                borderRadius: "8px",
                padding: "10px 15px",
              }}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Input Styling */}
      <Card className="border-0 mb-3" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
        <Card.Body>
          <div 
            className="d-flex justify-content-between align-items-center cursor-pointer"
            onClick={() => setShowInputStyles(!showInputStyles)}
            style={{ cursor: "pointer" }}
          >
            <h6 style={{ fontWeight: 600, marginBottom: 0 }}>
              <Palette className="me-2" />
              Input Field Styling
            </h6>
            <span>{showInputStyles ? "▲" : "▼"}</span>
          </div>

          {showInputStyles && (
            <div className="mt-3">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "13px" }}>Background Color</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="color"
                        value={settings.inputStyles.backgroundColor}
                        onChange={(e) => handleInputStyleChange("backgroundColor", e.target.value)}
                        style={{ width: "50px", padding: "5px" }}
                      />
                      <Form.Control
                        type="text"
                        value={settings.inputStyles.backgroundColor}
                        onChange={(e) => handleInputStyleChange("backgroundColor", e.target.value)}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "13px" }}>Border Color</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="color"
                        value={settings.inputStyles.borderColor}
                        onChange={(e) => handleInputStyleChange("borderColor", e.target.value)}
                        style={{ width: "50px", padding: "5px" }}
                      />
                      <Form.Control
                        type="text"
                        value={settings.inputStyles.borderColor}
                        onChange={(e) => handleInputStyleChange("borderColor", e.target.value)}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "13px" }}>Font Color</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="color"
                        value={settings.inputStyles.fontColor}
                        onChange={(e) => handleInputStyleChange("fontColor", e.target.value)}
                        style={{ width: "50px", padding: "5px" }}
                      />
                      <Form.Control
                        type="text"
                        value={settings.inputStyles.fontColor}
                        onChange={(e) => handleInputStyleChange("fontColor", e.target.value)}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "13px" }}>Border Radius</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.inputStyles.borderRadius}
                      onChange={(e) => handleInputStyleChange("borderRadius", e.target.value)}
                      placeholder="4px"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Button Styling */}
      <Card className="border-0" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
        <Card.Body>
          <div 
            className="d-flex justify-content-between align-items-center cursor-pointer"
            onClick={() => setShowButtonStyles(!showButtonStyles)}
            style={{ cursor: "pointer" }}
          >
            <h6 style={{ fontWeight: 600, marginBottom: 0 }}>
              <Palette className="me-2" />
              Button Styling
            </h6>
            <span>{showButtonStyles ? "▲" : "▼"}</span>
          </div>

          {showButtonStyles && (
            <div className="mt-3">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "13px" }}>Background Color</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="color"
                        value={settings.buttonStyles.backgroundColor}
                        onChange={(e) => handleButtonStyleChange("backgroundColor", e.target.value)}
                        style={{ width: "50px", padding: "5px" }}
                      />
                      <Form.Control
                        type="text"
                        value={settings.buttonStyles.backgroundColor}
                        onChange={(e) => handleButtonStyleChange("backgroundColor", e.target.value)}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "13px" }}>Font Color</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="color"
                        value={settings.buttonStyles.fontColor}
                        onChange={(e) => handleButtonStyleChange("fontColor", e.target.value)}
                        style={{ width: "50px", padding: "5px" }}
                      />
                      <Form.Control
                        type="text"
                        value={settings.buttonStyles.fontColor}
                        onChange={(e) => handleButtonStyleChange("fontColor", e.target.value)}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "13px" }}>Hover Background</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="color"
                        value={settings.buttonStyles.hoverBackgroundColor}
                        onChange={(e) => handleButtonStyleChange("hoverBackgroundColor", e.target.value)}
                        style={{ width: "50px", padding: "5px" }}
                      />
                      <Form.Control
                        type="text"
                        value={settings.buttonStyles.hoverBackgroundColor}
                        onChange={(e) => handleButtonStyleChange("hoverBackgroundColor", e.target.value)}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "13px" }}>Border Radius</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.buttonStyles.borderRadius}
                      onChange={(e) => handleButtonStyleChange("borderRadius", e.target.value)}
                      placeholder="4px"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
