import React, { useState, useEffect } from "react";
import StorefrontSimulation from "./StorefrontSimulation";

const AnnouncementBarSimulation = () => {
  const [step, setStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [showClick, setShowClick] = useState(false);

  const announcements = [
    { text: "🎉 Summer Sale - 20% OFF Everything!", bgColor: "#e53935", textColor: "#fff" },
    { text: "⚡ Flash Deal: Free Shipping Today Only!", bgColor: "#1e88e5", textColor: "#fff" },
    { text: "🌟 New Arrivals Just Dropped - Shop Now!", bgColor: "#7b1fa2", textColor: "#fff" },
  ];

  useEffect(() => {
    const timeline = [
      { delay: 1000, action: () => setStep(1) }, // Show announcement
      { delay: 2500, action: () => setCursorPos({ x: 200, y: 25 }) }, // Move cursor to announcement
      { delay: 3500, action: () => setShowClick(true) }, // Click effect
      { delay: 3800, action: () => setShowClick(false) },
      { delay: 4500, action: () => setStep(2) }, // Change to second announcement
      { delay: 6000, action: () => setStep(3) }, // Change to third announcement
      { delay: 8000, action: () => { setStep(0); setCursorPos({ x: 50, y: 50 }); } }, // Reset
    ];

    let timeouts = [];
    let cumulative = 0;
    timeline.forEach(({ delay, action }) => {
      cumulative += delay;
      timeouts.push(setTimeout(action, cumulative));
    });

    const loop = setInterval(() => {
      cumulative = 0;
      timeline.forEach(({ delay, action }) => {
        cumulative += delay;
        timeouts.push(setTimeout(action, cumulative));
      });
    }, 9000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, []);

  const currentAnnouncement = step > 0 ? announcements[Math.min(step - 1, 2)] : null;

  return (
    <div style={{ width: "100%", height: "400px", position: "relative" }}>
      <StorefrontSimulation
        showAnnouncementBar={step > 0}
        announcementText={currentAnnouncement?.text}
        announcementStyle={currentAnnouncement}
      >
        {/* Product Grid */}
        <div style={{ padding: "20px" }}>
          <h2 style={{ marginBottom: "20px", fontSize: "20px" }}>Featured Products</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center"
              }}>
                <div style={{
                  width: "100%",
                  height: "80px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "6px",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px"
                }}>
                  {["👕", "👟", "🎒"][i - 1]}
                </div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>Product {i}</div>
                <div style={{ fontSize: "14px", color: "#e53935" }}>$29.99</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "12px"
        }}>
          {step === 0 && "📍 Viewing storefront..."}
          {step === 1 && "✨ Announcement bar appears!"}
          {step === 2 && "🔄 Content rotates automatically"}
          {step === 3 && "🎨 Customizable colors & messages"}
        </div>
      </StorefrontSimulation>

      {/* Animated Cursor */}
      <div style={{
        position: "absolute",
        left: cursorPos.x,
        top: cursorPos.y,
        transition: "all 0.5s ease-out",
        pointerEvents: "none",
        zIndex: 100
      }}>
        <div style={{ fontSize: "24px" }}>👆</div>
        {showClick && (
          <div style={{
            position: "absolute",
            top: "-10px",
            left: "-10px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "3px solid #1e88e5",
            animation: "ripple 0.4s ease-out"
          }} />
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes ripple {
          from { transform: scale(0.5); opacity: 1; }
          to { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBarSimulation;
