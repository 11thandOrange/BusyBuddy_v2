import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col } from "react-bootstrap";
import {
  selectViewportMode,
  selectElements,
  selectSelectedElementId,
  deselectElement,
  reorderElements,
} from "../../features/editor/editorSlice";
import ViewportToggle from "./ViewportToggle";
import DraggableElement from "./DraggableElement";
import ElementConfigPanel from "./ElementConfigPanel";
import "./LivePreview.css";

/**
 * LivePreview - Main preview component that renders the widget with interactive elements
 * 
 * Features:
 * - Mobile/Desktop viewport toggle
 * - Clickable elements for selection
 * - Drag-and-drop reordering (requires @dnd-kit)
 * - Real-time preview updates from Redux state
 */

export default function LivePreview({ 
  widgetType = "announcement-bar",
  backgroundColor = "#007bff",
  backgroundImage = null,
}) {
  const dispatch = useDispatch();
  const viewportMode = useSelector(selectViewportMode);
  const elements = useSelector(selectElements);
  const selectedElementId = useSelector(selectSelectedElementId);

  const previewWidth = viewportMode === "mobile" ? "375px" : "100%";

  const handleBackgroundClick = () => {
    dispatch(deselectElement());
  };

  // Handler for drag end - to be connected with @dnd-kit
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = elements.findIndex((el) => el.id === active.id);
      const newIndex = elements.findIndex((el) => el.id === over.id);
      dispatch(reorderElements({ sourceIndex: oldIndex, destinationIndex: newIndex }));
    }
  };

  const renderElement = (element) => {
    const { id, type, config } = element;

    switch (type) {
      case "text":
        return (
          <div
            style={{
              color: config.fontColor,
              fontSize: config.fontSize,
              fontFamily: config.fontFamily,
              fontWeight: config.fontWeight,
              letterSpacing: config.letterSpacing,
              lineHeight: config.lineHeight,
              backgroundColor: config.backgroundColor,
              padding: config.padding,
              textAlign: config.textAlign || "center",
            }}
          >
            {config.text}
          </div>
        );

      case "countdown":
        return (
          <div
            className={`countdown-preview ${config.theme?.toLowerCase()}`}
            style={{
              color: config.digitColor,
              backgroundColor: config.backgroundColor,
              fontSize: config.fontSize,
            }}
          >
            <span className="countdown-segment">
              <span className="countdown-value">00</span>
              {config.showLabels && <span className="countdown-label" style={{ color: config.labelColor }}>days</span>}
            </span>
            <span className="countdown-separator">:</span>
            <span className="countdown-segment">
              <span className="countdown-value">00</span>
              {config.showLabels && <span className="countdown-label" style={{ color: config.labelColor }}>hours</span>}
            </span>
            <span className="countdown-separator">:</span>
            <span className="countdown-segment">
              <span className="countdown-value">00</span>
              {config.showLabels && <span className="countdown-label" style={{ color: config.labelColor }}>mins</span>}
            </span>
            <span className="countdown-separator">:</span>
            <span className="countdown-segment">
              <span className="countdown-value">00</span>
              {config.showLabels && <span className="countdown-label" style={{ color: config.labelColor }}>secs</span>}
            </span>
          </div>
        );

      case "button":
        return (
          <button
            style={{
              backgroundColor: config.backgroundColor,
              color: config.textColor,
              fontSize: config.fontSize,
              fontWeight: config.fontWeight,
              borderRadius: config.borderRadius,
              padding: config.padding,
              border: `1px solid ${config.borderColor || "transparent"}`,
              cursor: "pointer",
            }}
          >
            {config.text}
          </button>
        );

      case "emoji":
        return (
          <span style={{ fontSize: config.size }}>{config.emoji}</span>
        );

      default:
        return <span>Unknown element type</span>;
    }
  };

  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return { backgroundColor };
  };

  return (
    <Row className="live-preview-container">
      <Col md={selectedElementId ? 4 : 0} className={selectedElementId ? "" : "d-none"}>
        <ElementConfigPanel />
      </Col>
      
      <Col md={selectedElementId ? 8 : 12}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: "20px", margin: 0 }}>
            Preview
          </h2>
          <ViewportToggle />
        </div>

        <div
          className="preview-viewport"
          style={{
            width: previewWidth,
            margin: viewportMode === "mobile" ? "0 auto" : "0",
            transition: "width 0.3s ease",
          }}
          onClick={handleBackgroundClick}
        >
          {/* Simulated Storefront Header */}
          <div className="storefront-header">
            <div className="storefront-logo">Your Store</div>
            <div className="storefront-nav">
              <span>Home</span>
              <span>Shop</span>
              <span>About</span>
              <span>Contact</span>
            </div>
          </div>

          {/* Widget Preview Area */}
          <div
            className="widget-preview-area"
            style={{
              ...getBackgroundStyle(),
              padding: "15px",
              minHeight: "80px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            {/* 
              When @dnd-kit is installed, wrap elements with:
              <DndContext onDragEnd={handleDragEnd}>
                <SortableContext items={elements.map(el => el.id)}>
            */}
            {elements.length === 0 ? (
              <p style={{ color: "#999", fontStyle: "italic" }}>
                No elements added. Add elements from the Design tab.
              </p>
            ) : (
              elements.map((element) => (
                <DraggableElement key={element.id} element={element}>
                  {renderElement(element)}
                </DraggableElement>
              ))
            )}
            {/* </SortableContext></DndContext> */}
          </div>

          {/* Simulated Storefront Content */}
          <div className="storefront-content">
            <div className="storefront-hero">
              <h1>Welcome to Your Store</h1>
              <p>Discover our amazing products</p>
            </div>
            <div className="storefront-products">
              <div className="product-card placeholder"></div>
              <div className="product-card placeholder"></div>
              <div className="product-card placeholder"></div>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}
