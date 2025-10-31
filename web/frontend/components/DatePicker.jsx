import React, { useCallback } from "react";

import { TextField } from "@shopify/polaris";
const DatePicker = ({
  label,
  helpText,
  onDatePicked,
  minValue,
  errorMessage,
  initialValue = "2024-11-13T12:30",
}) => {
  return (
    <div className="date-picker-container">
      <CustomTextField
        type="datetime-local"
        label={label}
        helpText={helpText}
        onValueChange={onDatePicked}
        min={minValue}
        errorMessage={errorMessage}
        value={initialValue}
      ></CustomTextField>
    </div>
  );
};

function CustomTextField({
  type,
  label,
  helpText,
  readOnly = false,
  value,
  placeholder = "",
  onValueChange = () => {},
  disabled = false,
  min,
  errorMessage = false,
  max,
  maxLength = 1000,
  prefix = "",
  autoFocus = false,
  step = "any",
}) {
  const handleTextFieldChange = useCallback((value) => {
    onValueChange(value);
  }, []);

  return (
    <>
      <TextField
        step={step}
        autoFocus={autoFocus}
        label={label}
        type={type}
        value={value}
        onChange={handleTextFieldChange}
        helpText={helpText}
        placeholder={placeholder}
        disabled={disabled}
        {...(min !== undefined ? { min } : {})}
        {...(max !== undefined ? { max } : {})}
        error={errorMessage}
        maxLength={maxLength}
        prefix={prefix}
      />
    </>
  );
}

export default DatePicker;
