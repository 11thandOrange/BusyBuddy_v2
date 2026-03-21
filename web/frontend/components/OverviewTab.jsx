import React, { useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Play } from "react-bootstrap-icons";

/**
 * Reusable Overview Tab component with two-column layout
 * Left column: Video player
 * Right column: Simple list of 3 clickable items that change the video
 * 
 * @param {Array} items - Array of {id, title, description, videoSrc, posterSrc}
 */
export default function OverviewTab({ items = [] }) {
  // Only show first 3 items
  const displayItems = items.slice(0, 3);
  const [selectedItem, setSelectedItem] = useState(displayItems[0] || null);

  const currentItem = selectedItem || displayItems[0];

  return (
    <Row className="g-4 p-3">
      {/* Left Column - Video */}
      <Col lg={7} md={12}>
        <Card 
          className="border-0" 
          style={{ 
            backgroundColor: "#f8f9fa", 
            borderRadius: "16px",
            overflow: "hidden"
          }}
        >
          <Card.Body className="p-0 d-flex align-items-center justify-content-center">
            <div 
              className="video-container position-relative w-100 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "#000", borderRadius: "16px" }}
            >
              {currentItem?.videoSrc ? (
                <video
                  key={currentItem.id}
                  controls
                  poster={currentItem.posterSrc}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "16px",
                  }}
                >
                  <source src={currentItem.videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div 
                  className="d-flex flex-column align-items-center justify-content-center text-white"
                  style={{ padding: "40px" }}
                >
                  <Play size={48} className="mb-3 opacity-50" />
                  <p className="mb-0 opacity-75">Select a topic to watch</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Right Column - Simple List (3 rows, no container/header/background) */}
      <Col lg={5} md={12}>
        <div className="d-flex flex-column gap-3">
          {displayItems.map((item, index) => {
            const isSelected = selectedItem?.id === item.id;
            return (
            <div
              key={item.id || index}
              onClick={() => setSelectedItem(item)}
              className="d-flex align-items-center justify-content-between p-3"
              style={{
                backgroundColor: isSelected ? "rgba(81, 105, 221, 0.08)" : "rgba(0,0,0,0.02)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: isSelected ? "2px solid #5169DD" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = "rgba(81, 105, 221, 0.08)";
                  e.currentTarget.style.border = "2px solid #5169DD";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.02)";
                  e.currentTarget.style.border = "2px solid transparent";
                }
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: isSelected ? "#5169DD" : "#e5e5ea",
                    color: isSelected ? "#fff" : "#8e8e93",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div 
                    style={{ 
                      fontWeight: 600, 
                      fontSize: "14px", 
                      color: isSelected ? "#5169DD" : "#1c1c1e",
                      marginBottom: "2px"
                    }}
                  >
                    {item.title}
                  </div>
                  <div 
                    style={{ 
                      fontSize: "12px", 
                      color: "#8e8e93" 
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </Col>
    </Row>
  );
}
