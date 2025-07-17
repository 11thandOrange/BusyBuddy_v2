import { useEffect, useState } from "react";
import { Layout } from "@shopify/polaris";
import Header from "../components/Header";
import MarshallPage from "../pages/MarshallPage";
import "../pages/index.css";
import busyBuddy from "../assets/busyBuddy.png";

const tabsList = [
  "Announcement Bar",
  "Inactive Tab Message",
  "Bundle Discount",
  "Buy One Get One",
  "Volume Discounts",
  "Mix & Match",
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Bundle Discount");
  const [showContent, setShowContent] = useState(true); // Controls visibility of index content
  
  const handleMakeBundleNowClick = (val = false) => {
    setShowContent(val);
  };

  async function getProducts() {
    const response = await fetch("/api/products", {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  }
  useEffect(() => {
    getProducts().then((data) => {
      console.log("products", data);
    });
  }, []);
  return (
    <div className="layoutbox">
      {showContent && (
        <>
          <div className="d-flex gap-3 linrrow" style={{padding:"30px 0", width:"100%"}}>
            <img src={busyBuddy} width={50} height={50} />
            <div className="d-flex flex-column gap-2">
              <h2
                style={{
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fontWeight: "600",
                  fontSize: "20px",
                  lineHeight: "100%",
                  color: " #303030",
                }}
              >
                BusyBuddy
              </h2>
              <p
                style={{
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fontWeight: "500",
                  fontSize: "12px",
                  lineHeight: "100%",
                  color: " #616161",
                }}
              >
                Every busy body needs busybuddy
              </p>
            </div>
          </div>
          
          <div className="mt-2" style={{padding:"20px 0 0 0"}}>
            <h5
              style={{ fontWeight: 600, fontSize: "20px", lineHeight: "100%" }}
            >
              Essential Apps
            </h5>
            <p
              className="text-muted"
              style={{
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "100%",
                letterSpacing: "0%",
                marginTop: "15px",
              }}
            >
              Get Noticed! Want to make sure your message doesn't get missed?
              Announcement Bar lets you display important alerts right at the
              top of your store. Whether it's a sale, promotion, or update, it's
              impossible to ignore!
            </p>
          </div>
        </>
      )}

      {showContent && (
        <Header
          tabs={tabsList}
          defaultActiveTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      <MarshallPage
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMakeBundleNowClick={handleMakeBundleNowClick} // Pass the function to MarshallPage
      />
    </div>
  );
}
