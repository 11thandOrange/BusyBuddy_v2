import { useEffect, useState } from "react";

// Unique per-app color so 6 of these on 6 different homepages never look
// interchangeable. Mirrors each widget's existing brand color in
// pages/DashboardHome.jsx's widgetConfig rather than inventing a new palette.
const APP_BRAND = {
  announcement_bar: { name: "Announcement Bar", bg: "#eef0ff", accent: "#4f46e5" },
  bundle_discount: { name: "Bundle Discount", bg: "#eaf3ff", accent: "#0b76ef" },
  buy_one_get_one: { name: "Buy One Get One", bg: "#e8fbee", accent: "#0f7a3b" },
  volume_discounts: { name: "Volume Discounts", bg: "#fdecec", accent: "#d63535" },
  mix_match: { name: "Mix & Match", bg: "#f2e8ff", accent: "#7c3aed" },
  inactive_tab: { name: "Inactive Tab Message", bg: "#f4f4f2", accent: "#6b7280" },
};

// Shown on each app's own homepage (not the Dashboard) when that app's
// theme block/embed isn't enabled yet, so a merchant lands here already
// knowing which specific app to go turn on - deep-linking straight to it.
export default function ThemeExtensionBanner({ appId }) {
  const [extensionEnabled, setExtensionEnabled] = useState(null);
  const [editorUrl, setEditorUrl] = useState("#");

  const brand = APP_BRAND[appId];

  const checkStatus = async () => {
    try {
      const response = await fetch(`/api/subscription/extension-status?appId=${appId}`);
      const data = await response.json();
      setExtensionEnabled(data.status === "SUCCESS" ? data.data.extensionEnabled : true);
    } catch (error) {
      setExtensionEnabled(true); // default to enabled (hide the banner) if the check itself fails
    }
  };

  const fetchEditorUrl = async () => {
    try {
      const response = await fetch(`/api/subscription/getThemeEditorUrl?appId=${appId}`);
      const data = await response.json();
      if (data.status === "SUCCESS") setEditorUrl(data.data.url);
    } catch (error) {
      // leave the "#" fallback
    }
  };

  useEffect(() => {
    checkStatus();
    fetchEditorUrl();
  }, [appId]);

  // Shopify has no webhook for a merchant toggling a theme block/embed, so
  // the only way to notice they came back from the theme editor is to
  // recheck when this tab regains focus.
  useEffect(() => {
    const onFocus = () => checkStatus();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [appId]);

  if (!brand || extensionEnabled !== false) return null;

  return (
    <a
      href={editorUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="theme-extension-banner"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: brand.bg,
        color: brand.accent,
        border: `1px solid ${brand.accent}33`,
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "13px",
        fontWeight: 500,
        marginBottom: "16px",
        textDecoration: "none",
      }}
    >
      <span>
        Enable {brand.name} in your theme editor to go live on your storefront, then click{" "}
        <strong>Save</strong> there - it won't show as Active here until you do.
      </span>
    </a>
  );
}
