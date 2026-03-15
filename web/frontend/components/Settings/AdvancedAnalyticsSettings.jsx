import React, { useState, useEffect, useCallback } from "react";
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

  const fetchGoogleAccountStatus = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchGoogleAccountStatus();
  }, [fetchGoogleAccountStatus]);

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

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to initiate Google connection");
      }

      if (result.data?.authUrl) {
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
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  const handleDisconnectGoogle = async () => {
    try {
      const response = await fetch("/api/analytics/google/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to disconnect Google account");
      }

      setGoogleAccount(null);
      setShowDisconnectModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSwitchAccount = () => {
    setShowSwitchModal(false);
    handleConnectGoogle();
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading Google Analytics settings...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pb-0">
          <div className="d-flex align-items-center gap-2">
            <Google size={24} className="text-primary" />
            <h5 className="mb-0">Google Analytics Integration</h5>
          </div>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {googleAccount?.connected ? (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-2">
                    <CheckCircle size={24} className="text-success" />
                  </div>
                  <div>
                    <h6 className="mb-0">Connected</h6>
                    <small className="text-muted">
                      Analytics data is being tracked
                    </small>
                  </div>
                </div>
                <Badge bg="success">Active</Badge>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <div className="border rounded p-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <PersonCircle size={20} className="text-muted" />
                      <small className="text-muted">Connected Account</small>
                    </div>
                    <p className="mb-0 fw-medium">{googleAccount.email}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="border rounded p-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <BoxArrowUpRight size={20} className="text-muted" />
                      <small className="text-muted">Property</small>
                    </div>
                    <p className="mb-0 fw-medium">
                      {googleAccount.propertyName || "All Properties"}
                    </p>
                  </div>
                </Col>
              </Row>

              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowSwitchModal(true)}
                >
                  <ArrowRepeat size={16} className="me-1" />
                  Switch Account
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowDisconnectModal(true)}
                >
                  <XCircle size={16} className="me-1" />
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                <Google size={48} className="text-muted" />
              </div>
              <h5>Connect Google Analytics</h5>
              <p className="text-muted mb-4">
                Link your Google Analytics account to track visitor behavior,
                conversions, and more directly in your dashboard.
              </p>
              <Button
                variant="primary"
                onClick={handleConnectGoogle}
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Google size={16} className="me-2" />
                    Connect Google Analytics
                  </>
                )}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Disconnect Confirmation Modal */}
      <Modal
        show={showDisconnectModal}
        onHide={() => setShowDisconnectModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Disconnect Google Analytics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to disconnect your Google Analytics account?
          </p>
          <p className="text-muted small">
            You will no longer see Google Analytics data in your dashboard until
            you reconnect.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDisconnectModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDisconnectGoogle}>
            Disconnect
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Switch Account Confirmation Modal */}
      <Modal
        show={showSwitchModal}
        onHide={() => setShowSwitchModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Switch Google Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Do you want to connect a different Google Analytics account?
          </p>
          <p className="text-muted small">
            Your current connection will be replaced with the new account.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowSwitchModal(false)}
          >
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
