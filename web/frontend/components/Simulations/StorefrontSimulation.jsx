import React from "react";

const StorefrontSimulation = ({ children, showAnnouncementBar, announcementText, announcementStyle, cartCount = 0 }) => {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      backgroundColor: "#fff",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Announcement Bar */}
      {showAnnouncementBar && (
        <div style={{
          backgroundColor: announcementStyle?.bgColor || "#000",
          color: announcementStyle?.textColor || "#fff",
          padding: "10px 20px",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "500",
          animation: "slideDown 0.5s ease-out"
        }}>
          {announcementText || "🎉 Free shipping on orders over $50!"}
        </div>
      )}

      {/* Browser-like header */}
      <div style={{
        backgroundColor: "#f1f3f4",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderBottom: "1px solid #e0e0e0"
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f57" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#28ca41" }} />
        </div>
        <div style={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: "6px",
          padding: "6px 12px",
          fontSize: "12px",
          color: "#666",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <span>🔒</span>
          <span>mystore.com/products</span>
        </div>
      </div>

      {/* Store Navigation */}
      <div style={{
        backgroundColor: "#fff",
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #eee"
      }}>
        <div style={{ fontWeight: "bold", fontSize: "18px" }}>🛍️ MyStore</div>
        <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: "#333" }}>
          <span>Shop</span>
          <span>Collections</span>
          <span>About</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", position: "relative" }}>
          <span>🔍</span>
          <span style={{ position: "relative" }}>
            🛒
            {cartCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                backgroundColor: "#e53935",
                color: "#fff",
                fontSize: "10px",
                fontWeight: "bold",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {cartCount}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {children}
      </div>
    </div>
  );
};

export default StorefrontSimulation;
