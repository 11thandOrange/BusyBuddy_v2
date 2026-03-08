import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Card, Accordion } from "react-bootstrap";
import { SketchPicker } from "react-color";
import { X } from "lucide-react";
import {
  selectSelectedElement,
  updateElementConfig,
  deselectElement,
  removeElement,
} from "../../features/editor/editorSlice";
import Button from "../Button";
import "./LivePreview.css";

const fontFamilies = [
  "Inter",
  "Arial",
  "Verdana",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Roboto",
  "Open Sans",
];

const fontWeights = [
  { label: "Normal", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semi Bold", value: "600" },
  { label: "Bold", value: "700" },
];

export default function ElementConfigPanel() {
  const dispatch = useDispatch();
  const selectedElement = useSelector(selectSelectedElement);
  const [activeColorPicker, setActiveColorPicker] = useState(null);

  if (!selectedElement) {
    return (
      <div className="config-panel-empty">
        <p>Click on an element in the preview to edit it</p>
      </div>
    );
  }

  const { id, type, config } = selectedElement;

  const handleConfigChange = (key, value) => {
    dispatch(updateElementConfig({ elementId: id, config: { [key]: value } }));
  };

  const handleClose = () => {
    dispatch(deselectElement());
  };

  const handleDelete = () => {
    dispatch(removeElement(id));
  };

  const ColorPickerField = ({ label, configKey }) => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <div className="color-picker-wrapper">
        <div
          className="color-swatch"
          style={{ backgroundColor: config[configKey] || "#000000" }}
          onClick={() =>
            setActiveColorPicker(activeColorPicker === configKey ? null : configKey)
          }
        />
        <span className="color-value">{config[configKey]}</span>
        {activeColorPicker === configKey && (
          <div className="color-picker-popover">
            <div className="color-picker-cover" onClick={() => setActiveColorPicker(null)} />
            <SketchPicker
              color={config[configKey]}
              onChange={(color) => handleConfigChange(configKey, color.hex)}
            />
          </div>
        )}
      </div>
    </Form.Group>
  );

  const renderTextConfig = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Text Content</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={config.text || ""}
          onChange={(e) => handleConfigChange("text", e.target.value)}
        />
      </Form.Group>

      <ColorPickerField label="Font Color" configKey="fontColor" />
      <ColorPickerField label="Background Color" configKey="backgroundColor" />

      <Form.Group className="mb-3">
        <Form.Label>Font Size</Form.Label>
        <div className="d-flex gap-2 align-items-center">
          <Form.Range
            min={10}
            max={48}
            value={parseInt(config.fontSize) || 16}
            onChange={(e) => handleConfigChange("fontSize", `${e.target.value}px`)}
          />
          <span style={{ minWidth: "50px" }}>{config.fontSize}</span>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Font Family</Form.Label>
        <Form.Select
          value={config.fontFamily || "Inter"}
          onChange={(e) => handleConfigChange("fontFamily", e.target.value)}
        >
          {fontFamilies.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Font Weight</Form.Label>
        <Form.Select
          value={config.fontWeight || "500"}
          onChange={(e) => handleConfigChange("fontWeight", e.target.value)}
        >
          {fontWeights.map((fw) => (
            <option key={fw.value} value={fw.value}>
              {fw.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Letter Spacing</Form.Label>
        <div className="d-flex gap-2 align-items-center">
          <Form.Range
            min={-2}
            max={10}
            value={parseInt(config.letterSpacing) || 0}
            onChange={(e) => handleConfigChange("letterSpacing", `${e.target.value}px`)}
          />
          <span style={{ minWidth: "50px" }}>{config.letterSpacing}</span>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Line Height</Form.Label>
        <div className="d-flex gap-2 align-items-center">
          <Form.Range
            min={0.8}
            max={3}
            step={0.1}
            value={parseFloat(config.lineHeight) || 1.2}
            onChange={(e) => handleConfigChange("lineHeight", e.target.value)}
          />
          <span style={{ minWidth: "50px" }}>{config.lineHeight}</span>
        </div>
      </Form.Group>
    </>
  );

  const renderCountdownConfig = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Timer Theme</Form.Label>
        <Form.Select
          value={config.theme || "Classic"}
          onChange={(e) => handleConfigChange("theme", e.target.value)}
        >
          <option value="Classic">Classic</option>
          <option value="Cards">Cards</option>
          <option value="Moderns">Moderns</option>
          <option value="Minimalist">Minimalist</option>
          <option value="Progress Bar">Progress Bar</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>End Date</Form.Label>
        <Form.Control
          type="datetime-local"
          value={config.endDate || ""}
          onChange={(e) => handleConfigChange("endDate", e.target.value)}
        />
      </Form.Group>

      <ColorPickerField label="Digit Color" configKey="digitColor" />
      <ColorPickerField label="Label Color" configKey="labelColor" />
      <ColorPickerField label="Background" configKey="backgroundColor" />

      <Form.Group className="mb-3">
        <Form.Check
          type="switch"
          label="Show Labels"
          checked={config.showLabels !== false}
          onChange={(e) => handleConfigChange("showLabels", e.target.checked)}
        />
      </Form.Group>
    </>
  );

  const renderButtonConfig = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Button Text</Form.Label>
        <Form.Control
          type="text"
          value={config.text || ""}
          onChange={(e) => handleConfigChange("text", e.target.value)}
        />
      </Form.Group>

      <ColorPickerField label="Background Color" configKey="backgroundColor" />
      <ColorPickerField label="Text Color" configKey="textColor" />
      <ColorPickerField label="Border Color" configKey="borderColor" />

      <Form.Group className="mb-3">
        <Form.Label>Border Radius</Form.Label>
        <div className="d-flex gap-2 align-items-center">
          <Form.Range
            min={0}
            max={30}
            value={parseInt(config.borderRadius) || 8}
            onChange={(e) => handleConfigChange("borderRadius", `${e.target.value}px`)}
          />
          <span style={{ minWidth: "50px" }}>{config.borderRadius}</span>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Padding</Form.Label>
        <Form.Control
          type="text"
          value={config.padding || "10px 20px"}
          onChange={(e) => handleConfigChange("padding", e.target.value)}
        />
      </Form.Group>
    </>
  );

  const renderEmojiConfig = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Emoji</Form.Label>
        <Form.Control
          type="text"
          value={config.emoji || "🔔"}
          onChange={(e) => handleConfigChange("emoji", e.target.value)}
          style={{ fontSize: "24px", textAlign: "center" }}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Size</Form.Label>
        <div className="d-flex gap-2 align-items-center">
          <Form.Range
            min={12}
            max={64}
            value={parseInt(config.size) || 24}
            onChange={(e) => handleConfigChange("size", `${e.target.value}px`)}
          />
          <span style={{ minWidth: "50px" }}>{config.size}</span>
        </div>
      </Form.Group>
    </>
  );

  const renderConfigByType = () => {
    switch (type) {
      case "text":
        return renderTextConfig();
      case "countdown":
        return renderCountdownConfig();
      case "button":
        return renderButtonConfig();
      case "emoji":
        return renderEmojiConfig();
      default:
        return <p>Unknown element type: {type}</p>;
    }
  };

  return (
    <Card className="config-panel">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span className="config-panel-title">
          Edit {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        <X size={20} onClick={handleClose} style={{ cursor: "pointer" }} />
      </Card.Header>
      <Card.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
        {renderConfigByType()}
        
        <hr />
        
        <Button
          text="Delete Element"
          onClick={handleDelete}
          style={{
            backgroundColor: "rgba(196, 41, 14, 0.1)",
            color: "#C4290E",
            border: "1px solid #C4290E",
            borderRadius: "8px",
            width: "100%",
            padding: "10px",
          }}
        />
      </Card.Body>
    </Card>
  );
}
