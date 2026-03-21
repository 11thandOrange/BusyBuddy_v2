import React, { useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Play, ChevronRight } from "react-bootstrap-icons";

/**
 * Reusable Overview Tab component with two-column layout
 * Left column: Video player
 * Right column: Scrollable list of clickable items that change the video
 * 
 * @param {Array} items - Array of {id, title, description, videoSrc, posterSrc}
 * @param {string} defaultTitle - Title for the overview section
 */
export default function OverviewTab({ items = [], defaultTitle = "Get Started" }) {
  const [selectedItem, setSelectedItem] = useState(items[0] || null);

  // Default items if none provided
  const defaultItems = [
    {
      id: "intro",
      title: "Introduction",
      description: "Learn how to get started",
      videoSrc: "/videos/intro.mp4",
      posterSrc: null,
    },
    {
      id: "setup",
      title: "Quick Setup",
      description: "Set up in minutes",
      videoSrc: "/videos/setup.mp4",
      posterSrc: null,
    },
    {
      id: "customize",
      title: "Customization",
      description: "Make it your own",
      videoSrc: "/videos/customize.mp4",
      posterSrc: null,
    },
  ];

  const displayItems = items.length > 0 ? items : defaultItems;
  const currentItem = selectedItem || displayItems[0];

  return (
    <Row 
      className="g-4" 
      style={{ 
        height: "calc(100vh - 250px)", 
        minHeight: "400px",
        maxHeight: "600px",
        overflow: "hidden" 
      }}
    >
      {/* Left Column - Video */}
      <Col lg={7} md={12} className="h-100">
        <Card 
          className="border-0 h-100" 
          style={{ 
            backgroundColor: "#f8f9fa", 
            borderRadius: "16px",
            overflow: "hidden"
          }}
        >
          <Card.Body className="p-0 d-flex align-items-center justify-content-center h-100">
            <div 
              className="video-container position-relative w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "#000", borderRadius: "16px" }}
            >
              {currentItem?.videoSrc ? (
                <video
                  key={currentItem.id}
                  controls
                  poster={currentItem.posterSrc}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
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

      {/* Right Column - Scrollable List */}
      <Col lg={5} md={12} className="h-100">
        <Card 
          className="border-0 h-100" 
          style={{ 
            backgroundColor: "#fff", 
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}
        >
          <Card.Body className="p-0 d-flex flex-column h-100">
            <div 
              className="p-4 border-bottom"
              style={{ flexShrink: 0 }}
            >
              <h5 
                className="mb-1" 
                style={{ 
                  fontWeight: 600, 
                  fontSize: "18px", 
                  color: "#1c1c1e" 
                }}
              >
                {defaultTitle}
              </h5>
              <p 
                className="mb-0" 
                style={{ 
                  fontSize: "13px", 
                  color: "#8e8e93" 
                }}
              >
                Click a topic to watch the video
              </p>
            </div>
            
            <div 
              className="flex-grow-1"
              style={{ 
                overflowY: "auto",
                padding: "8px"
              }}
            >
              {displayItems.map((item, index) => (
                <div
                  key={item.id || index}
                  onClick={() => setSelectedItem(item)}
                  className="d-flex align-items-center justify-content-between p-3 mb-2"
                  style={{
                    backgroundColor: selectedItem?.id === item.id ? "rgba(81, 105, 221, 0.08)" : "#f8f9fa",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: selectedItem?.id === item.id ? "2px solid #5169DD" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedItem?.id !== item.id) {
                      e.currentTarget.style.backgroundColor = "#f0f0f5";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedItem?.id !== item.id) {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
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
                        backgroundColor: selectedItem?.id === item.id ? "#5169DD" : "#e5e5ea",
                        color: selectedItem?.id === item.id ? "#fff" : "#8e8e93",
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
                          color: selectedItem?.id === item.id ? "#5169DD" : "#1c1c1e",
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
                  <ChevronRight 
                    size={16} 
                    style={{ 
                      color: selectedItem?.id === item.id ? "#5169DD" : "#c7c7cc" 
                    }} 
                  />
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
