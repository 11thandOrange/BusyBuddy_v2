import React from 'react';
import { Modal, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';

const DiscountPreviewModal = ({ show, onHide, discount }) => {
  if (!discount) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderProductOptions = (options) => {
    return options.map((option, idx) => (
      <div key={idx} className="mb-2">
        <strong>{option.name}:</strong>
        <div className="d-flex flex-wrap gap-1 mt-1">
          {option.values.map((value, i) => (
            <Badge key={i} bg="secondary" className="me-1">
              {value}
            </Badge>
          ))}
        </div>
      </div>
    ));
  };

  const renderTieredDiscounts = () => {
    // Assuming your volume discounts have tiers data
    // You'll need to adjust this based on your actual data structure
    if (!discount.tiers || discount.tiers.length === 0) {
      return <div className="text-muted">No tiered discounts configured</div>;
    }

    return (
      <ListGroup variant="flush" className="border rounded">
        {discount.tiers.map((tier, index) => (
          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Buy {tier.quantity}+</strong>
            </div>
            <Badge bg="success">
              {tier.discountValue}% OFF
            </Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          {discount.title}
          <Badge bg={discount.type === 'Bundle Discount' ? 'primary' : 'warning'} className="ms-2">
            {discount.type}
          </Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <Row>
          <Col md={6}>
            <div className="border rounded p-3 mb-3">
              <h5 className="fw-bold mb-3">
                {discount.type === 'Bundle Discount' ? 'Products in Bundle' : 'Applicable Products'}
              </h5>
              {discount.products.map((product, idx) => (
                <div key={idx} className="mb-4">
                  <div className="d-flex align-items-start mb-2">
                    <img
                      src={product.media}
                      alt={product.title}
                      width={80}
                      height={80}
                      className="rounded me-3"
                      style={{ objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="fw-bold mb-1">{product.title}</h6>
                      {discount.type === 'Bundle Discount' && (
                        <div className="text-muted small mb-2">Qty: {product.quantity}</div>
                      )}
                      {product.optionSelections && renderProductOptions(product.optionSelections)}
                    </div>
                  </div>
                  {idx < discount.products.length - 1 && <hr className="my-2" />}
                </div>
              ))}
            </div>
          </Col>

          <Col md={6}>
            <div className="border rounded p-3 mb-3">
              <h5 className="fw-bold mb-3">Discount Details</h5>
              {discount.type === 'Volume Discount' ? (
                <>
                  <div className="mb-3">
                    <strong>Discount Type:</strong>
                    <Badge bg="info" className="ms-2">
                      Volume Discount
                    </Badge>
                  </div>
                  {renderTieredDiscounts()}
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <strong>Discount Type:</strong>
                    <Badge bg="info" className="ms-2">
                      {discount.discountType} ({discount.discountValue}%)
                    </Badge>
                  </div>
                </>
              )}
              <div className="mb-3">
                <strong>Status:</strong>
                <Badge bg={discount.status ? "success" : "secondary"} className="ms-2">
                  {discount.status ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="mb-3">
                <strong>Priority:</strong> {discount.priority}
              </div>
              <div className="mb-3">
                <strong>Internal Name:</strong> {discount.internalName}
              </div>
            </div>

            <div className="border rounded p-3 mb-3">
              <h5 className="fw-bold mb-3">Schedule</h5>
              <div className="mb-2">
                {/* <strong>Start:</strong> {discount.startDate} */}
                <strong>Start:</strong> {formatDate(discount.startDate)}
              </div>
              <div className="mb-2">
                <strong>End:</strong> {formatDate(discount.endDate)}
              </div>
            </div>

            <div className="border rounded p-3">
              <h5 className="fw-bold mb-3">Display Settings</h5>
              <div className="d-flex flex-wrap gap-2 mb-2">
                <div 
                  className="color-swatch"
                  style={{ backgroundColor: discount.widgetAppearance.primaryTextColor }}
                  title="Primary Text Color"
                ></div>
                <div 
                  className="color-swatch"
                  style={{ backgroundColor: discount.widgetAppearance.secondaryTextColor }}
                  title="Secondary Text Color"
                ></div>
                <div 
                  className="color-swatch"
                  style={{ backgroundColor: discount.widgetAppearance.PrimaryBackgroundColor }}
                  title="Primary Background"
                ></div>
                <div 
                  className="color-swatch"
                  style={{ backgroundColor: discount.widgetAppearance.secondaryBackgroundColor }}
                  title="Secondary Background"
                ></div>
              </div>
              <div className="small text-muted">
                <div>Corner Radius: {discount.widgetAppearance.cardCornerRadius}px</div>
                <div>Top Margin: {discount.widgetAppearance.topMargin}px</div>
                <div>Bottom Margin: {discount.widgetAppearance.bottomMargin}px</div>
                {discount.widgetAppearance.isShowCountDownTimer && (
                  <div>Countdown Timer: Enabled</div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          className="px-4"
        >
          Close
        </Button>
      </Modal.Footer>
      
      <style jsx>{`
        .color-swatch {
          width: 20px;
          height: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: help;
        }
      `}</style>
    </Modal>
  );
};

export default DiscountPreviewModal;