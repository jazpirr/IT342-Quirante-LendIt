import React from "react";
import "../css/popup.css";

const SuccessPopup = ({ title = "Success!", message, onClose }) => {
  return (
    <div className="success-backdrop" onClick={onClose}>
      <div className="success-popup" onClick={(e) => e.stopPropagation()}>

        {/* Animated check icon */}
        <div className="success-icon-wrap">
          <div className="success-ring"></div>
          <div className="success-ring success-ring-2"></div>
          <div className="success-circle">
            <svg viewBox="0 0 42 42" className="success-check">
              <polyline
                points="8,21 17,30 34,12"
                className="check-path"
              />
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
};

export default SuccessPopup;