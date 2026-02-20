import React, { useState, useEffect } from "react";
import StorefrontSimulation from "./StorefrontSimulation";

const MixMatchSimulation = () => {
  const [step, setStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 100, y: 150 });
  const [showClick, setShowClick] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const products = [
    { id: 1, name: "Red Candle", emoji: "🕯️", price: 12.99, color: "#ffcdd2" },
    { id: 2, name: "Blue Candle", emoji: "🕯️", price: 12.99, color: "#bbdefb" },
    { id: 3, name: "Green Candle", emoji: "🕯️", price: 12.99, color: "#c8e6c9" },
    { id: 4, name: "Purple Candle", emoji: "🕯️", price: 12.99, color: "#e1bee7" },
  ];

  const bundleRequirement = 3;
  const bundleDiscount = 20;
  const regularTotal = selectedItems.length * 12.99;
  const discountedTotal = selectedItems.length >= bundleRequirement 
    ? regularTotal * (1 - bundleDiscount / 100)
    : regularTotal;

  useEffect(() => {
    const timeline = [
      { delay: 1500, action: () => setStep(1) }, // Show mix & match widget
      { delay: 2500, action: () => setCursorPos({ x: 70, y: 240 }) }, // Move to first product
      { delay: 3300, action: () => { setShowClick(true); } },
      { delay: 3500, action: () => { setShowClick(false); setSelectedItems([1]); } },
      { delay: 4200, action: () => setCursorPos({ x: 170, y: 240 }) }, // Move to second product
      { delay: 5000, action: () => { setShowClick(true); } },
      { delay: 5200, action: () => { setShowClick(false); setSelectedItems([1, 2]); } },
      { delay: 5900, action: () => setCursorPos({ x: 270, y: 240 }) }, // Move to third product
      { delay: 6700, action: () => { setShowClick(true); } },
      { delay: 6900, action: () => { 
        setShowClick(false); 
        setSelectedItems([1, 2, 3]);
        setStep(2); // Bundle complete!
      }},
      { delay: 8000, action: () => setCursorPos({ x: 200, y: 380 }) }, // Move to Add to Cart
      { delay: 9000, action: () => { setShowClick(true); } },
      { delay: 9300, action: () => { 
        setShowClick(false);
        setCartCount(3);
        setStep(3);
      }},
      { delay: 11000, action: () => { 
        setStep(0); 
        setCursorPos({ x: 100, y: 150 });
        setSelectedItems([]);
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
    }, 12500);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "450px", position: "relative" }}>
      <StorefrontSimulation cartCount={cartCount}>
        <div style={{ padding: "15px" }}>
          {/* Mix & Match Header */}
          {step >= 1 && (
            <div style={{
              backgroundColor: "#fff3e0",
              border: "2px solid #ff9800",
              borderRadius: "12px",
              padding: "12px 15px",
              marginBottom: "15px",
              animation: "fadeIn 0.3s ease-out"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center" 
              }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>
                    🎨 Mix & Match - Build Your Bundle!
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Select any {bundleRequirement} candles and get {bundleDiscount}% OFF
                  </div>
                </div>
                <div style={{
                  backgroundColor: selectedItems.length >= bundleRequirement ? "#4caf50" : "#ff9800",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold"
                }}>
                  {selectedItems.length}/{bundleRequirement} selected
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                marginTop: "10px",
                height: "6px",
                backgroundColor: "#ffe0b2",
                borderRadius: "3px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${(selectedItems.length / bundleRequirement) * 100}%`,
                  height: "100%",
                  backgroundColor: selectedItems.length >= bundleRequirement ? "#4caf50" : "#ff9800",
                  transition: "all 0.3s ease"
                }} />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: "10px",
            marginBottom: "15px"
          }}>
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  backgroundColor: product.color,
                  borderRadius: "10px",
                  padding: "12px",
                  textAlign: "center",
                  cursor: "pointer",
                  border: selectedItems.includes(product.id) 
                    ? "3px solid #4caf50" 
                    : "3px solid transparent",
                  transition: "all 0.3s ease",
                  position: "relative",
                  transform: selectedItems.includes(product.id) ? "scale(1.05)" : "scale(1)"
                }}
              >
                {selectedItems.includes(product.id) && (
                  <div style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    width: "24px",
                    height: "24px",
                    backgroundColor: "#4caf50",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "14px",
                    animation: "pop 0.3s ease-out"
                  }}>
                    ✓
                  </div>
                )}
                <div style={{ fontSize: "35px", marginBottom: "6px" }}>
                  {product.emoji}
                </div>
                <div style={{ fontSize: "11px", fontWeight: "500", marginBottom: "3px" }}>
                  {product.name}
                </div>
                <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                  ${product.price}
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          {selectedItems.length > 0 && (
            <div style={{
              backgroundColor: "#f5f5f5",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "12px"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                fontSize: "13px",
                marginBottom: "6px"
              }}>
                <span>Subtotal ({selectedItems.length} items):</span>
                <span style={{ 
                  textDecoration: selectedItems.length >= bundleRequirement ? "line-through" : "none",
                  color: selectedItems.length >= bundleRequirement ? "#999" : "#000"
                }}>
                  ${regularTotal.toFixed(2)}
                </span>
              </div>
              
              {selectedItems.length >= bundleRequirement && (
                <>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    fontSize: "13px",
                    color: "#4caf50",
                    marginBottom: "6px"
                  }}>
                    <span>Bundle Discount ({bundleDiscount}%):</span>
                    <span>-${(regularTotal - discountedTotal).toFixed(2)}</span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    fontSize: "15px",
                    fontWeight: "bold",
                    paddingTop: "6px",
                    borderTop: "1px solid #ddd"
                  }}>
                    <span>Total:</span>
                    <span style={{ color: "#4caf50" }}>${discountedTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Add Bundle Button */}
          <button style={{
            width: "100%",
            padding: "14px",
            backgroundColor: selectedItems.length >= bundleRequirement ? "#4caf50" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "25px",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: selectedItems.length >= bundleRequirement ? "pointer" : "not-allowed"
          }}>
            {selectedItems.length >= bundleRequirement 
              ? `🛒 Add Bundle to Cart - $${discountedTotal.toFixed(2)}`
              : `Select ${bundleRequirement - selectedItems.length} more to unlock discount`
            }
          </button>
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
          {step === 0 && "📍 Viewing mix & match collection..."}
          {step === 1 && "🎨 Select items to build your bundle!"}
          {step === 2 && "🎉 Bundle complete - 20% discount unlocked!"}
          {step === 3 && "🛒 Custom bundle added to cart!"}
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
            border: "3px solid #ff9800",
            animation: "ripple 0.4s ease-out"
          }} />
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes ripple {
          from { transform: scale(0.5); opacity: 1; }
          to { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MixMatchSimulation;
