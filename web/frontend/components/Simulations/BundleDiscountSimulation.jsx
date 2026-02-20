import React, { useState, useEffect } from "react";
import StorefrontSimulation from "./StorefrontSimulation";

const BundleDiscountSimulation = () => {
  const [step, setStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 100 });
  const [showClick, setShowClick] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const bundleItems = [
    { id: 1, name: "Classic T-Shirt", price: 29.99, emoji: "👕" },
    { id: 2, name: "Denim Jeans", price: 59.99, emoji: "👖" },
    { id: 3, name: "Sneakers", price: 89.99, emoji: "👟" },
  ];

  const bundlePrice = 149.99;
  const originalTotal = bundleItems.reduce((sum, item) => sum + item.price, 0);
  const savings = (originalTotal - bundlePrice).toFixed(2);

  useEffect(() => {
    const timeline = [
      { delay: 1000, action: () => setStep(1) }, // Show bundle widget
      { delay: 2500, action: () => { setCursorPos({ x: 180, y: 220 }); } }, // Move to first item
      { delay: 3500, action: () => { setShowClick(true); setSelectedItems([1]); } },
      { delay: 3800, action: () => setShowClick(false) },
      { delay: 4500, action: () => { setCursorPos({ x: 180, y: 270 }); } }, // Move to second item
      { delay: 5500, action: () => { setShowClick(true); setSelectedItems([1, 2]); } },
      { delay: 5800, action: () => setShowClick(false) },
      { delay: 6500, action: () => { setCursorPos({ x: 180, y: 320 }); } }, // Move to third item
      { delay: 7500, action: () => { setShowClick(true); setSelectedItems([1, 2, 3]); setStep(2); } },
      { delay: 7800, action: () => setShowClick(false) },
      { delay: 8500, action: () => { setCursorPos({ x: 200, y: 380 }); } }, // Move to add to cart
      { delay: 9500, action: () => { setShowClick(true); } },
      { delay: 9800, action: () => { setShowClick(false); setCartCount(3); setShowCartNotification(true); setStep(3); } },
      { delay: 11000, action: () => setShowCartNotification(false) },
      { delay: 12500, action: () => { 
        setStep(0); 
        setCursorPos({ x: 50, y: 100 }); 
        setCartCount(0);
        setSelectedItems([]);
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
    }, 14000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "450px", position: "relative" }}>
      <StorefrontSimulation cartCount={cartCount}>
        <div style={{ padding: "15px", display: "flex", gap: "20px" }}>
          {/* Product Image */}
          <div style={{
            width: "45%",
            backgroundColor: "#f5f5f5",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "80px",
            minHeight: "200px"
          }}>
            👕
          </div>

          {/* Product Details & Bundle Widget */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "18px", marginBottom: "5px" }}>Classic T-Shirt</h2>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#333", marginBottom: "15px" }}>
              $29.99
            </div>

            {/* Bundle Widget */}
            {step >= 1 && (
              <div style={{
                backgroundColor: "#fff8e1",
                border: "2px solid #ffc107",
                borderRadius: "10px",
                padding: "15px",
                animation: "fadeIn 0.5s ease-out"
              }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "12px"
                }}>
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>🎁 Complete the Look!</span>
                  <span style={{ 
                    backgroundColor: "#e53935", 
                    color: "#fff", 
                    padding: "3px 8px", 
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}>
                    Save ${savings}
                  </span>
                </div>

                {/* Bundle Items */}
                {bundleItems.map((item) => (
                  <div key={item.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px",
                    backgroundColor: selectedItems.includes(item.id) ? "#e8f5e9" : "#fff",
                    borderRadius: "6px",
                    marginBottom: "6px",
                    border: selectedItems.includes(item.id) ? "2px solid #4caf50" : "1px solid #eee",
                    transition: "all 0.3s ease"
                  }}>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)}
                      readOnly
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span style={{ fontSize: "20px" }}>{item.emoji}</span>
                    <span style={{ flex: 1, fontSize: "12px" }}>{item.name}</span>
                    <span style={{ fontSize: "12px", fontWeight: "500" }}>${item.price}</span>
                  </div>
                ))}

                {/* Bundle Price */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px dashed #ccc"
                }}>
                  <div>
                    <span style={{ textDecoration: "line-through", color: "#999", fontSize: "12px" }}>
                      ${originalTotal.toFixed(2)}
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: "bold", color: "#2e7d32", marginLeft: "8px" }}>
                      ${bundlePrice}
                    </span>
                  </div>
                </div>

                {/* Add Bundle Button */}
                <button style={{
                  width: "100%",
                  marginTop: "12px",
                  padding: "10px",
                  backgroundColor: selectedItems.length === 3 ? "#2e7d32" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}>
                  {selectedItems.length === 3 ? "🛒 Add Bundle to Cart" : "Select all items"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cart Notification */}
        {showCartNotification && (
          <div style={{
            position: "absolute",
            top: "60px",
            right: "20px",
            backgroundColor: "#4caf50",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            animation: "slideIn 0.3s ease-out",
            fontSize: "13px"
          }}>
            ✅ Bundle added to cart!
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
          {step === 0 && "📍 Viewing product page..."}
          {step === 1 && "✨ Bundle widget appears with savings!"}
          {step === 2 && "☑️ Selecting bundle items..."}
          {step === 3 && "🛒 Bundle added to cart with discount!"}
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
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes ripple {
          from { transform: scale(0.5); opacity: 1; }
          to { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BundleDiscountSimulation;
