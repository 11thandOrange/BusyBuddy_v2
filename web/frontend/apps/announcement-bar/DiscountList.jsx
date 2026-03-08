import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ButtonGroup, ToggleButton } from "react-bootstrap";
import { Play, ArrowRight } from "react-bootstrap-icons";
import { Form } from "react-bootstrap";
import AnnouncementBarActions from "./announcementBarActions";
import tshirt from "./tshirt.png";
import "./announcementBarStyles.css";
import Button from "../../components/Button";
import { X, Trash } from "react-bootstrap-icons";
import view from "../../assets/view.png";
import videoimg from "../../assets/videoimg.png";
import dropdown from "../../assets/Vector.png";
import { Spinner } from "@shopify/polaris";
import Analytics from "../../components/Analytics/AnnouncementAnalytics";
import VideoList from "../../components/VideoList";

// Announcement Bar specific videos
const announcementBarVideos = [
  {
    id: 1,
    title: "Creating Your First Bar",
    description: "Learn how to set up an announcement bar",
    src: "/videos/announcement-getting-started.mp4",
    poster: null,
    duration: "2:15"
  },
  {
    id: 2,
    title: "Styling Options",
    description: "Customize colors, fonts, and animations",
    src: "/videos/announcement-styling.mp4",
    poster: null,
    duration: "3:30"
  },
  {
    id: 3,
    title: "Countdown Timers",
    description: "Add urgency with countdown features",
    src: "/videos/announcement-countdown.mp4",
    poster: null,
    duration: "2:45"
  },
  {
    id: 4,
    title: "Targeting & Scheduling",
    description: "Show bars to the right audience",
    src: "/videos/announcement-targeting.mp4",
    poster: null,
    duration: "3:00"
  }
];

