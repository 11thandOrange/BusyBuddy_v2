import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ButtonGroup, ToggleButton } from "react-bootstrap";
import { Play, ArrowRight } from "react-bootstrap-icons";
import { Form } from "react-bootstrap";
import AnnouncementBarActions from "./announcementBarActions";
import AnnouncementBarEditor from "./AnnouncementBarEditor";
import tshirt from "./tshirt.png";
import "./announcementBarStyles.css";
import Button from "../../components/Button";
import { X, Trash } from "react-bootstrap-icons";
import view from "../../assets/view.png";
import videoimg from "../../assets/videoimg.png";
import dropdown from "../../assets/Vector.png";
import { Spinner } from "@shopify/polaris";
import Analytics from "../../components/Analytics/AnnouncementAnalytics";

// Feature flag to toggle between old and new editor
const USE_NEW_EDITOR = true;

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
  // Show editor when creating/editing announcement bar
  if (showBundleAction) {
    // Use new editor or old editor based on feature flag
    if (USE_NEW_EDITOR) {
      return (
        <AnnouncementBarEditor
          editingBar={editingBar}
          onSave={async (data) => {
            try {
              const url = editingBar 
                ? `/api/announcement-bars/${editingBar._id}` 
                : '/api/announcement-bars';
              const method = editingBar ? 'PUT' : 'POST';
              
              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              
              if (!response.ok) throw new Error('Save failed');
              handleActionSuccess();
            } catch (err) {
              console.error('Save error:', err);
              alert('Failed to save announcement bar');
            }
          }}
          onDiscard={() => {
            setShowBundleAction(false);
            setEditingBar(null);
          }}
        />
      );
    }
    
    // Old editor (fallback)
    return (
      <AnnouncementBarActions
        ref={discountActionsRef}
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
          <>
            {/* Video Display */}
            <Col
              lg={6}
              md={12}
              style={{
                padding: "50px",
              }}
            >
              <Card className="border-0 h-100 " style={{ background: "transparent !important" }}>
                <Card.Body className="p-0 " style={{ background: "transparent !important" }}>
                  <div className="position-relative h-100">
                    <video
                      controls
                      poster={videoimg}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "15px",
                        padding: "4px",
                      }}
                    >
                      <source src="/videos/marshall-promo.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <Button
                        text={<Play size={24} />}
                        onClick={() => console.log("Discard")}
                        variant="light"
                        className="rounded-circle p-3 opacity-75"
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Side Features */}
            <Col
              lg={6}
              md={12}
              style={{
                padding: "50px 0",
              }}
            >
              <div
                className="d-flex justify-content-between flex-column linrrowleft"
                style={{ height: "100%" }}
              >
                <div>
                  <div className="d-flex mb-3 gap-2 flex-column">
                    <div
                      className="bg-dark rounded-circle d-flex align-items-center justify-content-center"
                      style={{ height: "50px", width: "50px" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                      </svg>
                    </div>
                    <div>
                      <h5
                        className="mb-1"
                        style={{
                          fontWeight: 600,
                          fontSize: "16px",
                          letterSpacing: "0",
                        }}
                      >
                        Customizable
                      </h5>
                      <p
                        className="text-secondary mb-0"
                        style={{
                          fontWeight: 500,
                          fontSize: "14px",
                          letterSpacing: "0",
                          color: "#616161",
                        }}
                      >
                        Discount, Display style & Priority.
                      </p>
                    </div>
                  </div>

                  <div className="d-flex mb-3 gap-2 flex-column">
                    <div
                      className="bg-dark rounded-circle d-flex align-items-center justify-content-center"
                      style={{ height: "50px", width: "50px" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    </div>
                    <div>
                      <h5
                        className="mb-1"
                        style={{
                          fontWeight: 600,
                          fontSize: "16px",
                          letterSpacing: "0",
                        }}
                      >
                        Responsive
                      </h5>
                      <p
                        className="text-secondary mb-0"
                        style={{
                          fontWeight: 500,
                          fontSize: "14px",
                          letterSpacing: "0",
                          color: "#616161",
                        }}
                      >
                        Looks great on any device.
                      </p>
                    </div>
                  </div>

                  <div className="d-flex mb-5 gap-2 flex-column">
                    <div
                      className="bg-dark rounded-circle d-flex align-items-center justify-content-center"
                      style={{ height: "50px", width: "50px" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <path d="M13 2v7h7"></path>
                      </svg>
                    </div>
                    <div>
                      <h5
                        className="mb-1"
                        style={{
                          fontWeight: 600,
                          fontSize: "16px",
                          letterSpacing: "0",
                        }}
                      >
                        Attention grabbing
                      </h5>
                      <p
                        className="text-secondary mb-0"
                        style={{
                          fontWeight: 500,
                          fontSize: "14px",
                          letterSpacing: "0",
                          color: "#616161",
                        }}
                      >
                        Keep your customers informed without disrupting their shopping.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-start flex-column">
                  <Button
                    variant="dark"
                    className="mb-3 d-flex align-items-center justify-content-center"
                    text=" Make your Announcement Bar!"
                    style={{
                      maxWidth: "400px",
                      borderRadius: "40px",
                      height: "45px",
                      fontWeight: 500,
                      fontSize: "15px",
                      letterSpacing: "0",
                      backgroundColor: "black",
                      borderColor: "black",
                      color: "white",
                      padding: "15px 25px",
                    }}
                    onClick={() => {
                      setShowBundleAction(true);
                      onMakeBundleClick();
                    }}
                  />

                  <div>
                    <span
                      className="text-secondary"
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        letterSpacing: "0",
                        textAlign: "center",
                      }}
                    >
                      Learn More about{" "}
                    </span>
                    <a
                      href="#"
                      className="text-primary"
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        letterSpacing: "0",
                        textAlign: "center",
                        color: "#5169DD",
                      }}
                    >
                      How to create bundle?
                    </a>
                  </div>
                </div>
              </div>
            </Col>
          </>
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
