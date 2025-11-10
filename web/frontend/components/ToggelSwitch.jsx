import { useState, useEffect } from "react";

const ToggleSwitch = ({ appId }) => {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasAppAccess, setHasAppAccess] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [isDisabledButton, setIsDisabledButton] = useState(false);

  useEffect(() => {
    fetchInitialStatus();
    fetchSubscriptionInfo();
    isDisabled();
  }, [appId]);

  useEffect(() => {
    isDisabled();
  }, [subscriptionInfo, active, loading, hasAppAccess]);

  const fetchInitialStatus = async () => {
    try {
      const response = await fetch(`/api/subscription/app-status?appId=${appId}`);
      const data = await response.json();

      if (data.status === "SUCCESS") {
        setActive(data.data.isEnabled || false);
      }
    } catch (error) {
      console.error("Error fetching app status:", error);
    }
  };

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch("/api/subscription/getUserSubscription");
      const data = await response.json();

      if (data.status === "SUCCESS") {
        const { planName } = data.data;

        // Allowed apps per plan
        const allowedApps = {
          Free: ["announcement_bar", "inactive_tab"],
          Starter: [
            "announcement_bar",
            "inactive_tab",
            "bundle_discount",
            "buy_one_get_one",
            "volume_discounts",
            "mix_match",
          ],
          Advanced: [
            "announcement_bar",
            "inactive_tab",
            "bundle_discount",
            "buy_one_get_one",
            "volume_discounts",
            "mix_match",
          ],
        };

        const hasAccess = allowedApps[planName]?.includes(appId) || false;
        setHasAppAccess(hasAccess);

        if (!hasAccess) {
          setError("Feature not available in your current plan");
        }

        setSubscriptionInfo(data.data);
      }
    } catch (error) {
      console.error("Error checking app access:", error);
      setHasAppAccess(false);
      setError("Unable to verify subscription");
    }
  };

  const checkCanEnable = () => {
    if (!subscriptionInfo) return { canEnable: false, reason: "No subscription info" };

    const { planName, enabledAppsCount } = subscriptionInfo;

    // Define max apps per plan
    const maxApps = {
      Free: 1,
      Starter: 3,
      Advanced: 6,
    };

    const maxAppsAllowed = maxApps[planName] ?? 0;

    // 🚨 Rule: if already at max and trying to enable another
    if (!active && enabledAppsCount >= maxAppsAllowed) {
      return {
        canEnable: false,
        reason:
          planName === "Free"
            ? "Only one app can be active on your current plan. Upgrade to enable more."
            : `You've reached your app limit (${enabledAppsCount}/${maxAppsAllowed})`,
      };
    }

    return { canEnable: true };
  };

  const toggleSwitch = async () => {
    if (loading || !hasAppAccess) return;

    const newActiveState = !active;

    if (!newActiveState) {
      // disabling → always allowed
      await performToggle(newActiveState);
      return;
    }

    // enabling → check limits
    const canEnable = checkCanEnable();
    if (!canEnable.canEnable) {
      setError(canEnable.reason);
      setTimeout(() => setError(null), 3000);
      return;
    }

    await performToggle(newActiveState);
  };

  const performToggle = async (newState) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscription/toggle-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, enable: newState }),
      });

      const data = await response.json();
      if (data.status === "SUCCESS") {
        setActive(newState);
        // refresh subscription info after toggle
        fetchSubscriptionInfo();
      } else {
        throw new Error(data.error || "Failed to toggle app");
      }
    } catch (error) {
      setError(error.message || "Network error. Please try again.");
      setTimeout(() => setError(null), 3000);
      setActive(active);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = () => {
    // always block if loading or no access
    if (loading || !hasAppAccess) {
      setIsDisabledButton(true);
      return;
    }

    if (!subscriptionInfo) {
      setIsDisabledButton(false);
      return;
    }

    const { planName, enabledAppsCount } = subscriptionInfo;
    const maxApps = { Free: 1, Starter: 3, Advanced: 6 };

    // Only check limits when trying to enable (active === false)
    if (!active && enabledAppsCount >= maxApps[planName]) {
      setIsDisabledButton(true); // prevent enabling
    } else {
      setIsDisabledButton(false); // allow disabling or enabling within limit
    }
  };

  const getToggleTitle = () => {
    if (!hasAppAccess) return "Feature not available in your current plan";
    if (loading) return "Processing...";
    if (active) return "Click to disable";
    return "Click to enable";
  };

  return (
    <div
      className="d-flex align-items-center"
      style={{ cursor: isDisabledButton ? "not-allowed" : "pointer" }}
      onClick={isDisabledButton && !active ? undefined : toggleSwitch}
      title={isDisabledButton && !active ? "Upgrade your plan to enable more apps" : getToggleTitle()}
    >
      {error && (
        <div
          className="position-absolute"
          style={{
            transform: "translateY(-100%)",
            background: "white",
            color: "#dc3545",
            padding: "4px 8px",
            borderRadius: "4px",
            border: "1px solid #f5c6cb",
            fontSize: "12px",
            zIndex: 1000,
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </div>
      )}

      <div
        className={`position-relative ${active ? "bg-success" : "bg-danger"} ${
          isDisabledButton ? "opacity-50" : ""
        }`}
        style={{
          width: "132px",
          height: "48px",
          padding: "4px",
          borderRadius: "15px",
        }}
        onClick={isDisabledButton ? undefined : toggleSwitch}
      >
        {/* loading overlay */}
        {loading && (
          <div
            className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "15px",
              zIndex: 2,
              top: 0,
              left: 0,
            }}
          >
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* not available overlay */}
        {!hasAppAccess && !loading && (
          <div
            className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              borderRadius: "15px",
              zIndex: 2,
              top: 0,
              left: 0,
            }}
          >
            <span className="text-white fw-medium" style={{ fontSize: "10px" }}>
              Not Available
            </span>
          </div>
        )}

        {/* switch slider */}
        <div
          className="bg-white position-absolute"
          style={{
            width: "50px",
            height: "40px",
            transition: "all 0.3s ease",
            left: active ? "78px" : "5px",
            top: "4px",
            borderRadius: "11px",
            zIndex: 1,
          }}
        />

        {/* labels */}
        <div className="d-flex align-items-center justify-content-between h-100 px-3">
          <span
            className="text-white fw-medium"
            style={{ visibility: active ? "visible" : "hidden", zIndex: 1 }}
          >
            Active
          </span>
          <span
            className="text-white fw-medium ms-auto"
            style={{ visibility: active ? "hidden" : "visible", zIndex: 1 }}
          >
            Inactive
          </span>
        </div>
      </div>
    </div>
  );
};

export default ToggleSwitch;
