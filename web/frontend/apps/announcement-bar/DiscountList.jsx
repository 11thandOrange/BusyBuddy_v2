import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ButtonGroup, ToggleButton } from "react-bootstrap";
import { Play, ArrowRight } from "react-bootstrap-icons";
import { Form } from "react-bootstrap";
import tshirt from "./tshirt.png";
import "./announcementBarStyles.css";
import Button from "../../components/Button";
import { X, Trash } from "react-bootstrap-icons";
import view from "../../assets/view.png";
import videoimg from "../../assets/videoimg.png";
import dropdown from "../../assets/Vector.png";
import { Spinner } from "@shopify/polaris";
import Analytics from "../../components/Analytics/AnnouncementAnalytics";
import { useEditorNavigation } from "../../hooks";

export default function DiscountList({ refreshTrigger, onSaveSuccess }) {
  const tabs = ["Overview", "Announcement Bars", "Setting", "Analytics"];
  const [selectedTab, setSelectedTab] = useState(tabs[1]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [announcementBars, setAnnouncementBars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  
  const { openEditor } = useEditorNavigation();

  // Fetch announcement bars when component mounts or refreshTrigger changes
  useEffect(() => {
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
      setAnnouncementBars(data?.data?.announcementBars || []);
      setTotalItems(data?.data?.pagination?.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (barId) => {
    openEditor(barId); // Navigate to editor with bar ID (fullscreen)
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/announcement-bars/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      fetchAnnouncementBars(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (id, newStatus) => {
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
  };

  const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
      <div className="d-flex justify-content-center align-items-center gap-2 my-3">
        <Button
          text="Previous"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
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
          </div>
        </div>
      </Row>

      {/* Select All / Delete All Row */}
      {selectedTab === "Announcement Bars" && (
        <div className="d-flex justify-content-between my-2 px-2 py-1">
          <Button
            text={
              <div className="slecetbox">
                <Form.Check 
                  type="checkbox" 
                  checked={isChecked} 
                  onChange={() => setIsChecked(!isChecked)}
                  className="custom-checkbox me-2" 
                />
                <p className="selecttext">Select All</p>
              </div>
            }
            onClick={() => setIsChecked(!isChecked)}
            style={{
              backgroundColor: "white",
              color: "black",
              border: "1px solid rgba(34, 34, 34, 0.1)",
              display: "flex",
              borderRadius: "8px",
              padding: "7px 10px 7px 7px",
            }}
          />

          <Button
            text={
              <>
                <Trash style={{ marginRight: "6px" }} />
                Delete All
              </>
            }
            onClick={() => console.log("Delete all selected")}
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

      {/* Overview Tab */}
      {selectedTab === "Overview" && (
        <>
          <Col lg={6} md={12}>
            <Card className="border-0" style={{ backgroundColor: "transparent" }}>
              <Card.Body className="p-0">
                <div className="video-container position-relative">
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
                    <button className="btn btn-light rounded-circle p-3">
                      <Play size={24} />
                    </button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} md={12}>
            <div
              className="p-4 d-flex flex-column justify-content-between h-100"
              style={{ minHeight: "300px" }}
            >
              <div>
                <h5 style={{ fontWeight: 600, fontSize: "20px", lineHeight: "1" }}>
                  Get started with Announcement Bar
                </h5>
                <p
                  className="mt-3"
                  style={{ fontWeight: 500, fontSize: "14px", lineHeight: "1.3", color: "#616161" }}
                >
                  Display important updates, promotions, or messages across your store to capture
                  visitors' attention instantly.
                </p>
              </div>
              <div className="mt-4">
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
          </Col>
        </>
      )}

      {/* Announcement Bars Tab */}
      {selectedTab === "Announcement Bars" && (
        <div className="d-flex flex-column gap-3">
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
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                </Row>
              ))}
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
      )}

      {/* Setting Tab */}
      {selectedTab === "Setting" && (
        <div className="d-flex flex-column gap-3">
          <Row className="g-0 linrrow">
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
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === "Analytics" && (
        <Col lg={12} className="p-4">
          <Analytics />
        </Col>
      )}
    </Container>
  );
}

const AnnouncementBarItem = ({ bar, onEdit, onDelete, onToggle }) => {
  return (
    <Card className="border-0 w-full" style={{ background: "rgb(241, 242, 244)" }}>
      <Card.Body className="d-flex align-items-center justify-content-between mt-3">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex flex-column">
            <span className="bundletext" style={{ fontWeight: 600 }}>
              {bar.name || "Untitled Announcement Bar"}
            </span>
            <span style={{ color: "#616161", fontSize: "13px" }}>{bar.message || "No message"}</span>
          </div>
        </div>

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
