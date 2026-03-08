import React, { useState } from "react";
import { Row, Col, Card, ListGroup } from "react-bootstrap";
import { Play, PlayCircle, CheckCircle } from "react-bootstrap-icons";
import Button from "./Button";

/**
 * VideoList Component - Displays a list of videos with a video player
 * The video player is on the left, list of video options on the right
 * Clicking a list item changes the video being displayed
 * 
 * @param {Array} videos - Array of video objects with id, title, description, src, poster
 * @param {string} appName - The name of the app (for display purposes)
 */
const VideoList = ({ videos = [], appName = "App" }) => {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  
  // Default videos if none provided
  const defaultVideos = [
    {
      id: 1,
      title: "Getting Started",
      description: "Learn how to set up your first widget",
      src: "/videos/getting-started.mp4",
      poster: null,
      duration: "2:30"
    },
    {
      id: 2,
      title: "Customization Options",
      description: "Explore all the styling options available",
      src: "/videos/customization.mp4",
      poster: null,
      duration: "3:45"
    },
    {
      id: 3,
      title: "Advanced Features",
      description: "Discover advanced features and tips",
      src: "/videos/advanced.mp4",
      poster: null,
      duration: "4:15"
    },
    {
      id: 4,
      title: "Best Practices",
      description: "Tips for maximizing conversions",
      src: "/videos/best-practices.mp4",
      poster: null,
      duration: "2:50"
    }
  ];

  const videoList = videos.length > 0 ? videos : defaultVideos;
  const selectedVideo = videoList[selectedVideoIndex];

  return (
    <Row className="g-0" style={{ minHeight: "400px" }}>
      {/* Video Player - Left Side */}
      <Col lg={7} md={12} style={{ padding: "30px" }}>
        <Card className="border-0 h-100" style={{ background: "transparent" }}>
          <Card.Body className="p-0" style={{ background: "transparent" }}>
            <div className="position-relative h-100">
              <video
                key={selectedVideo.id}
                controls
                poster={selectedVideo.poster}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "350px",
                  borderRadius: "15px",
                  background: "#1a1a1a",
                  objectFit: "cover"
                }}
              >
                <source src={selectedVideo.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {/* Video title overlay */}
              <div 
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  background: "rgba(0,0,0,0.7)",
                  padding: "8px 16px",
                  borderRadius: "8px"
                }}
              >
                <span style={{ color: "white", fontWeight: 500 }}>
                  {selectedVideo.title}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Video List - Right Side */}
      <Col lg={5} md={12} style={{ padding: "30px 30px 30px 0" }}>
        <div style={{ height: "100%" }}>
          <h6 style={{ 
            fontWeight: 600, 
            fontSize: "14px", 
            color: "#303030",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            {appName} Video Tutorials
          </h6>
          
          <ListGroup variant="flush" style={{ gap: "8px" }}>
            {videoList.map((video, index) => (
              <ListGroup.Item
                key={video.id}
                action
                active={selectedVideoIndex === index}
                onClick={() => setSelectedVideoIndex(index)}
                style={{
                  cursor: "pointer",
                  borderRadius: "12px",
                  border: selectedVideoIndex === index 
                    ? "2px solid #303030" 
                    : "1px solid #e3e3e3",
                  padding: "16px",
                  marginBottom: "8px",
                  background: selectedVideoIndex === index ? "#f8f9fa" : "white",
                  transition: "all 0.2s ease"
                }}
                className="video-list-item"
              >
                <div className="d-flex align-items-center gap-3">
                  {/* Play Icon */}
                  <div 
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: selectedVideoIndex === index ? "#303030" : "#f1f2f4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    {selectedVideoIndex === index ? (
                      <PlayCircle size={20} color="white" />
                    ) : (
                      <Play size={16} color="#616161" />
                    )}
                  </div>
                  
                  {/* Video Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h6 style={{ 
                      margin: 0, 
                      fontWeight: 600, 
                      fontSize: "14px",
                      color: selectedVideoIndex === index ? "#303030" : "#4A4A4A"
                    }}>
                      {video.title}
                    </h6>
                    <p style={{ 
                      margin: "4px 0 0 0", 
                      fontSize: "12px", 
                      color: "#616161",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {video.description}
                    </p>
                  </div>

                  {/* Duration */}
                  <span style={{
                    fontSize: "12px",
                    color: "#616161",
                    fontWeight: 500,
                    flexShrink: 0
                  }}>
                    {video.duration}
                  </span>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </Col>
    </Row>
  );
};

export default VideoList;
