import React from "react";
import PlanCard from "../components/Plans/PlanCard";
import "../components/Plans/style.css";
const planData = [
  {
    id: 1,
    title: "Free",
    price: 0,
    description:
      "Access basic features with limited functionality. Ideal for personal use and exploring the core capabilities of our service.",
    buttonText: "Get Started",
    color: "#0c95d0",
    featureValue: "1",
    url: "/app",
    features: {
      appsEnabled: 1,
      otherFeatures: [
        "Announcement Bars",
        "Inactive Tab Message",
        "Basic engagement insights",
        "New stores testing apps",
       
      ],
    },
  },
  {
    id: 2,
    title: "Starter",
    price: 30,
    description:
      "Ideal for small projects or individual use. Includes access to essential features, priority support, and 5GB of storage for your projects.",
    buttonText: "Get Started",
    url: "/app/upgrade?plan=Starter",
    color: "#4CAF50",
    features: {
      appsEnabled: "3",
      otherFeatures: [
        "Announcement Bars",
        "Inactive Tab Message",
        "Standard Bundles",
        "Mix & Match Bundles",
        "BOGO Bundles",
        "Volume Discount Bundles",
        "Growing shops adding promotions",
        "Bundle performance + engagement"
      ],
    },
  },
  {
    id: 3,
    title: "Advanced",
    price: 60,
    description:
      "Ideal for established or high-volume stores that want to maximize revenue with the complete toolkit of bundles, promotions, and engagement apps.",
    buttonText: "Get Started",
    url: "/app/upgrade?plan=Advanced",
    color: "#4CAF50",
    features: {
      appsEnabled: "5",
      otherFeatures: [
        "Announcement Bars",
        "Inactive Tab Message",
        "Standard Bundles",
        "Mix & Match Bundles",
        "BOGO Bundles",
        "Volume Discount Bundles",
        "Full reporting across all apps",
        "High-volume sellers maximizing revenue"
      ],
    },
  },
];
export default function PlanPage() {
  return (
    <>
      <div className="plan-container">
        <h1 className="plan-heading">Choose Your Plan</h1>
        <div className="plan-section">
          {planData.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </>
  );
}
