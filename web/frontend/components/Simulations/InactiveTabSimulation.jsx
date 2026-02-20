import React, { useState, useEffect } from "react";

const InactiveTabSimulation = () => {
  const [step, setStep] = useState(0);
  const [tabTitle, setTabTitle] = useState("MyStore - Shop Now");
  const [isTabActive, setIsTabActive] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 150, y: 200 });

  useEffect(() => {
    const timeline = [
      { delay: 1500, action: () => { setStep(1); setCursorPos({ x: 300, y: 30 }); } }, // Move to other tab
      { delay: 2500, action: () => { setStep(2); setIsTabActive(false); } }, // Click other tab
      { delay: 3500, action: () => { setStep(3); setTabTitle("💔 Come back! We miss you!"); } }, // Tab message changes
      { delay: 5000, action: () => { setTabTitle("🛒 Your cart is waiting..."); } }, // Another message
      { delay: 6500, action: () => { setTabTitle("⚡ 10% OFF if you return now!"); } }, // Discount message
      { delay: 8000, action: () => { setCursorPos({ x: 100, y: 30 }); } }, // Move back
      { delay: 9000, action: () => { setStep(4); setIsTabActive(true); setTabTitle("MyStore - Shop Now"); } }, // Back to store
      { delay: 10500, action: () => { setStep(0); setCursorPos({ x: 150, y: 200 }); } }, // Reset
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
    }, 12000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "400px", position: "relative" }}>
      <div style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#e8e8e8",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        {/* Browser Chrome */}
        <div style={{
          backgroundColor: "#dee1e6",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f57" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#28ca41" }} />
          </div>
        </div>

        {/* Browser Tabs */}
        <div style={{
          backgroundColor: "#c9cdd3",
          padding: "0 10px",
          display: "flex",
          alignItems: "flex-end",
          gap: "2px",
          height: "36px"
        }}>
          {/* Store Tab */}
          <div style={{
            backgroundColor: isTabActive ? "#fff" : "#ddd",
            padding: "8px 16px",
            borderRadius: "8px 8px 0 0",
            fontSize: "12px",
            maxWidth: "180px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.3s ease",
            animation: !isTabActive && step >= 3 ? "tabPulse 1s infinite" : "none"
          }}>
            <span>🛍️</span>
            <span style={{ 
              fontWeight: isTabActive ? "normal" : "bold",
              color: !isTabActive && step >= 3 ? "#e53935" : "#333"
            }}>
              {tabTitle}
            </span>
          </div>

          {/* Other Tab */}
          <div style={{
            backgroundColor: !isTabActive ? "#fff" : "#ddd",
            padding: "8px 16px",
            borderRadius: "8px 8px 0 0",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>📧</span>
            <span>Email - Inbox</span>
          </div>

          {/* New Tab Button */}
          <div style={{
            padding: "8px 12px",
            fontSize: "14px",
            color: "#666"
          }}>
            +
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          backgroundColor: "#fff",
          height: "calc(100% - 80px)",
          position: "relative"
        }}>
          {isTabActive ? (
            /* Store Content */
            <div style={{ padding: "20px" }}>
              <h2 style={{ marginBottom: "15px", fontSize: "18px" }}>🛍️ Welcome to MyStore</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px" }}>
                {[1, 2].map((i) => (
                  <div key={i} style={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    padding: "15px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                      {["👕", "👟"][i - 1]}
                    </div>
                    <div style={{ fontSize: "14px" }}>Product {i}</div>
                    <div style={{ fontSize: "14px", color: "#e53935" }}>$49.99</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Email Content */
            <div style={{ padding: "20px" }}>
              <h2 style={{ marginBottom: "15px", fontSize: "18px" }}>📧 Inbox</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Meeting at 3pm", "Project update", "Weekly report"].map((email, i) => (
                  <div key={i} style={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "6px",
                    padding: "12px",
                    fontSize: "13px"
                  }}>
                    <strong>Subject:</strong> {email}
                  </div>
                ))}
              </div>
            </div>
          )}

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
            {step === 0 && "📍 User browsing store..."}
            {step === 1 && "👆 User switches to another tab..."}
            {step === 2 && "📧 User reading emails..."}
            {step === 3 && "✨ Tab title changes to grab attention!"}
            {step === 4 && "🎉 User returns to complete purchase!"}
          </div>
        </div>
      </div>

      {/* Animated Cursor */}
      <div style={{
        position: "absolute",
        left: cursorPos.x,
        top: cursorPos.y,
        transition: "all 0.6s ease-out",
        pointerEvents: "none",
        zIndex: 100
      }}>
        <div style={{ fontSize: "24px" }}>👆</div>
      </div>

      <style>{`
        @keyframes tabPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; background-color: #ffeb3b; }
        }
      `}</style>
    </div>
  );
};

export default InactiveTabSimulation;
