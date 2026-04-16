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
  const [showLanding, setShowLanding] = useState(false);

  // ✅ RESTORE SESSION (SAFE)
  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    const storedToken =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (storedUser && storedToken && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setShowLanding(false); 
      } catch (e) {
        console.error("Invalid stored user:", storedUser);
      }
    }
  }, []);


  const handleLogout = async () => {
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    await supabase.auth.signOut();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);
    setShowLanding(true);
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

  // ✅ If logged in → homepage
  if (user) {
    return <HomePage user={user} onLogout={handleLogout} />;
  }

  // ✅ Landing page
  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={() => setShowLanding(false)}
      />
    );
  }

  // ✅ Auth pages
  return (
    <div className={`page-transition-wrapper ${isTransitioning ? "transitioning" : ""}`}>
      {showLogin ? (
        <div key="login" className="page-content">
          <Login
            setUser={setUser}
            onSwitchToRegister={switchToRegister}
          />
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