import React, { useState, useEffect } from "react";
import PlanCard from "../components/Plans/PlanCard";
import "../components/Plans/style.css";
import { Button, Modal } from "react-bootstrap";
import createApp from "@shopify/app-bridge";
import { Redirect } from "@shopify/app-bridge/actions";
import {
  SkeletonPage,
  SkeletonBodyText,
  SkeletonDisplayText,
  Card,
  Layout,
  TextContainer,
  Spinner,
} from "@shopify/polaris";

const planData = [
  {
    id: 1,
    title: "Free",
    price: 0,
    description:
      "Access basic features with limited functionality. Ideal for personal use and exploring the core capabilities of our service.",
    buttonText: "Get Started",
    color: "#0c95d0",
    featureValue: "1",
    url: "/app",
    features: {
      appsEnabled: 1,
      otherFeatures: [
        "Announcement Bars",
        "Inactive Tab Message",
        "Basic engagement insights",
        "New stores testing apps",
      ],
    },
  },
  {
    id: 2,
    title: "Starter",
    price: 30,
    description:
      "Ideal for small projects or individual use. Includes access to essential features, priority support, and 5GB of storage for your projects.",
    buttonText: "Upgrade Now",
    url: "/app/upgrade?plan=Starter",
    color: "#4CAF50",
    features: {
      appsEnabled: "3",
      otherFeatures: [
        "Announcement Bars",
        "Inactive Tab Message",
        "Standard Bundles",
        "Mix & Match Bundles",
        "BOGO Bundles",
        "Volume Discount Bundles",
        "Growing shops adding promotions",
        "Bundle performance + engagement",
      ],
    },
  },
  {
    id: 3,
    title: "Advanced",
    price: 60,
    description:
      "Ideal for established or high-volume stores that want to maximize revenue with the complete toolkit of bundles, promotions, and engagement apps.",
    buttonText: "Upgrade Now",
    url: "/app/upgrade?plan=Advanced",
    color: "#4CAF50",
    features: {
      appsEnabled: "6",
      otherFeatures: [
        "Announcement Bars",
        "Inactive Tab Message",
        "Standard Bundles",
        "Mix & Match Bundles",
        "BOGO Bundles",
        "Volume Discount Bundles",
        "Full reporting across all apps",
        "High-volume sellers maximizing revenue",
      ],
    },
  },
];

// Skeleton Plan Card Component
const SkeletonPlanCard = () => {
  return (
    <Card sectioned>
      <div style={{ padding: "20px" }}>
        <SkeletonDisplayText size="medium" />
        <div style={{ marginTop: "15px" }}>
          <SkeletonBodyText lines={3} />
        </div>
        <div style={{ marginTop: "20px" }}>
          <SkeletonBodyText lines={1} />
        </div>
        <div style={{ marginTop: "25px" }}>
          <SkeletonBodyText lines={4} />
        </div>
        <div style={{ marginTop: "30px", height: "40px" }}>
          <SkeletonBodyText lines={1} />
        </div>
      </div>
    </Card>
  );
};

