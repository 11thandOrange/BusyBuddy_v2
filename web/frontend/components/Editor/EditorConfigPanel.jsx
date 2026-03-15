import React from 'react';

/**
 * EditorConfigPanel - Right panel for configuration forms
 * 
 * @param {string} title - Panel title
 * @param {string} description - Panel description
 * @param {React.ReactNode} children - Form content
 */
export const EditorConfigPanel = ({ 
  title, 
  description, 
  children 
}) => {
  return (
    <div className="config-panel">
      {title && (
        <div className="config-header">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      )}
      <div className="config-content">
        {children}
      </div>
    </div>
  );
};

/**
 * ConfigFormGroup - Form group wrapper
 */
export const ConfigFormGroup = ({ label, hint, children }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
      {hint && <small className="form-hint">{hint}</small>}
    </div>
  );
};

/**
 * ConfigInput - Styled text input
 */
export const ConfigInput = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  ...props 
}) => {
  return (
    <input
      type={type}
      className="form-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  );
};

/**
 * ConfigSelect - Styled select dropdown
 */
export const ConfigSelect = ({ 
  value, 
  onChange, 
  options = [],
  ...props 
}) => {
  return (
    <select
      className="form-select"
      value={value}
      onChange={onChange}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

/**
 * ConfigTextarea - Styled textarea
 */
export const ConfigTextarea = ({ 
  value, 
  onChange, 
  placeholder,
  rows = 3,
  ...props 
}) => {
  return (
    <textarea
      className="form-textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      {...props}
    />
  );
};

/**
 * ConfigToggleRow - Row with label and toggle switch
 */
export const ConfigToggleRow = ({ 
  label, 
  checked, 
  onChange 
}) => {
  return (
    <div className="toggle-row">
      <span className="toggle-label">{label}</span>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  );
};

export default EditorConfigPanel;
