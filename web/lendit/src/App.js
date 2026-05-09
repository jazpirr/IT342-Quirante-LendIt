import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import HomePage from "./features/home/Homepage";
import LandingPage from "./features/auth/Landingpage";
import ProfilePage from "./features/profile/ProfilePage";
import BorrowItems from "./features/borrow/BorrowItems";
import AdminDashboard from "./features/admin/AdminDashboard";
import MyItems from "./features/items/MyItems";
import Layout from "./shared/components/Header";

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

      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/register" element={<Register />} />

      {/* Admin — standalone, no regular layout */}
      <Route
        path="/admin"
        element={
          user?.role === "ADMIN"
            ? <AdminDashboard user={user} onLogout={handleLogout} />
            : <Navigate to={user ? "/home" : "/login"} />
        }
      />

      {/* 🔥 WRAP PROTECTED ROUTES */}
      <Route element={<Layout user={user} onLogout={handleLogout} />}>

        <Route
          path="/home"
          element={
            !user ? <Navigate to="/login" /> :
            user.role === "ADMIN" ? <Navigate to="/admin" /> :
            <HomePage user={user} />
          }
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
