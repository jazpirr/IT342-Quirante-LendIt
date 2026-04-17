import { Routes, Route, use, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/Homepage";
import LandingPage from "./pages/Landingpage";
import ProfilePage from "./pages/ProfilePage";
import BorrowItems from "./pages/BorrowItems";

import { supabase } from "./lib/supabase";
import MyItems from "./pages/MyItems";
import Layout from "./components/Header";

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

      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/register" element={<Register />} />

      {/* 🔥 WRAP PROTECTED ROUTES */}
      <Route element={<Layout user={user} onLogout={handleLogout} />}>

        <Route
          path="/home"
          element={user ? <HomePage user={user} /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile"
          element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />}
        />

        <Route
          path="/borrow"
          element={user ? <BorrowItems /> : <Navigate to="/login" />}
        />

        <Route
          path="/myitems"
          element={user ? <MyItems /> : <Navigate to="/login" />}
        />

      </Route>

    </Routes>
  );
}

export default App;