export default function DiscountList({
  onMakeBundleClick,
  refreshTrigger,
  onBundleCreated,
  discountActionsRef,
  autoTriggerActions,
}) {
  const tabs = ["Overview", "Announcement Bars", "Setting", "Analytics"];
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [selectedTab, setSelectedTab] = useState(tabs[1]);
  const [showBundleAction, setShowBundleAction] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [checkboxes, setCheckboxes] = useState([false, false, false, false]);
  const [toggles, setToggles] = useState([true, true, true, true]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [announcementBars, setAnnouncementBars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // You can make this configurable
  const [totalItems, setTotalItems] = useState(0);
  const [editingBar, setEditingBar] = useState(null);
  // Fetch announcement bars when component mounts
  // Handle auto-trigger with loader
  useEffect(() => {
    if (autoTriggerActions) {
      // Set a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowBundleAction(true);
        if (onMakeBundleClick) {
          onMakeBundleClick();
        }
        setIsLoading(false);
      }, 10);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [autoTriggerActions, onMakeBundleClick]);
  // Fetch announcement bars when component mounts
  useEffect(() => {
    if (!autoTriggerActions) {
      // Only fetch if not auto-triggering
      setSelectedTab(tabs[1]);
      fetchAnnouncementBars();
    }
  }, [refreshTrigger, autoTriggerActions]);
  useEffect(() => {
    setSelectedTab(tabs[1]);
    fetchAnnouncementBars();
  }, [refreshTrigger]);
  const fetchAnnouncementBars = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/announcement-bars?page=${page}&limit=${itemsPerPage}`);
      if (!response.ok) {
        throw new Error("Failed to fetch announcement bars");
      }
      const data = await response.json();
      console.log("Fetched Announcement Bars:", data.data);
      setAnnouncementBars(data?.data?.announcementBars || []);
      setTotalItems(data?.data?.pagination?.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleCheckboxChange = (index) => {
    setCheckboxes((prev) => prev.map((checked, i) => (i === index ? !checked : checked)));
  };

  const handleToggleChange = (index) => {
    setToggles((prev) => prev.map((toggled, i) => (i === index ? !toggled : toggled)));
  };
  const handleActionSuccess = () => {
    setShowBundleAction(false);
    if (onBundleCreated) {
      onBundleCreated();
    }
  };
  // Show loader while determining what to display
  if (isLoading) {
    return (
      <Container
        fluid
        className="bg-white d-flex justify-content-center align-items-center"
        style={{
          maxWidth: "1500px",
          margin: "50px auto",
          borderRadius: "15px",
          height: "300px",
        }}
      >
        <div className="text-center">
          <Spinner animation="border" role="status" variant="dark" />
          <p className="mt-3" style={{ color: "#616161" }}>
            Loading...
          </p>
        </div>
      </Container>
    );
  }
  // if (showBundleAction) {
  //   return <AnnouncementBarActions />;
  // }
  // With this:
  if (showBundleAction) {
    return (
      <AnnouncementBarActions
        ref={discountActionsRef} // Pass the ref here
        onMakeBundleClick={onMakeBundleClick}
        editingBar={editingBar}
        onSuccess={handleActionSuccess}
      />
    );
  }
  const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
      <div className="d-flex justify-content-center align-items-center gap-2 my-3">
        <Button
          text="Previous"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 ? true : false}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(34, 34, 34, 0.1)",
            backgroundColor: currentPage === 1 ? "#f1f2f4" : "white",
            color: currentPage === 1 ? "#616161" : "black",
          }}
        />
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            text={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(34, 34, 34, 0.1)",
              backgroundColor: currentPage === page ? "#5169DD" : "white",
              color: currentPage === page ? "white" : "black",
            }}
          />
        ))}

        <Button
          text="Next"
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(34, 34, 34, 0.1)",
            backgroundColor: currentPage === totalPages ? "#f1f2f4" : "white",
            color: currentPage === totalPages ? "#616161" : "black",
          }}
          disabled={currentPage === totalPages}
        />
      </div>
    );
  };
  return (
    <Container
      fluid
      className="bg-white"
      style={{
        maxWidth: "1500px",
        margin: "50px auto",
        padding: "10px !important",
        borderRadius: "15px",
        padding: "5px 15px",
      }}
    >
      {/* Navigation Tabs */}
      <Row>
        <div className="d-flex gap-1">
          <div
            className="d-flex justify-content-between align-items-center"
            style={{
              marginLeft: "0",
              marginRight: "0",

              padding: "0px",
              boxShadow: "1px 1px 4px 0px #0000001A inset",
              backgroundColor: "#F1F2F4",
              borderRadius: "15px",
              marginBottom: "8px",
              height: "51px",
              width: "100%",
            }}
          >
            {/* Left-aligned Toggle Buttons */}
            <ButtonGroup className="d-flex gap-2" style={{ padding: "10px !important" }}>
              {tabs.map((tab, idx) => (
                <ToggleButton
                  key={idx}
                  id={`tab-${idx}`}
                  type="radio"
                  variant={selectedTab === tab ? "dark" : ""}
                  name="tab"
                  value={tab}
                  checked={selectedTab === tab}
                  onChange={(e) => setSelectedTab(e.currentTarget.value)}
                  style={
                    selectedTab === tab
                      ? {
                          backgroundColor: "black",
                          borderColor: "black",
                          borderRadius: "15px",
                          width: "180px",
                          // height: "43px",
                          padding: "15px 12px",
                          fontFamily: "Inter",
                          fontStyle: "normal",
                          fontWeight: "600",
                          fontSize: "13px",
                          lineHeight: "100%",
                          color: "white",
                          margin: "0px",
                        }
                      : {
                          borderRadius: "15px",
                          width: "180px",
                          // height: "43px",
                          padding: "15px 12px",
                          fontFamily: "Inter",
                          fontStyle: "normal",
                          fontWeight: "600",
                          fontSize: "13px",
                          lineHeight: "100%",
                          color: "#4A4A4A",
                          margin: "0px",
                        }
                  }
                  className="d-flex justify-content-center align-items-center"
                >
                  {tab}
                </ToggleButton>
              ))}
            </ButtonGroup>

            {/* Right-aligned Create Discount Button */}
          </div>
          {selectedTab === "Discounts" && (
            <Button
              text="Create Discount"
              onClick={() => console.log("Create Discount")}
              style={{
                background: "black",
                borderRadius: "12px",
                padding: "15px 12px",
                color: "white",
                width: "200px",
                height: "51px",
              }}
            />
          )}
        </div>
      </Row>
      {selectedTab === "Discounts" && (
        <div className="d-flex justify-content-between  my-2 px-2 py-1">
          <Button
            text={
              <div className="slecetbox">
                <Form.Check type="checkbox" checked={isChecked} className="custom-checkbox me-2" />{" "}
                <p className="selecttext">Select All</p>
              </div>
            }
            onClick={() => console.log("Select")}
            style={{
              backgroundColor: "white",
              color: "#5169DD",
              border: "1px solid rgba(34, 34, 34, 0.1)",
              display: "flex",
              borderRadius: "8px",
              padding: "7px 10px 7px 7px",
              color: "black",
            }}
          />

          <Button
            text={
              <>
                <Trash style={{ marginRight: "6px" }} />
                Delete All
              </>
            }
            onClick={() => console.log("clear")}
            style={{
              backgroundColor: "rgba(196, 41, 14, 0.1)",
              color: "#C4290E",
              border: "1px solid #C4290E",
              borderRadius: "8px",
              padding: "7px 10px 7px 7px",
            }}
          />
        </div>
      )}
      <Row
        className="mt-2"
        style={{
          padding: "0px",
          boxShadow: "1px 1px 4px 0px #0000001A inset",
          backgroundColor: "#F1F2F4",
          borderRadius: "15px",
        }}
      >
        {selectedTab === "Overview" && (
          <VideoList videos={announcementBarVideos} appName="Announcement Bar" />
        )}

        {selectedTab === "Announcement Bars" && (
          <>
            <div className="d-flex flex-column gap-3">
              {/* List of Announcement Bars */}
              {loading ? (
                <div className="text-center py-4">Loading announcement bars...</div>
              ) : error ? (
                <div className="text-center py-4 text-danger">{error}</div>
              ) : announcementBars.length > 0 ? (
                <>
                  {announcementBars.map((bar) => (
                    <Row key={bar._id} className="g-0 linrrow">
                      <AnnouncementBarItem
                        bar={bar}
                        onEdit={(id) => {
                          setShowBundleAction(true);
                          onMakeBundleClick();
                          setEditingBar(bar);
                        }}
                        onDelete={async (id) => {
                          try {
                            const response = await fetch(`/api/announcement-bars/${id}`, {
                              method: "DELETE",
                            });
                            if (!response.ok) throw new Error("Delete failed");
                            // Refresh the current page after deletion
                            fetchAnnouncementBars(currentPage);
                          } catch (err) {
                            setError(err.message);
                          }
                        }}
                        onToggle={async (id, newStatus) => {
                          try {
                            const response = await fetch(`/api/announcement-bars/${id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: newStatus }),
                            });
                            if (!response.ok) throw new Error("Update failed");

                            setAnnouncementBars(
                              announcementBars.map((b) =>
                                b._id === id ? { ...b, status: newStatus } : { ...b, status: false }
                              )
                            );
                          } catch (err) {
                            setError(err.message);
                          }
                        }}
                      />
                    </Row>
                  ))}

                  {/* Pagination Controls */}
                  {totalItems > itemsPerPage && (
                    <Pagination
                      currentPage={currentPage}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={(page) => fetchAnnouncementBars(page)}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-4">No announcement bars created yet</div>
              )}
            </div>
          </>
        )}
        {selectedTab === "Setting" && (
          <div className="d-flex flex-column gap-3 ">
            {" "}
            <>
              <Row className="g-0 linrrow">
                {" "}
                {/* Each bundle in a separate row */}
                <Card className="border-0 w-full" style={{ background: "rgb(241, 242, 244)" }}>
                  <Card.Body className="d-flex align-items-center justify-content-between">
                    <div className="d-flex flex-column gap-[10px]">
                      <Form.Group>
                        <Form.Check
                          type="checkbox"
                          className="custom-checkbox"
                          checked={showCountdown}
                          onChange={() => setShowCountdown(!showCountdown)}
                          label={
                            <span style={{ marginLeft: "6px", marginTop: "5px" }}>Enable close button</span>
                          }
                          style={{
                            fontFamily: "Inter",
                            fontStyle: "bold",
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "#303030",
                            whiteSpace: "nowrap",
                          }}
                        />
                        <p
                          style={{
                            fontFamily: "Inter",
                            fontStyle: "normal",
                            fontWeight: "500",
                            fontSize: "13px",
                            lineHeight: "100%",
                            color: "#616161",
                          }}
                          className="mt-2"
                        >
                          Enable this setting if you want to allow your customers to be able to close the bar
                          while navigating the store.
                        </p>
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
              </Row>
            </>
          </div>
        )}
        {selectedTab === "Analytics" && (
          <Col lg={12} className="p-4">
            <Analytics />
          </Col>
        )}
      </Row>
    </Container>
  );
}
const AnnouncementBarItem = ({ bar, onEdit, onDelete, onToggle }) => {
  return (
    <Card className="border-0 w-full" style={{ background: "rgb(241, 242, 244)" }}>
      <Card.Body className="d-flex align-items-center justify-content-between mt-3">
        {/* Left side - Checkbox and Bar Info */}
        <div className="d-flex align-items-center gap-3">
          {/* <Form.Check type="checkbox" className="custom-checkbox" /> */}

          <div className="d-flex flex-column">
            <span className="bundletext" style={{ fontWeight: 600 }}>
              {bar.name || "Untitled Announcement Bar"}
            </span>
            <span style={{ color: "#616161", fontSize: "13px" }}>{bar.message || "No message"}</span>
          </div>
        </div>

        {/* Right side - Status and Actions */}
        <div className="d-flex align-items-center gap-3">
          <Form.Check
            type="switch"
            id={`toggle-${bar._id}`}
            checked={bar.status === "active"}
            onChange={() => onToggle(bar._id, bar.status === "active" ? "inactive" : "active")}
          />

          <span style={{ color: bar.status === "active" ? "#4CAF50" : "#616161" }}>
            {bar.status === "active" ? "Active" : "Inactive"}
          </span>

          <Button
            text="Edit"
            onClick={() => onEdit(bar._id)}
            style={{
              backgroundColor: "rgba(81, 105, 221, 0.1)",
              color: "#5169DD",
              border: "1px solid #5169DD",
              borderRadius: "8px",
              padding: "8px",
            }}
          />

          <Button
            text={<Trash size={16} />}
            onClick={() => onDelete(bar._id)}
            style={{
              backgroundColor: "rgba(196, 41, 14, 0.1)",
              color: "#C4290E",
              border: "1px solid #C4290E",
              borderRadius: "8px",
              padding: "8px",
            }}
          />
        </div>
      </Card.Body>
    </Card>
  );
};
