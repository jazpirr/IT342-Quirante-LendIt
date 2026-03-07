import React, { useState, useEffect } from "react";
import { LogOut, Mail, User } from "lucide-react";
import Login from "./components/Login";
import Register from "./components/Register";
import "./css/Home.css";
import "./css/PageTransition.css";

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Check session on load
  useEffect(() => {
    fetch("http://localhost:8080/api/user/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  const switchToRegister = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowLogin(false);
      setIsTransitioning(false);
    }, 300);
  };

  const switchToLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowLogin(true);
      setIsTransitioning(false);
    }, 300);
  };

  // Dashboard View
  if (user) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-blob-1"></div>
        <div className="dashboard-blob-2"></div>

        <div className="dashboard-card">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Welcome, {user.fName}! 👋</h1>
            <p className="dashboard-subtitle">You're successfully logged in</p>
          </div>

          <div className="user-info-card">
            <div className="info-row">
              <span className="info-label">
                <User size={20} />
                Full Name:
              </span>
              <span className="info-value">
                {user.fName} {user.lName}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">
                <Mail size={20} />
                Email:
              </span>
              <span className="info-value">{user.email}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            Logout
            <LogOut size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`page-transition-wrapper ${isTransitioning ? "transitioning" : ""}`}>
      {showLogin ? (
        <div key="login" className="page-content">
          <Login setUser={setUser} onSwitchToRegister={switchToRegister} />
        </div>
      ) : (
        <div key="register" className="page-content">
          <Register onSwitchToLogin={switchToLogin} />
        </div>
      )}
    </div>
  );
}

export default App;