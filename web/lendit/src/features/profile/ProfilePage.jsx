import React, { useState, useEffect } from "react";
import { User, Mail, Phone, ArrowLeft } from "lucide-react";
import "../../shared/css/Home.css";

const ProfilePage = ({ user: propUser, onBack }) => {
  const [user, setUser] = useState(propUser);

  const initials =
    `${user?.fName?.[0] || ""}${user?.lName?.[0] || ""}`.toUpperCase() || "U";

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Invalid stored user:", storedUser);
      }
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--green-mist)" }}>

      <nav className="navbar">
        <button className="nav-link active" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
      </nav>

      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <div className="glass-card" style={{ width: "420px" }}>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile"
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #5F9EA0"
                }}
              />
            ) : (
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #097969, #5F9EA0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {initials}
              </div>
            )}
          </div>

          <div className="auth-header">
            <h2 className="auth-title">
              {user?.fName} {user?.lName}
            </h2>
            <p className="auth-subtitle">Your profile details</p>
          </div>

          <div className="auth-form">

            <div className="form-group">
              <input value={`${user?.fName || ""} ${user?.lName || ""}`} disabled className="input-field" />
            </div>

            <div className="form-group">
              <input value={user?.email || ""} disabled className="input-field" />
            </div>

            <div className="form-group">
              <input value={user?.phone || "No phone added"} disabled className="input-field" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
