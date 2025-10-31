import React from "react";
import "./style.css";
import { Button } from "react-bootstrap";

const PlanCard = ({
  plan,
  isCurrentPlan,
  onSubscribe,
  onCancel,
  processing,
  cancelling,
}) => {
  const handleButtonClick = () => {
    if (!isCurrentPlan && !processing && !cancelling) {
      onSubscribe(plan.title);
    }
  };

  const handleCancelClick = () => {
    if (isCurrentPlan && !cancelling) {
      onCancel(plan.title);
    }
  };

  return (
    <div className="planboxes">
      <div
        className={`plan-card ${isCurrentPlan ? "current-plan" : ""}`}
        style={{ backgroundColor: `${plan.color}` }}
      >
        {isCurrentPlan && <div className="current-badge">Current Plan</div>}
        <div className="plan-content">
          <div className="upper-wrapper">
            <h2>{plan.title}</h2>
            <div>
              <p className="price d-flex justify-content-center">
                <sup>$</sup>
                {plan.price}{" "}
                <span className="price-per-month ms-1 mt-3">/Month</span>
              </p>
              <p className="description">{plan.description}</p>
            </div>
            <div className="d-flex flex-column gap-2">
              {isCurrentPlan && plan.title !== "Free" ? (
                <Button
                 className="Polaris-Link"
                  variant="outline-light"
                  size="sm"
                  disabled={cancelling}
                  onClick={handleCancelClick}
                >
                  {cancelling ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              ) : (
                <Button
                  className="Polaris-Link"
                  variant={isCurrentPlan ? "outline-light" : "light"}
                  disabled={isCurrentPlan || processing || cancelling}
                  onClick={handleButtonClick}
                >
                  {processing
                    ? "Processing..."
                    : isCurrentPlan
                      ? "Current Plan"
                      : plan.buttonText}
                </Button>
              )}
            </div>
          </div>
          <div className="card-footer mt-2 ms-2">
            <div className="feature-content">
              <p className="title">Features</p>
              <div className="list-wrap">
                <label># of Apps Enabled</label>
                <span className="value">{plan.features.appsEnabled}</span>
              </div>
              <div className="features">
                {plan.features.otherFeatures.map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
