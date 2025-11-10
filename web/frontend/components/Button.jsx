import React from "react";
import "../assets/component.css";

const Button = ({ text, onClick, style = {}, className = "" ,disabled=false}) => {
  return (
    <button
      className={`custom-button ${className}`}
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
