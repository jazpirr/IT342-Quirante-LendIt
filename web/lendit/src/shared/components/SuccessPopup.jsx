import React from "react";
import "../css/popup.css";

const SuccessPopup = ({ title, message, onClose }) => (
  <div className="success-backdrop" onClick={onClose}>
    <div className="success-popup" onClick={(e) => e.stopPropagation()}>
      <div className="success-icon-wrap">
        <div className="success-ring" />
        <div className="success-ring success-ring-2" />
        <div className="success-circle">
          <svg className="success-check" viewBox="0 0 42 42">
            <polyline className="check-path" points="8,22 17,31 34,13" />
          </svg>
        </div>
      </div>

      <h2 className="success-title">{title}</h2>
      <p className="success-message">{message}</p>

      <button className="success-btn" onClick={onClose}>
        Continue
      </button>
    </div>
  </div>
);

export default SuccessPopup;
