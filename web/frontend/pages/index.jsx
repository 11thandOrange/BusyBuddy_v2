import { useEffect, useState } from "react";
import {
  Layout,
  Banner,
  Card,
  Spinner,
  TextContainer,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  Button,
} from "@shopify/polaris";
import Header from "../components/Header";
import MarshallPage from "../pages/MarshallPage";
import "../pages/index.css";
import busyBuddy from "../assets/busyBuddy.png";
import { useNavigate } from "react-router-dom";
const tabsList = [
  "Announcement Bar",
  "Inactive Tab Message",
  "Bundle Discount",
  "Buy One Get One",
  "Volume Discounts",
  "Mix & Match",
];

// Define which features are available for each plan
const planFeatures = {
  Free: ["Announcement Bar", "Inactive Tab Message"],
  Starter: [
    "Announcement Bar",
    "Inactive Tab Message",
    "Bundle Discount",
    "Buy One Get One",
    "Volume Discounts",
  ],
  Advanced: [
    "Announcement Bar",
    "Inactive Tab Message",
    "Bundle Discount",
    "Buy One Get One",
    "Volume Discounts",
    "Mix & Match",
  ],
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Announcement Bar");
  const [showContent, setShowContent] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBusyBuddyEnabled, setIsBusyBuddyEnabled] = useState(true); // Assume enabled by default
  const navigate = useNavigate();
  // Fetch user subscription on component mount
  useEffect(() => {
    fetchUserSubscription();
    checkBusyBuddyEnabledStatus();
  }, []);
  useEffect(() => {
    checkBusyBuddyEnabledStatus();
  }, [isBusyBuddyEnabled]);
  const fetchUserSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscription/getUserSubscription");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "SUCCESS") {
        setCurrentPlan(data.data.planName);
      } else {
        setError(data.data.error || "Failed to fetch subscription data");
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if BusyBuddy is enabled in theme settings
  const checkBusyBuddyEnabledStatus = async () => {
    try {
      const response = await fetch("/api/subscription/checkBusyBuddyEnabled");
      const data = await response?.json();
    if (data?.status === "SUCCESS") {
        setIsBusyBuddyEnabled(data.data.enabled);
      }
    } catch (err) {
      console.error("Error checking BusyBuddy status:", err);
      // If there's an error, we'll assume it's not enabled to show the banner
      setIsBusyBuddyEnabled(false);
    }
  };

  const handleMakeBundleNowClick = (val = false) => {
    setShowContent(val);
  };

  // Check if current tab is accessible with current plan
  const isTabAccessible = (tabName) => {
    return planFeatures[currentPlan]?.includes(tabName) || false;
  };

  // Get upgrade URL based on required plan
  const getUpgradeUrl = (requiredPlan) => {
    const planUrls = {
      Starter: "/plan",
      Advanced: "/plan",
    };
    return planUrls[requiredPlan] || "/plans";
  };

  // Get required plan for a feature
  const getRequiredPlan = (tabName) => {
    if (planFeatures["Free"].includes(tabName)) return "Free";
    if (planFeatures["Starter"].includes(tabName)) return "Starter";
    if (planFeatures["Advanced"].includes(tabName)) return "Advanced";
    return "Free";
  };

  // Handle enable button click
  const handleEnableBusyBuddy = () => {
    fetch("/api/subscription/getThemeEditorUrl")
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "SUCCESS") {
          window.open(data.data.url, "_blank");
          setIsBusyBuddyEnabled(false);
        } else {
          console.error("Could not get theme editor URL");
        }
      })
      .catch((err) => {
        console.error("Error fetching theme editor URL:", err);
      });
  };

  if (loading) {
    return (
      <SkeletonPage primaryAction secondaryActions={2}>
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <SkeletonBodyText />
            </Card>
            <Card sectioned>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </Card>
            <Card sectioned>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </Card>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }
  const handleBannerAction = () => {
    navigate("/plan");
  };
  return (
    <div className="layoutbox">
      {showContent && (
        <>
          <div
            className="d-flex gap-3 linrrow"
            style={{ padding: "30px 0", width: "100%" }}
          >
            <img src={busyBuddy} width={50} height={50} />
            <div className="d-flex flex-column gap-2">
              <h2
                style={{
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fontWeight: "600",
                  fontSize: "20px",
                  lineHeight: "100%",
                  color: " #303030",
                }}
              >
                BusyBuddy
              </h2>
              <p
                style={{
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fontWeight: "500",
                  fontSize: "12px",
                  lineHeight: "100%",
                  color: " #616161",
                }}
              >
                Every busy body needs busybuddy
              </p>
            </div>
          </div>

          <div className="mt-2" style={{ padding: "20px 0 0 0" }}>
            <h5
              style={{ fontWeight: 600, fontSize: "20px", lineHeight: "100%" }}
            >
              Essential Apps
            </h5>
            <p
              className="text-muted"
              style={{
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "100%",
                letterSpacing: "0%",
                marginTop: "15px",
              }}
            >
              Get Noticed! Want to make sure your message doesn't get missed?
              Announcement Bar lets you display important alerts right at the
              top of your store. Whether it's a sale, promotion, or update, it's
              impossible to ignore!
            </p>

            {/* BusyBuddy Enable Announcement Banner */}
            {!isBusyBuddyEnabled && (
              <div style={{ marginBottom: "20px", marginTop: "15px" }}>
                <Banner
                  title="Please enable BusyBuddy in theme settings."
                  status="warning"
                  action={{
                    content: "Enable",
                    onAction: handleEnableBusyBuddy,
                  }}
                  secondaryAction={{
                    content: <Button>Refresh Status</Button>,
                    onAction: checkBusyBuddyEnabledStatus,
                  }}
                >
                  <p>
                    This is required by Shopify.{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        // Add link to documentation or help article here
                        // window.open("https://help.busybuddy.com/enable-theme-settings", "_blank");
                        window.open(
                          "https://www.canva.com/design/DAGaOdJ6UjU/tLvKCz0PGaWoFhZ-uoYVhQ/view?utm_content=DAGaOdJ6UjU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hc1ea38183e",
                          "_blank"
                        );
                      }}
                      style={{ textDecoration: "underline" }}
                    >
                      Learn more here
                    </a>
                  </p>
                </Banner>
              </div>
            )}
            {/* Current Plan Banner */}
            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
              <Banner
                title={`Current Plan: ${currentPlan}`}
                status="info"
                action={{
                  content: "View Plans",
                  onAction: handleBannerAction,
                }}
              >
                {currentPlan === "Free" &&
                  "Upgrade to access more features and increase your app limits."}
                {currentPlan === "Starter" &&
                  "You have access to essential features. Upgrade to Advanced for full capabilities."}
                {currentPlan === "Advanced" &&
                  "You have full access to all features. Thank you for being a valued customer!"}
              </Banner>
            </div>
          </div>
        </>
      )}

      {showContent && (
        <Header
          tabs={tabsList}
          defaultActiveTab={activeTab}
          setActiveTab={setActiveTab}
          currentPlan={currentPlan}
          isTabAccessible={isTabAccessible}
        />
      )}

      {!isTabAccessible(activeTab) ? (
        <Layout.Section>
          <Card sectioned>
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <h2>Feature Not Available</h2>
              <p style={{ margin: "20px 0" }}>
                The "{activeTab}" feature is not available on your current plan
                ({currentPlan}). Upgrade to {getRequiredPlan(activeTab)} plan to
                access this feature.
              </p>
              <div style={{ marginTop: "30px" }}>
                <a
                  href={getUpgradeUrl(getRequiredPlan(activeTab))}
                  className="Polaris-Button Polaris-Button--primary"
                  style={{
                    textDecoration: "none",
                    padding: "12px 24px",
                    backgroundColor: "#007bff",
                    color: "white",
                    borderRadius: "4px",
                    fontWeight: "500",
                  }}
                >
                  Upgrade to {getRequiredPlan(activeTab)}
                </a>
              </div>
            </div>
          </Card>
        </Layout.Section>
      ) : (
        <MarshallPage
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onMakeBundleNowClick={handleMakeBundleNowClick}
          currentPlan={currentPlan}
        />
      )}
    </div>
  );
}