export default function PlanPage() {
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancelShow, setConfirmCancelShow] = useState(false);
  const [planToCancel, setPlanToCancel] = useState("");
  useEffect(() => {
    fetchUserSubscription();
  }, []);

  const fetchUserSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscription/getUserSubscription");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("data", data);
      if (data.status === "SUCCESS") {
        setCurrentPlan(data.data.planName);
      } else {
        console.log("data error", data);
        setError(data.data.error || "Failed to fetch subscription data");
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planName) => {
    // Don't process if already subscribed to this plan
    if (planName === currentPlan) {
      return;
    }

    setProcessing(true);
    // Special confirmation for downgrading from paid to free
    if (currentPlan !== "Free" && planName === "Free") {
      const confirmDowngrade = window.confirm(
        `Are you sure you want to downgrade from ${currentPlan} to Free plan? ` +
          `Your paid subscription will be cancelled and you'll lose access to premium features.`
      );

      if (!confirmDowngrade) {
        setProcessing(false);
        return;
      }
    }
    try {
      const response = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          Origin: "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ planName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "SUCCESS") {
        if (data.data.url) {
          // Redirect to Shopify's payment confirmation page
          const config = {
            apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
            host: new URLSearchParams(location.search).get("host") || window.__SHOPIFY_DEV_HOST,
            // forceRedirect: true,
          };
          const app = createApp(config);
          const redirect = Redirect.create(app);
          redirect.dispatch(Redirect.Action.REMOTE, {
            url: data.data.url,
            newContext: true,
          });
          // window.location.href = data.data.url;
        } else {
          // Already subscribed or no payment needed
          setModalContent({
            title: "Subscription Updated",
            message:
              data.data.message ||
              (planName === "Free"
                ? "You've been downgraded to the Free plan. Your paid subscription has been cancelled."
                : "Your subscription has been updated successfully."),
          });
          setModalShow(true);

          // Refresh subscription data
          fetchUserSubscription();
        }
      } else {
        throw new Error(data.data.error || "Subscription failed");
      }
    } catch (err) {
      console.error("Error subscribing to plan:", err);
      setModalContent({
        title: "Subscription Error",
        message: err.message || "An error occurred during subscription.",
      });
      setModalShow(true);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <SkeletonPage primaryAction>
        <div className="plan-container">
          <div style={{ marginBottom: "30px" }}>
            <SkeletonDisplayText size="large" />
          </div>
          
          {/* Current Plan Banner Skeleton */}
          <div style={{ marginBottom: "30px" }}>
            <Card sectioned>
              <SkeletonBodyText lines={1} />
            </Card>
          </div>
          
          {/* Plan Cards Skeleton */}
          <div className="plan-section">
            {[1, 2, 3].map((id) => (
              <SkeletonPlanCard key={id} />
            ))}
          </div>
        </div>
      </SkeletonPage>
    );
  }

  if (error) {
    return (
      <div className="plan-container">
        <div className="alert alert-danger m-4" role="alert">
          <h4 className="alert-heading">Error Loading Subscription</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={fetchUserSubscription}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  const handleCancelSubscription = async (planName) => {
    setCancelling(true);
    setConfirmCancelShow(false);

    try {
      const response = await fetch("/api/subscription/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "SUCCESS") {
        setModalContent({
          title: "Subscription Cancelled",
          message: data.data.message || "Your subscription has been cancelled successfully.",
          isError: false,
        });
        setModalShow(true);
        fetchUserSubscription();
      } else {
        throw new Error(data.error || "Cancellation failed");
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      setModalContent({
        title: "Cancellation Error",
        message: err.message || "An error occurred while cancelling your subscription.",
        isError: true,
      });
      setModalShow(true);
    } finally {
      setCancelling(false);
    }
  };
  const openCancelConfirmation = (planName) => {
    setPlanToCancel(planName);
    setConfirmCancelShow(true);
  };

  return (
    <>
      <div className="plan-container">
        <h1 className="plan-heading">Choose Your Plan</h1>
        <div className="current-plan-banner mb-2">
          <div className="alert alert-info d-flex justify-content-between align-items-center">
            <div>
              Your current plan: <strong>{currentPlan}</strong>
              {currentPlan !== "Free" && <span className="ms-2 text-muted">(Active subscription)</span>}
            </div>
            {currentPlan !== "Free" && (
              <Button
              className="ms-2"
                variant="outline-danger"
                size="sm"
                onClick={() => openCancelConfirmation(currentPlan)}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            )}
          </div>
        </div>
        <div className="plan-section">
          {planData.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.title === currentPlan}
              onSubscribe={handleSubscribe}
              onCancel={openCancelConfirmation}
              processing={processing}
              cancelling={cancelling}
            />
          ))}
        </div>
      </div>

      {/* Processing Modal */}
      <Modal show={processing} centered>
        <Modal.Body className="text-center">
          <Spinner animation="border" role="status" variant="primary" className="mb-3" />
          <h5>Processing your subscription</h5>
          <p>Please wait while we process your request...</p>
        </Modal.Body>
      </Modal>

      {/* Cancellation Modal */}
      <Modal show={cancelling} centered>
        <Modal.Body className="text-center">
          <Spinner animation="border" role="status" variant="danger" className="mb-3" />
          <h5>Cancelling your subscription</h5>
          <p>Please wait while we process your cancellation request...</p>
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal for Cancellation */}
      <Modal show={confirmCancelShow} onHide={() => setConfirmCancelShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to cancel your <strong>{planToCancel}</strong> subscription?
          </p>
          <p className="text-muted">
            Your access to premium features will continue until the end of your current billing period.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmCancelShow(false)}>
            Keep Subscription
          </Button>
          <Button variant="danger" onClick={() => handleCancelSubscription(planToCancel)}>
            Yes, Cancel Subscription
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Result Modal */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className={modalContent.isError ? "text-danger" : "text-success"}>
            {modalContent.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{modalContent.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={modalContent.isError ? "danger" : "primary"} onClick={() => setModalShow(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
