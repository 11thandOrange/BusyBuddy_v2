import React, { useState, useEffect } from "react";
import StorefrontSimulation from "./StorefrontSimulation";

const BuyXGetYSimulation = () => {
  const [step, setStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 80, y: 150 });
  const [showClick, setShowClick] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showBogoPopup, setShowBogoPopup] = useState(false);
  const [freeItemAdded, setFreeItemAdded] = useState(false);

  useEffect(() => {
    const timeline = [
      { delay: 1500, action: () => setStep(1) }, // Show BOGO badge
      { delay: 2500, action: () => setCursorPos({ x: 120, y: 280 }) }, // Move to Add to Cart
      { delay: 3500, action: () => { setShowClick(true); } },
      { delay: 3800, action: () => { 
        setShowClick(false); 
        setCartItems([{ name: "Sunglasses", price: 49.99, emoji: "🕶️" }]);
        setCartCount(1);
        setStep(2);
      }},
      { delay: 4500, action: () => setShowBogoPopup(true) }, // Show BOGO popup
      { delay: 6000, action: () => setCursorPos({ x: 280, y: 320 }) }, // Move to claim button
      { delay: 7000, action: () => { setShowClick(true); } },
      { delay: 7300, action: () => { 
        setShowClick(false); 
        setFreeItemAdded(true);
        setCartItems(prev => [...prev, { name: "Sunglasses (FREE!)", price: 0, emoji: "🕶️", isFree: true }]);
        setCartCount(2);
        setStep(3);
      }},
      { delay: 8500, action: () => setShowBogoPopup(false) },
      { delay: 10000, action: () => { 
        setStep(0); 
        setCursorPos({ x: 80, y: 150 });
        setCartCount(0);
        setCartItems([]);
        setShowBogoPopup(false);
        setFreeItemAdded(false);
      }},
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
    }, 11500);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "450px", position: "relative" }}>
      <StorefrontSimulation cartCount={cartCount}>
        <div style={{ padding: "15px" }}>
          {/* Product Card */}
          <div style={{ 
            display: "flex", 
            gap: "20px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "15px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            {/* Product Image */}
            <div style={{
              width: "150px",
              height: "150px",
              backgroundColor: "#f0f4f8",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "60px",
              position: "relative"
            }}>
              🕶️
              {/* BOGO Badge */}
              {step >= 1 && (
                <div style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  backgroundColor: "#e53935",
                  color: "#fff",
                  padding: "6px 10px",
                  borderRadius: "15px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  animation: "bounce 0.5s ease-out",
                  boxShadow: "0 2px 8px rgba(229,57,53,0.4)"
                }}>
                  BUY 1 GET 1 FREE!
                </div>
              )}
            </div>

            {/* Product Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>Classic Sunglasses</h2>
              <div style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px" }}>$49.99</div>
              
              {step >= 1 && (
                <div style={{
                  backgroundColor: "#ffebee",
                  border: "1px solid #ef9a9a",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  marginBottom: "12px",
                  fontSize: "12px",
                  animation: "fadeIn 0.3s ease-out"
                }}>
                  🎉 <strong>Special Offer:</strong> Buy one, get one FREE!
                </div>
              )}

              <button style={{
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "25px",
                padding: "12px 24px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                width: "100%"
              }}>
                Add to Cart
              </button>
            </div>
          </div>

          {/* BOGO Popup */}
          {showBogoPopup && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "25px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              zIndex: 50,
              animation: "popIn 0.4s ease-out",
              textAlign: "center",
              minWidth: "280px"
            }}>
              <div style={{ fontSize: "50px", marginBottom: "10px" }}>🎁</div>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Congratulations!</h3>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
                You've unlocked a <strong>FREE</strong> pair of sunglasses!
              </p>
              
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                backgroundColor: "#e8f5e9",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "15px"
              }}>
                <span style={{ fontSize: "30px" }}>🕶️</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold" }}>Classic Sunglasses</div>
                  <div style={{ fontSize: "12px" }}>
                    <span style={{ textDecoration: "line-through", color: "#999" }}>$49.99</span>
                    <span style={{ color: "#2e7d32", fontWeight: "bold", marginLeft: "8px" }}>FREE</span>
                  </div>
                </div>
              </div>

              <button style={{
                backgroundColor: freeItemAdded ? "#4caf50" : "#e53935",
                color: "#fff",
                border: "none",
                borderRadius: "25px",
                padding: "12px 30px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                width: "100%"
              }}>
                {freeItemAdded ? "✓ Added to Cart!" : "Claim Free Item"}
              </button>
            </div>
          )}

          {/* Overlay when popup is shown */}
          {showBogoPopup && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 40
            }} />
          )}
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
          fontSize: "12px",
          zIndex: 60
        }}>
          {step === 0 && "📍 Viewing product with BOGO offer..."}
          {step === 1 && "✨ BOGO badge shows the deal!"}
          {step === 2 && "🎁 Free item popup appears!"}
          {step === 3 && "🛒 Both items added - one FREE!"}
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
            border: "3px solid #e53935",
            animation: "ripple 0.4s ease-out"
          }} />
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes ripple {
          from { transform: scale(0.5); opacity: 1; }
          to { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BuyXGetYSimulation;
