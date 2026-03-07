import React, { useState } from "react";
import {
  Home,
  BookOpen,
  Package,
  Bell,
  ChevronRight,
  Plus,
  X,
  Info,
  LogOut,
  User,
  HandshakeIcon,
  AlertTriangle,
} from "lucide-react";
import "../css/Home.css";

// ── Placeholder image component ──
const ImgPlaceholder = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

// ── Logout Confirmation Popup ──
const LogoutPopup = ({ onConfirm, onCancel }) => (
  <div className="success-backdrop" onClick={onCancel}>
    <div className="success-popup" onClick={(e) => e.stopPropagation()}>

      {/* Warning icon */}
      <div className="success-icon-wrap">
        <div className="success-ring"></div>
        <div className="success-ring success-ring-2"></div>
        <div
          className="success-circle"
          style={{ background: "linear-gradient(135deg, #dc2626, #f97316)" }}
        >
          <AlertTriangle size={36} color="white" />
        </div>
      </div>

      <h2 className="success-title">Logging Out?</h2>
      <p className="success-message">
        Are you sure you want to log out of your account?
      </p>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          className="success-btn"
          style={{
            background: "linear-gradient(135deg, #dc2626, #f97316)",
            boxShadow: "0 6px 20px rgba(220,38,38,0.3)",
          }}
          onClick={onConfirm}
        >
          Yes, Logout
        </button>
        <button
          className="success-btn"
          style={{
            background: "linear-gradient(135deg, #097969, #5F9EA0)",
            boxShadow: "0 6px 20px rgba(9,121,105,0.3)",
          }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const HomePage = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Mock data — replace with real API calls
  const recentItems = [
    { id: 1, name: "Canon EOS R50", owner: "by Maria Santos", category: "Electronics" },
    { id: 2, name: "Acoustic Guitar", owner: "by Juan Dela Cruz", category: "Music" },
    { id: 3, name: "Camping Tent", owner: "by Ana Reyes", category: "Outdoors" },
  ];

  const requests = [
    { id: 1, name: "DSLR Camera", meta: "Requested 2 days ago", status: "pending" },
    { id: 2, name: "Projector", meta: "Requested 5 days ago", status: "active" },
  ];

  const myItems = [
    { id: 1, name: "Mountain Bike", meta: "Listed 1 week ago", status: "active" },
    { id: 2, name: "Power Drill", meta: "Listed 2 weeks ago", status: "pending" },
  ];

  const firstName = user?.fName || "User";
  const initials = `${user?.fName?.[0] || ""}${user?.lName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div style={{ minHeight: "100vh", background: "var(--green-mist)" }}>

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <a className="nav-logo" href="#">
          <div className="nav-logo-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
          </div>
          <span className="nav-logo-text">LendIt</span>
        </a>

        <div className="nav-links">
          {[
            { key: "home", label: "Home", icon: <Home size={15} /> },
            { key: "borrow", label: "Borrow Items", icon: <BookOpen size={15} /> },
            { key: "my-items", label: "My Items", icon: <Package size={15} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              className={`nav-link ${activeNav === key ? "active" : ""}`}
              onClick={() => setActiveNav(key)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="nav-right">
          <button className="nav-icon-btn">
            <Bell size={18} />
            <span className="notif-dot"></span>
          </button>

          <button
            className="avatar-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="dropdown">
              <div className="dropdown-header">
                <div className="dropdown-name">{user?.fName} {user?.lName}</div>
                <div className="dropdown-email">{user?.email}</div>
              </div>
              <button className="dropdown-item">
                <User size={15} /> Profile
              </button>
              <button
                className="dropdown-item danger"
                onClick={() => {
                  setDropdownOpen(false);
                  setShowLogoutConfirm(true);
                }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="dashboard-layout">

        {/* Welcome Banner */}
        <div className="welcome-banner">
          <h1 className="welcome-greeting">Welcome back, {firstName}! 👋</h1>
          <p className="welcome-sub">Here's what's happening in your community today.</p>
          <div className="welcome-stats">
            <div className="welcome-stat">
              <div className="welcome-stat-num">12</div>
              <div className="welcome-stat-label">Items Near You</div>
            </div>
            <div className="welcome-stat">
              <div className="welcome-stat-num">2</div>
              <div className="welcome-stat-label">Active Borrows</div>
            </div>
            <div className="welcome-stat">
              <div className="welcome-stat-num">5</div>
              <div className="welcome-stat-label">My Listed Items</div>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        {announcementVisible && (
          <div className="announcement-bar">
            <Info size={18} className="announcement-icon" />
            <span className="announcement-text">
              🎉 New items added in your area! Browse recently added items below.
            </span>
            <button
              className="announcement-close"
              onClick={() => setAnnouncementVisible(false)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Recently Added Items */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recently Added Items</h2>
            <a className="section-link" href="#">View all →</a>
          </div>
          <div className="items-grid">
            {recentItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-image">
                  <span className="item-image-placeholder">
                    <ImgPlaceholder size={48} />
                  </span>
                  <span className="item-badge">{item.category}</span>
                </div>
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-owner">{item.owner}</div>
                  <button className="borrow-btn">
                    <HandshakeIcon size={14} />
                    Request to Borrow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Two-Column Grid */}
        <div className="bottom-grid">

          {/* Requests */}
          <div className="list-card">
            <div className="section-header" style={{ marginBottom: "4px" }}>
              <h2 className="section-title">Requests</h2>
              <a className="section-link" href="#">See all →</a>
            </div>
            {requests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📬</div>
                <p>No requests yet</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="list-item">
                  <div className="list-thumb">
                    <ImgPlaceholder size={28} />
                  </div>
                  <div className="list-content">
                    <div className="list-item-name">{req.name}</div>
                    <div className="list-item-meta">{req.meta}</div>
                  </div>
                  <span className={`list-item-status status-${req.status}`}>
                    {req.status}
                  </span>
                  <ChevronRight size={16} className="list-chevron" />
                </div>
              ))
            )}
          </div>

          {/* My Items */}
          <div className="list-card">
            <div className="section-header" style={{ marginBottom: "4px" }}>
              <h2 className="section-title">Your Items</h2>
              <a className="section-link" href="#">See all →</a>
            </div>
            {myItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p>No items listed yet</p>
              </div>
            ) : (
              myItems.map((item) => (
                <div key={item.id} className="list-item">
                  <div className="list-thumb">
                    <ImgPlaceholder size={28} />
                  </div>
                  <div className="list-content">
                    <div className="list-item-name">{item.name}</div>
                    <div className="list-item-meta">{item.meta}</div>
                  </div>
                  <span className={`list-item-status status-${item.status}`}>
                    {item.status}
                  </span>
                  <ChevronRight size={16} className="list-chevron" />
                </div>
              ))
            )}
          </div>

        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fab" title="List a new item">
        <Plus size={26} />
      </button>

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => setDropdownOpen(false)}
        />
      )}

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <LogoutPopup
          onConfirm={() => {
            setShowLogoutConfirm(false);
            onLogout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

    </div>
  );
};

export default HomePage;