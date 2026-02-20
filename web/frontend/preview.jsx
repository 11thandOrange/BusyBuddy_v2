import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

import {
  AnnouncementBarSimulation,
  InactiveTabSimulation,
  BundleDiscountSimulation,
  BuyXGetYSimulation,
  VolumeDiscountSimulation,
  MixMatchSimulation,
} from "./components/Simulations";

function PreviewApp() {
  const [activeTab, setActiveTab] = useState("Announcement Bar");
  
  const tabs = [
    { id: "Announcement Bar", icon: "📢", component: AnnouncementBarSimulation },
    { id: "Inactive Tab Message", icon: "💤", component: InactiveTabSimulation },
    { id: "Bundle Discount", icon: "🎁", component: BundleDiscountSimulation },
    { id: "Buy 'X' Get 'Y'", icon: "🛍️", component: BuyXGetYSimulation },
    { id: "Volume Discounts", icon: "📊", component: VolumeDiscountSimulation },
    { id: "Mix & Match", icon: "🎨", component: MixMatchSimulation },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);
  const SimulationComponent = currentTab?.component;

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#1a1a2e", 
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif"
    }}>
      <h1 style={{ 
        marginBottom: "10px", 
        textAlign: "center",
        color: "#fff",
        fontSize: "28px",
        fontWeight: "700"
      }}>
        🎬 App Widget Simulations
      </h1>
      <p style={{ 
        textAlign: "center", 
        color: "#888", 
        marginBottom: "25px",
        fontSize: "14px"
      }}>
        Interactive demos showing how each widget works on your storefront
      </p>
      
      {/* Tab Selector */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: "8px", 
        marginBottom: "25px",
        flexWrap: "wrap",
        maxWidth: "800px",
        margin: "0 auto 25px"
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "25px",
              backgroundColor: activeTab === tab.id ? "#6c63ff" : "rgba(255,255,255,0.1)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? "600" : "400",
              fontSize: "13px",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.id}</span>
          </button>
        ))}
      </div>

      {/* Simulation Container */}
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#16213e",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Current Tab Info */}
        <div style={{ 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          padding: "12px 16px",
          backgroundColor: "rgba(108, 99, 255, 0.2)",
          borderRadius: "10px"
        }}>
          <div>
            <span style={{ color: "#6c63ff", fontWeight: "600", fontSize: "14px" }}>
              {currentTab?.icon} {activeTab}
            </span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#4caf50",
              animation: "pulse 1.5s infinite"
            }} />
            <span style={{ color: "#4caf50", fontSize: "12px", fontWeight: "500" }}>
              LIVE SIMULATION
            </span>
          </div>
        </div>

        {/* Simulation Component */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          overflow: "hidden"
        }}>
          {SimulationComponent && <SimulationComponent />}
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: "15px",
          padding: "12px 16px",
          backgroundColor: "rgba(255,255,255,0.05)",
          borderRadius: "10px",
          fontSize: "12px",
          color: "#888",
          textAlign: "center"
        }}>
          ⏱️ Watch the automated simulation loop through the user journey
        </div>
      </div>

      {/* Feature Legend */}
      <div style={{
        maxWidth: "600px",
        margin: "25px auto 0",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px"
      }}>
        {[
          { icon: "👆", label: "User clicks" },
          { icon: "✨", label: "Widget appears" },
          { icon: "🛒", label: "Add to cart" },
        ].map((item, idx) => (
          <div key={idx} style={{
            padding: "10px",
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "12px",
            color: "#888"
          }}>
            <span style={{ fontSize: "18px" }}>{item.icon}</span>
            <div>{item.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const root = createRoot(document.getElementById("app"));
root.render(<PreviewApp />);
