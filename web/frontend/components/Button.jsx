import React from "react";
import "../assets/component.css";

const Button = ({ text, onClick, style = {}, className = "" }) => {
  return (
    <button
      className={`custom-button ${className}`}
      style={style}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
