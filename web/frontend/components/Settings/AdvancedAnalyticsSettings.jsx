import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
  Modal,
} from "react-bootstrap";
import {
  Google,
  CheckCircle,
  XCircle,
  ArrowRepeat,
  BoxArrowUpRight,
  PersonCircle,
} from "react-bootstrap-icons";

export default function AdvancedAnalyticsSettings() {
  const [googleAccount, setGoogleAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  useEffect(() => {
    fetchGoogleAccountStatus();
  }, []);

  const fetchGoogleAccountStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/google/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Google account status");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setGoogleAccount(result.data);
      } else {
        setGoogleAccount(null);
      }
    } catch (err) {
      setError(err.message);
      setGoogleAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setConnecting(true);
      setError("");
      
      const response = await fetch("/api/analytics/google/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to initiate Google connection");
      }

      const result = await response.json();
      if (result.success && result.data?.authUrl) {
        // Open Google OAuth in a new window
        window.open(result.data.authUrl, "_blank", "width=600,height=700");
        // Poll for connection status
        pollConnectionStatus();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const pollConnectionStatus = () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/analytics/google/status");
        const result = await response.json();
        if (result.success && result.data?.connected) {
          setGoogleAccount(result.data);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Error polling connection status:", err);
      }
    }, 3000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const handleDisconnectGoogle = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/analytics/google/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect Google account");
      }

      setGoogleAccount(null);
      setShowDisconnectModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    setShowSwitchModal(false);
    await handleDisconnectGoogle();
    await handleConnectGoogle();
  };

  if (loading && !googleAccount) {
    return (
      <Card className="shadow-sm border-0 rounded-3 mb-4">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading Google Analytics settings...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm border-0 rounded-3 mb-4">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#4285f4",
                  color: "white",
                }}
              >
                <Google size={20} />
              </div>
              <div>
                <h5 className="mb-0">Advanced Analytics</h5>
                <small className="text-muted">
                  Connect Google Analytics to view your data alongside Shopify analytics
                </small>
              </div>
            </div>
            <Badge
              bg={googleAccount?.connected ? "success" : "secondary"}
              className="px-3 py-2"
            >
              {googleAccount?.connected ? "Connected" : "Not Connected"}
            </Badge>
          </div>

          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}

          {googleAccount?.connected ? (
            <div className="mt-4">
              {/* Connected Account Info */}
              <Card className="border bg-light mb-3">
                <Card.Body className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <PersonCircle size={40} className="text-primary" />
                    <div>
                      <h6 className="mb-0">{googleAccount.email}</h6>
                      <small className="text-muted">
                        Property: {googleAccount.propertyName || "All Properties"}
                      </small>
                      <br />
                      <small className="text-muted">
                        Connected: {new Date(googleAccount.connectedAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <CheckCircle size={24} className="text-success" />
                </Card.Body>
              </Card>

              {/* Action Buttons */}
              <Row className="g-2">
                <Col xs={12} sm={6}>
                  <Button
                    variant="outline-primary"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setShowSwitchModal(true)}
                  >
                    <ArrowRepeat size={18} />
                    Switch Account
                  </Button>
                </Col>
                <Col xs={12} sm={6}>
                  <Button
                    variant="outline-danger"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setShowDisconnectModal(true)}
                  >
                    <XCircle size={18} />
                    Disconnect
                  </Button>
                </Col>
              </Row>

              {/* Info about data */}
              <Alert variant="info" className="mt-3 mb-0">
                <small>
                  <strong>Note:</strong> Google Analytics data will appear on the Analytics tab.
                  Data may take a few minutes to sync after connecting.
                </small>
              </Alert>
            </div>
          ) : (
            <div className="mt-4">
              {/* Connect Button */}
              <div className="text-center py-4">
                <div className="mb-4">
                  <Google size={48} className="text-muted mb-3" />
                  <h6>Connect Your Google Analytics Account</h6>
                  <p className="text-muted small mb-0">
                    View your Google Analytics data alongside Shopify data in one place.
                    Connect your account to get started.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="d-flex align-items-center justify-content-center gap-2 mx-auto"
                  onClick={handleConnectGoogle}
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Google size={20} />
                      Connect Google Analytics
                      <BoxArrowUpRight size={14} />
                    </>
                  )}
                </Button>
              </div>

              {/* Features List */}
              <Row className="mt-4 g-3">
                <Col md={4}>
                  <div className="text-center p-3 border rounded bg-light">
                    <div className="mb-2">📊</div>
                    <small className="text-muted">
                      View traffic data alongside Shopify analytics
                    </small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border rounded bg-light">
                    <div className="mb-2">🔄</div>
                    <small className="text-muted">
                      Automatic data sync with your store
                    </small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border rounded bg-light">
                    <div className="mb-2">🔒</div>
                    <small className="text-muted">
                      Secure OAuth connection to Google
                    </small>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Disconnect Confirmation Modal */}
      <Modal show={showDisconnectModal} onHide={() => setShowDisconnectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <XCircle size={24} className="text-danger" />
            Disconnect Google Analytics
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to disconnect your Google Analytics account?
          </p>
          <p className="text-muted small mb-0">
            You will no longer see Google Analytics data on the Analytics tab.
            You can reconnect at any time.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDisconnectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDisconnectGoogle}>
            Disconnect
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Switch Account Confirmation Modal */}
      <Modal show={showSwitchModal} onHide={() => setShowSwitchModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <ArrowRepeat size={24} className="text-primary" />
            Switch Google Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This will disconnect the current Google account and let you connect a different one.
          </p>
          <p className="text-muted small mb-0">
            Current account: <strong>{googleAccount?.email}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSwitchModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSwitchAccount}>
            Switch Account
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
