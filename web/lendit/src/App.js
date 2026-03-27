import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/Homepage";
import LandingPage from "./pages/Landingpage";
import "./css/PageTransition.css";
import { supabase } from "./lib/supabase";

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // Check session on load
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        // send to backend
        const res = await fetch("http://localhost:8080/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.user.email,
            name: data.user.user_metadata.full_name,
          }),
        });

        const backendUser = await res.json();
        setUser(backendUser.user);
        localStorage.setItem("token", backendUser.token);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    await supabase.auth.signOut(); // optional but clean
    localStorage.removeItem("token"); // 🔥 critical

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

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
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