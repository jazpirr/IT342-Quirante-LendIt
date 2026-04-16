import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/Homepage";
import LandingPage from "./pages/Landingpage";
import ProfilePage from "./pages/ProfilePage";

import { supabase } from "./lib/supabase";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore session
  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    const storedToken =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (storedUser && storedToken && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Invalid stored user:", storedUser);
      }
    }

    setLoading(false); // ✅ VERY IMPORTANT
  }, []);


  // ✅ Listen for Google login
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN") {
          console.log("Google login detected");

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
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    await supabase.auth.signOut();

    localStorage.clear();
    sessionStorage.clear();

    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>

      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/home"
        element={
          user ? (
            <HomePage user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={
          user ? (
            <ProfilePage user={user} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

    </Routes>
  );
}

export default App;