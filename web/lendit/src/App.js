import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./components/Homepage";
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
    return <HomePage user={user} onLogout={handleLogout} />;
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