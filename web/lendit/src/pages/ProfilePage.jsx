import React from "react";
import { User, Mail, Phone, ArrowLeft } from "lucide-react";
import "../css/Home.css";

const ProfilePage = ({ user, onBack }) => {
  const initials = `${user?.fName?.[0] || ""}${user?.lName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div style={{ minHeight: "100vh", background: "var(--green-mist)" }}>
      
      {/* NAVBAR (simple version) */}
      <nav className="navbar">
        <button className="nav-link active" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
      </nav>

      {/* PROFILE CARD */}
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <div className="glass-card" style={{ width: "420px" }}>
          
          {/* Avatar */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #097969, #5F9EA0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {initials}
            </div>
          </div>

          {/* Title */}
          <div className="auth-header">
            <h2 className="auth-title">
              {user?.fName} {user?.lName}
            </h2>
            <p className="auth-subtitle">Your profile details</p>
          </div>

          {/* Info Fields */}
          <div className="auth-form">

            <div className="form-group">
              <div className="input-wrapper">
                <div className="icon-wrapper">
                  <User size={20} />
                </div>
                <input
                  value={`${user?.fName} ${user?.lName}`}
                  disabled
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <div className="icon-wrapper">
                  <Mail size={20} />
                </div>
                <input
                  value={user?.email || ""}
                  disabled
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <div className="icon-wrapper">
                  <Phone size={20} />
                </div>
                <input
                  value={user?.phone || "No phone added"}
                  disabled
                  className="input-field"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;