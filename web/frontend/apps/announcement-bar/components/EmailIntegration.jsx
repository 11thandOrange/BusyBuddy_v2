import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, InputGroup, Spinner, Alert, Badge } from "react-bootstrap";
import { EyeFill, EyeSlashFill, CheckCircleFill, XCircleFill, ArrowClockwise } from "react-bootstrap-icons";
import Button from "../../../components/Button";

const EMAIL_PROVIDERS = [
  { id: 'mailchimp', name: 'Mailchimp', description: 'Email marketing platform' },
  { id: 'klaviyo', name: 'Klaviyo', description: 'E-commerce email & SMS platform' },
];

export default function EmailIntegration() {
  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [serverPrefix, setServerPrefix] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [connectionData, setConnectionData] = useState({
    isConnected: false,
    provider: null,
    connectedAt: null,
    lastSyncedAt: null,
    lists: [],
    templates: [],
    subscriptionCount: 0,
  });

  // Fetch current email provider settings on mount
  useEffect(() => {
    fetchEmailProvider();
  }, []);

  const fetchEmailProvider = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/email-provider');
      const data = await response.json();
      
      if (data.success && data.data) {
        setConnectionData({
          isConnected: data.data.isConnected || false,
          provider: data.data.provider,
          connectedAt: data.data.connectedAt,
          lastSyncedAt: data.data.lastSyncedAt,
          lists: data.data.lists || [],
          templates: data.data.templates || [],
          subscriptionCount: data.data.subscriptionCount || 0,
        });
        if (data.data.provider) {
          setProvider(data.data.provider);
        }
      }
    } catch (err) {
      console.error("Error fetching email provider:", err);
      setError("Failed to load email provider settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!provider || !apiKey) {
      setError("Please select a provider and enter your API key");
      return;
    }

    setIsConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/email-provider/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          apiKey,
          serverPrefix: provider === 'mailchimp' ? serverPrefix : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConnectionData({
          isConnected: true,
          provider: data.data.provider,
          connectedAt: data.data.connectedAt,
          lastSyncedAt: new Date().toISOString(),
          lists: data.data.lists || [],
          templates: data.data.templates || [],
          subscriptionCount: 0,
        });
        setSuccess(`Successfully connected to ${provider}!`);
        setApiKey(""); // Clear API key from form
      } else {
        setError(data.message || "Failed to connect to email provider");
      }
    } catch (err) {
      console.error("Error connecting:", err);
      setError("Failed to connect. Please check your credentials and try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect your email provider?")) {
      return;
    }

    try {
      const response = await fetch('/api/email-provider', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setConnectionData({
          isConnected: false,
          provider: null,
          connectedAt: null,
          lastSyncedAt: null,
          lists: [],
          templates: [],
          subscriptionCount: 0,
        });
        setProvider("");
        setApiKey("");
        setServerPrefix("");
        setSuccess("Email provider disconnected successfully");
      } else {
        setError(data.message || "Failed to disconnect");
      }
    } catch (err) {
      console.error("Error disconnecting:", err);
      setError("Failed to disconnect email provider");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/email-provider/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setConnectionData(prev => ({
          ...prev,
          lists: data.data.lists || [],
          templates: data.data.templates || [],
          lastSyncedAt: data.data.lastSyncedAt,
        }));
        setSuccess("Lists and templates synced successfully!");
      } else {
        setError(data.message || "Failed to sync");
      }
    } catch (err) {
      console.error("Error syncing:", err);
      setError("Failed to sync lists and templates");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
        <Card.Body className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Loading email settings...</span>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="email-integration">
      {/* Header */}
      <Card className="border-0 mb-3" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 style={{ fontWeight: 600, marginBottom: "5px" }}>
                📧 Email Integration
              </h6>
              <p className="mb-0" style={{ fontSize: "13px", color: "#616161" }}>
                Connect your email provider to enable email announcement bars and collect customer subscriptions.
              </p>
            </div>
            {connectionData.isConnected && (
              <Badge 
                bg="success" 
                className="d-flex align-items-center gap-1"
                style={{ fontSize: "12px", padding: "8px 12px" }}
              >
                <CheckCircleFill size={12} />
                Connected
              </Badge>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Connected State */}
      {connectionData.isConnected ? (
        <Card className="border-0" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
          <Card.Body>
            {/* Provider Info */}
            <Row className="mb-4">
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Connected Provider
                  </label>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "16px", textTransform: "capitalize" }}>
                      {connectionData.provider}
                    </span>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Total Subscriptions
                  </label>
                  <div style={{ fontSize: "16px" }}>
                    {connectionData.subscriptionCount}
                  </div>
                </div>
              </Col>
            </Row>

            {/* Lists & Templates Count */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="border-0" style={{ background: "#fff" }}>
                  <Card.Body className="text-center">
                    <h4 style={{ fontWeight: 700, color: "#5169DD" }}>
                      {connectionData.lists.length}
                    </h4>
                    <p className="mb-0" style={{ fontSize: "13px", color: "#616161" }}>
                      Email Lists
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0" style={{ background: "#fff" }}>
                  <Card.Body className="text-center">
                    <h4 style={{ fontWeight: 700, color: "#5169DD" }}>
                      {connectionData.templates.length}
                    </h4>
                    <p className="mb-0" style={{ fontSize: "13px", color: "#616161" }}>
                      Templates
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0" style={{ background: "#fff" }}>
                  <Card.Body className="text-center">
                    <p className="mb-1" style={{ fontSize: "11px", color: "#616161" }}>
                      Last Synced
                    </p>
                    <p className="mb-0" style={{ fontSize: "13px", fontWeight: 500 }}>
                      {connectionData.lastSyncedAt 
                        ? new Date(connectionData.lastSyncedAt).toLocaleDateString() 
                        : "Never"}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Actions */}
            <div className="d-flex gap-2">
              <Button
                text={
                  <span className="d-flex align-items-center gap-1">
                    <ArrowClockwise size={14} />
                    {isSyncing ? "Syncing..." : "Sync Lists & Templates"}
                  </span>
                }
                onClick={handleSync}
                disabled={isSyncing}
                style={{
                  backgroundColor: "#5169DD",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "14px",
                }}
              />
              <Button
                text={
                  <span className="d-flex align-items-center gap-1">
                    <XCircleFill size={14} />
                    Disconnect
                  </span>
                }
                onClick={handleDisconnect}
                style={{
                  backgroundColor: "rgba(196, 41, 14, 0.1)",
                  color: "#C4290E",
                  border: "1px solid #C4290E",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "14px",
                }}
              />
            </div>
          </Card.Body>
        </Card>
      ) : (
        /* Connect Form */
        <Card className="border-0" style={{ background: "#F1F2F4", borderRadius: "10px" }}>
          <Card.Body>
            {/* Provider Selection */}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600 }}>
                Select Email Provider
              </Form.Label>
              <div className="d-flex gap-3 flex-wrap">
                {EMAIL_PROVIDERS.map((p) => (
                  <Card
                    key={p.id}
                    className={`border cursor-pointer ${provider === p.id ? 'border-primary' : 'border-light'}`}
                    style={{ 
                      cursor: 'pointer',
                      background: provider === p.id ? 'rgba(81, 105, 221, 0.1)' : '#fff',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setProvider(p.id)}
                  >
                    <Card.Body className="d-flex align-items-center gap-2 py-2 px-3">
                      <Form.Check
                        type="radio"
                        name="provider"
                        checked={provider === p.id}
                        onChange={() => setProvider(p.id)}
                      />
                      <div>
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                        <p className="mb-0" style={{ fontSize: "11px", color: "#616161" }}>
                          {p.description}
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Form.Group>

            {/* API Key Input */}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 600 }}>
                API Key
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(34, 34, 34, 0.1)",
                    borderRadius: "8px 0 0 8px",
                    padding: "12px 15px",
                  }}
                />
                <Button
                  text={showApiKey ? <EyeSlashFill size={16} /> : <EyeFill size={16} />}
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(34, 34, 34, 0.1)",
                    borderLeft: "none",
                    borderRadius: "0 8px 8px 0",
                    padding: "12px 15px",
                    color: "#616161",
                  }}
                />
              </InputGroup>
              <Form.Text className="text-muted">
                {provider === 'mailchimp' 
                  ? "Find your API key in Mailchimp → Account → Extras → API keys"
                  : provider === 'klaviyo'
                  ? "Find your API key in Klaviyo → Account → Settings → API Keys"
                  : "Select a provider to see instructions"}
              </Form.Text>
            </Form.Group>

            {/* Server Prefix (Mailchimp only) */}
            {provider === 'mailchimp' && (
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600 }}>
                  Server Prefix (Optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., us1, us2"
                  value={serverPrefix}
                  onChange={(e) => setServerPrefix(e.target.value)}
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(34, 34, 34, 0.1)",
                    borderRadius: "8px",
                    padding: "12px 15px",
                  }}
                />
                <Form.Text className="text-muted">
                  The server prefix is found at the end of your API key after the dash (e.g., abc123-us1)
                </Form.Text>
              </Form.Group>
            )}

            {/* Connect Button */}
            <Button
              text={
                isConnecting ? (
                  <span className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    Connecting...
                  </span>
                ) : (
                  "Connect Email Provider"
                )
              }
              onClick={handleConnect}
              disabled={isConnecting || !provider || !apiKey}
              style={{
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px 25px",
                fontSize: "14px",
                fontWeight: 500,
                opacity: (!provider || !apiKey) ? 0.5 : 1,
              }}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
