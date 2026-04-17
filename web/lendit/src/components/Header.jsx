import { useNavigate, useLocation,Outlet } from "react-router-dom";
import { useState } from "react";
import { Home, BookOpen, Package, User, LogOut } from "lucide-react";
import "../css/Home.css";

const Layout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials =
    `${user?.fName?.[0] || ""}${user?.lName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div>
      {/* ✅ NAVBAR */}
      <nav className="navbar">
        <span className="nav-logo-text">LendIt</span>

        {/* NAV LINKS */}
        <div className="nav-links">
          <button
            className={`nav-link ${
              location.pathname === "/home" ? "active" : ""
            }`}
            onClick={() => navigate("/home")}
          >
            <Home size={15} /> Home
          </button>

          <button
            className={`nav-link ${
              location.pathname === "/borrow" ? "active" : ""
            }`}
            onClick={() => navigate("/borrow")}
          >
            <BookOpen size={15} /> Borrow Items
          </button>

          <button
            className={`nav-link ${
              location.pathname === "/myitems" ? "active" : ""
            }`}
            onClick={() => navigate("/myitems")}
          >
            <Package size={15} /> My Items
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="nav-right">
          <button
            className="avatar-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="avatar-img" />
            ) : (
              <span className="avatar-initials">{initials}</span>
            )}
          </button>

          {dropdownOpen && (
            <div className="dropdown">
              <div className="dropdown-header">
                <div className="dropdown-name">
                  {user?.fName} {user?.lName}
                </div>
                <div className="dropdown-email">{user?.email}</div>
              </div>

              {/* ✅ FIXED: NO window.location */}
              <button
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/profile");
                }}
              >
                <User size={15} /> Profile
              </button>

              <button
                className="dropdown-item danger"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 🔥 THIS IS IMPORTANT */}
      <div className="page-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;