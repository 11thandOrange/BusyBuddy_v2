import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import { Monitor, Phone } from "lucide-react";
import { setViewportMode, selectViewportMode } from "../../features/editor/editorSlice";

export default function ViewportToggle() {
  const dispatch = useDispatch();
  const viewportMode = useSelector(selectViewportMode);

  const viewports = [
    { value: "desktop", icon: <Monitor size={18} />, label: "Desktop" },
    { value: "mobile", icon: <Phone size={18} />, label: "Mobile" },
  ];

  return (
    <div className="viewport-toggle-container" style={{ marginBottom: "15px" }}>
      <ButtonGroup>
        {viewports.map((viewport) => (
          <ToggleButton
            key={viewport.value}
            id={`viewport-${viewport.value}`}
            type="radio"
            variant={viewportMode === viewport.value ? "dark" : "outline-secondary"}
            name="viewport"
            value={viewport.value}
            checked={viewportMode === viewport.value}
            onChange={(e) => dispatch(setViewportMode(e.currentTarget.value))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: viewportMode === viewport.value ? "8px" : "8px",
            }}
          >
            {viewport.icon}
            {viewport.label}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </div>
  );
}
