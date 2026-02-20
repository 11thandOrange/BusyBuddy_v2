import React, { useState, useEffect } from "react";
import StorefrontSimulation from "./StorefrontSimulation";

const VolumeDiscountSimulation = () => {
  const [step, setStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 80, y: 150 });
  const [showClick, setShowClick] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  const basePrice = 24.99;
  const tiers = [
    { min: 1, max: 2, discount: 0, label: "1-2 items" },
    { min: 3, max: 4, discount: 10, label: "3-4 items" },
    { min: 5, max: 9, discount: 15, label: "5-9 items" },
    { min: 10, max: Infinity, discount: 25, label: "10+ items" },
  ];

  const getCurrentTier = (qty) => {
    return tiers.find(t => qty >= t.min && qty <= t.max);
  };

  const getPrice = (qty) => {
    const tier = getCurrentTier(qty);
    return basePrice * (1 - tier.discount / 100);
  };

  useEffect(() => {
    const timeline = [
      { delay: 1500, action: () => setStep(1) }, // Show volume widget
      { delay: 3000, action: () => setCursorPos({ x: 235, y: 195 }) }, // Move to + button
      { delay: 3800, action: () => { setShowClick(true); } },
      { delay: 4000, action: () => { setShowClick(false); setQuantity(2); } },
      { delay: 4500, action: () => { setShowClick(true); } },
      { delay: 4700, action: () => { setShowClick(false); setQuantity(3); setStep(2); } }, // Hit first tier
      { delay: 5500, action: () => { setShowClick(true); } },
      { delay: 5700, action: () => { setShowClick(false); setQuantity(4); } },
      { delay: 6200, action: () => { setShowClick(true); } },
      { delay: 6400, action: () => { setShowClick(false); setQuantity(5); setStep(3); } }, // Hit second tier
      { delay: 7500, action: () => setCursorPos({ x: 200, y: 350 }) }, // Move to Add to Cart
      { delay: 8500, action: () => { setShowClick(true); } },
      { delay: 8800, action: () => { 
        setShowClick(false); 
        setCartCount(5);
        setStep(4);
      }},
      { delay: 10500, action: () => { 
        setStep(0); 
        setCursorPos({ x: 80, y: 150 });
        setQuantity(1);
        setCartCount(0);
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
    }, 12000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, []);

  const currentTier = getCurrentTier(quantity);
  const currentPrice = getPrice(quantity);
  const totalSavings = (basePrice * quantity - currentPrice * quantity).toFixed(2);

  return (
    <div style={{ width: "100%", height: "450px", position: "relative" }}>
      <StorefrontSimulation cartCount={cartCount}>
        <div style={{ padding: "15px", display: "flex", gap: "20px" }}>
          {/* Product Image */}
          <div style={{
            width: "140px",
            height: "140px",
            backgroundColor: "#f5f5f5",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "60px"
          }}>
            🧴
          </div>

          {/* Product Details */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "16px", marginBottom: "5px" }}>Premium Body Lotion</h2>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
              ${basePrice}
              {currentTier.discount > 0 && (
                <span style={{ 
                  fontSize: "14px", 
                  color: "#2e7d32", 
                  marginLeft: "8px",
                  fontWeight: "normal"
                }}>
                  → ${currentPrice.toFixed(2)} each
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px",
              marginBottom: "15px"
            }}>
              <span style={{ fontSize: "13px" }}>Quantity:</span>
              <div style={{ 
                display: "flex", 
                alignItems: "center",
                border: "1px solid #ddd",
                borderRadius: "6px"
              }}>
                <button style={{
                  width: "32px",
                  height: "32px",
                  border: "none",
                  backgroundColor: "transparent",
                  fontSize: "16px",
                  cursor: "pointer"
                }}>-</button>
                <span style={{ 
                  width: "40px", 
                  textAlign: "center",
                  fontWeight: "bold"
                }}>{quantity}</span>
                <button style={{
                  width: "32px",
                  height: "32px",
                  border: "none",
                  backgroundColor: "transparent",
                  fontSize: "16px",
                  cursor: "pointer"
                }}>+</button>
              </div>
            </div>

            {/* Volume Discount Widget */}
            {step >= 1 && (
              <div style={{
                backgroundColor: "#f5f5f5",
                borderRadius: "10px",
                padding: "12px",
                animation: "fadeIn 0.3s ease-out"
              }}>
                <div style={{ 
                  fontSize: "13px", 
                  fontWeight: "bold", 
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  📊 Buy More, Save More!
                </div>

                {/* Tier Progress */}
                <div style={{ marginBottom: "10px" }}>
                  {tiers.map((tier, idx) => (
                    <div key={idx} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 8px",
                      marginBottom: "4px",
                      borderRadius: "6px",
                      backgroundColor: quantity >= tier.min ? 
                        (tier.discount > 0 ? "#e8f5e9" : "#fff") : "#fff",
                      border: currentTier === tier ? "2px solid #4caf50" : "1px solid #eee",
                      transition: "all 0.3s ease"
                    }}>
                      <div style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: quantity >= tier.min ? "#4caf50" : "#ddd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "10px"
                      }}>
                        {quantity >= tier.min ? "✓" : ""}
                      </div>
                      <span style={{ flex: 1, fontSize: "12px" }}>{tier.label}</span>
                      <span style={{ 
                        fontSize: "12px", 
                        fontWeight: "bold",
                        color: tier.discount > 0 ? "#2e7d32" : "#666"
                      }}>
                        {tier.discount > 0 ? `${tier.discount}% OFF` : "Regular price"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Savings Display */}
                {currentTier.discount > 0 && (
                  <div style={{
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    textAlign: "center",
                    fontWeight: "bold",
                    animation: "pulse 1s infinite"
                  }}>
                    🎉 You're saving ${totalSavings}!
                  </div>
                )}
              </div>
            )}

            {/* Add to Cart Button */}
            <button style={{
              width: "100%",
              marginTop: "12px",
              padding: "12px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "25px",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer"
            }}>
              Add to Cart - ${(currentPrice * quantity).toFixed(2)}
            </button>
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
          {step === 0 && "📍 Viewing product page..."}
          {step === 1 && "✨ Volume discount tiers displayed!"}
          {step === 2 && "🎯 First discount tier unlocked - 10% OFF!"}
          {step === 3 && "💰 Better tier reached - 15% OFF!"}
          {step === 4 && "🛒 Added to cart with volume discount!"}
        </div>
      </StorefrontSimulation>

      {/* Animated Cursor */}
      <div style={{
        position: "absolute",
        left: cursorPos.x,
        top: cursorPos.y,
        transition: "all 0.4s ease-out",
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
            border: "3px solid #4caf50",
            animation: "ripple 0.4s ease-out"
          }} />
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes ripple {
          from { transform: scale(0.5); opacity: 1; }
          to { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default VolumeDiscountSimulation;
