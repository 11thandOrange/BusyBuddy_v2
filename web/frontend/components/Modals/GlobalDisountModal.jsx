import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import BundleForm from "../../apps/bundle-discounts/BundleForm";
import BuyonegetoneForm from "../../apps/buy-one-get-one/buyoneGetone";
import VolumeForm from "../../apps/volume-discounts/VolumeForm";
import MixMatchForm from "../../apps/mix-and-match-discounts/MixMatchForm";

export default function DiscountModal({ show, onHide }) {
  const [activeComponent, setActiveComponent] = useState(null);

  // Create discount options with proper handling
  const discountOptions = [
    {
      title: "Bundle Discount",
      description: "Bundle products together and sell them at a discount price.",
      example: "Buy product A and product B for 10% off",
      icon: (
        <div className="rounded-full border-2 border-gray-400 w-12 h-12 flex items-center justify-center">
        </div>
      ),
      action: "bundleDiscount",
    },
    {
      title: "Buy One Get One",
      description: "Provide discounts when a customer purchases a qualifying product.",
      example: "Buy product A and get product B for free",
      icon: (
        <div className="w-42 h-42 flex items-center justify-center">
        </div>
      ),
      action: "bogo",
    },
    {
      title: "Volume Discounts",
      description: "Offer tiered discounts based on quantity purchased.",
      example: "Buy 2 for 5% off, buy 3 for 10% off",
      icon: (
        <div className="w-42 h-42 flex items-center justify-center">
        </div>
      ),
      action: "volumeDiscount",
    },
    {
      title: "Mix & Match",
      description: "Let customers create bundles by choosing products at a discount.",
      example: "Pick any 3 items from this collection for 15% off",
      icon: (
        <div className="w-42 h-42 flex items-center justify-center">
        </div>
      ),
      action: "mixMatch",
    },
  ];

  // Handler to go back to the main discount selection view
  const handleGoBack = () => {
    setActiveComponent(null);
  };

  // Render the selected component or show the options
  if (activeComponent === "bundleDiscount") {
    return <BundleForm setActiveAction={setActiveComponent} goBack={handleGoBack} />;
  } else if (activeComponent === "bogo") {
    return <BuyonegetoneForm setActiveAction={setActiveComponent} goBack={handleGoBack} />;
  } else if (activeComponent === "volumeDiscount") {
    return <VolumeForm setActiveAction={setActiveComponent} goBack={handleGoBack} />;
  } else if (activeComponent === "mixMatch") {
    return <MixMatchForm setActiveAction={setActiveComponent} goBack={handleGoBack} />;
  }

  // Main discount selection modal
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      aria-labelledby="discount-modal-title"
    >
      <Modal.Header closeButton className="border-bottom-0 p-4">
        <Modal.Title
          id="discount-modal-title"
          className="font-weight-bold"
          style={{
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "1",
            letterSpacing: "0",
          }}
        >
          Create Different Type of Discount
        </Modal.Title>
      </Modal.Header>
      <hr style={{ margin: "0" }} />
      <Modal.Body className="p-4">
        <div className="d-flex flex-column gap-3">
          {discountOptions.map((option, index) => (
            <div
              key={index}
              className="bg-light rounded p-3 cursor-pointer"
              style={{
                cursor: "pointer",
                transition: "background-color 0.15s ease-in-out",
              }}
              onClick={() => setActiveComponent(option.action)}
            >
              <div className="d-flex align-items-center">
                <div className="me-3 text-secondary">{option.icon}</div>
                <div className="flex-grow-1">
                  <h5
                    className="mb-1 font-weight-bold"
                    style={{
                      fontWeight: 600,
                      fontSize: "15px",
                      lineHeight: "1.3",
                      letterSpacing: "0",
                    }}
                  >
                    {option.title}
                  </h5>
                  <p
                    className="text-muted mb-1 small"
                    style={{
                      fontWeight: 500,
                      fontSize: "13px",
                      lineHeight: "1.3",
                      letterSpacing: "0",
                      color: "#616161",
                    }}
                  >
                    {option.description}
                  </p>
                  <hr style={{ margin: "10px 0" }} />
                  <p
                    className="mb-0 small"
                    style={{
                      fontWeight: 600,
                      fontSize: "13px",
                      lineHeight: "1.3",
                      letterSpacing: "0",
                    }}
                  >
                    {option.example}
                  </p>
                </div>
                <div className="d-flex align-items-center text-muted ms-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}