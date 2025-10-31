import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Accordion,
  Modal,
  Form,
} from "react-bootstrap";
import {
  Gear,
  BoxSeam,
  CheckCircle,
  XCircle,
  ExclamationTriangle,
} from "react-bootstrap-icons";

export default function Settings() {
  const [smartBundle, setSmartBundle] = useState("enabled");
  const [discountCombination, setDiscountCombination] = useState("enabled");
  const [showModal, setShowModal] = useState(false);

  return (
    <Container fluid className="py-4">
      <Row className="g-4">
        {/* Smart Bundle Detection */}
        <Col xs={12}>
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body>
              <h4 className="d-flex align-items-center gap-2 mb-2">
                <BoxSeam size={22} className="text-primary" />
                Smart Bundle Detection (Priority Manager)
              </h4>
              <p className="text-muted">
                Control how bundles are displayed when the same product is part
                of multiple bundle offers.
              </p>

              {/* Enabled Option */}
              <div
                className={`border rounded p-3 mb-3 ${
                  smartBundle === "enabled" ? "bg-light" : ""
                }`}
                onClick={() => setSmartBundle("enabled")}
                style={{ cursor: "pointer" }}
              >
                <Form.Check
                  type="radio"
                  id="smart-enabled"
                  label={
                    <span className="d-flex align-items-center gap-2">
                      <CheckCircle size={18} className="text-success" />
                      Enabled
                    </span>
                  }
                  checked={smartBundle === "enabled"}
                  onChange={() => setSmartBundle("enabled")}
                />
                <p className="small text-muted ms-4 mt-2">
                  Show only the bundle with the greatest priority.
                  <br />
                  Example: 10 priority BOGO vs 20 priority Volume Discount →
                  only show the 20 priority Volume Discount offer.
                </p>
              </div>

              {/* Disabled Option */}
              <div
                className={`border rounded p-3 ${
                  smartBundle === "disabled" ? "bg-light" : ""
                }`}
                onClick={() => setSmartBundle("disabled")}
                style={{ cursor: "pointer" }}
              >
                <Form.Check
                  type="radio"
                  id="smart-disabled"
                  label={
                    <span className="d-flex align-items-center gap-2">
                      <XCircle size={18} className="text-danger" />
                      Disabled
                    </span>
                  }
                  checked={smartBundle === "disabled"}
                  onChange={() => setSmartBundle("disabled")}
                />
                <p className="small text-muted ms-4 mt-2">
                  Show all applicable bundle offers.
                </p>

                {/* {smartBundle === "disabled" && (
                  <Accordion defaultActiveKey="0" className="ms-4 mt-2">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>View Example</Accordion.Header>
                      <Accordion.Body>
                        Product in 20% off BOGO and 10% Volume Discount → show
                        both offers, one expanded at a time.
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                )} */}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Discount Combination */}
        <Col xs={12}>
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body>
              <h4 className="d-flex align-items-center gap-2 mb-2">
                <Gear size={22} className="text-warning" />
                Discount Combination
              </h4>
              <p className="text-muted">
                {/* Control whether bundle discounts can be combined with other
                discount codes. */}
                Allow bundle discounts to combine with other discount codes.
                  <br />
                  Example: Bundle 10% off + code WELCOME10 → both apply.
              </p>

              {/* Enabled Option */}
              {/* <div
                className={`border rounded p-3 mb-3 ${
                  discountCombination === "enabled" ? "bg-light" : ""
                }`}
                onClick={() => setDiscountCombination("enabled")}
                style={{ cursor: "pointer" }}
              >
                <Form.Check
                  type="radio"
                  id="discount-enabled"
                  label={
                    <span className="d-flex align-items-center gap-2">
                      <CheckCircle size={18} className="text-success" />
                      Enabled
                    </span>
                  }
                  checked={discountCombination === "enabled"}
                  onChange={() => setDiscountCombination("enabled")}
                />
                <p className="small text-muted ms-4 mt-2">
                  Allow bundle discounts to combine with other discount codes.
                  <br />
                  Example: Bundle 10% off + code WELCOME10 → both apply.
                </p>
              </div> */}

              {/* Disabled Option */}
              {/* <div
                className={`border rounded p-3 ${
                  discountCombination === "disabled" ? "bg-light" : ""
                }`}
                onClick={() => {
                  setDiscountCombination("disabled");
                  setShowModal(true);
                }}
                style={{ cursor: "pointer" }}
              >
                <Form.Check
                  type="radio"
                  id="discount-disabled"
                  label={
                    <span className="d-flex align-items-center gap-2">
                      <XCircle size={18} className="text-danger" />
                      Disabled
                    </span>
                  }
                  checked={discountCombination === "disabled"}
                  onChange={() => {
                    setDiscountCombination("disabled");
                    setShowModal(true);
                  }}
                />
                <p className="small text-muted ms-4 mt-2">
                  Bundle discounts cannot be combined with other discount codes.
                </p>
              </div> */}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Error Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <ExclamationTriangle size={20} className="text-danger" />
            Discount Restriction
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This discount can’t be combined with other promo codes.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Got it
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
