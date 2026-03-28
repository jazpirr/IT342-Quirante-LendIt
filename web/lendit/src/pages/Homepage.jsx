import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  BookOpen,
  Package,
  Bell,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Info,
  LogOut,
  User,
  HandshakeIcon,
  AlertTriangle,
} from "lucide-react";
import "../css/Home.css";
import "../css/popup.css";
import ProfilePage from "./ProfilePage";
import AddItemModal from "../components/AddItemModal";

const ImgPlaceholder = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const LogoutPopup = ({ onConfirm, onCancel }) => (
  <div className="success-backdrop" onClick={onCancel}>
    <div className="success-popup" onClick={(e) => e.stopPropagation()}>
      <div className="success-icon-wrap">
        <div className="success-ring" />
        <div className="success-ring success-ring-2" />
        <div className="success-circle">
          <AlertTriangle size={36} color="white" />
        </div>
      </div>

      <h2 className="success-title">Logging Out?</h2>
      <p className="success-message">Are you sure you want to log out?</p>

      <div className="logout-popup-actions">
        <button type="button" className="logout-btn-confirm" onClick={onConfirm}>
          <LogOut size={15} /> Yes, Logout
        </button>
        <button type="button" className="logout-btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// ─── CAROUSEL COMPONENT ───
const ItemCarousel = ({ items }) => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const limited = items.slice(0, 6);
  const VISIBLE = 3;
  const maxIndex = Math.max(0, limited.length - VISIBLE);

  const go = (dir) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) =>
      dir === "next"
        ? Math.min(prev + 1, maxIndex)
        : Math.max(prev - 1, 0)
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div className="carousel-wrapper">
      {/* Prev Arrow */}
      <button
        className={`carousel-arrow carousel-arrow-left ${current === 0 ? "disabled" : ""}`}
        onClick={() => go("prev")}
        disabled={current === 0}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Sliding Track Container */}
      <div className="carousel-viewport">
        <div
          className="carousel-track-slider"
          style={{
            transform: `translateX(calc(-${current * (100 / limited.length)}%))`,
            width: `${(limited.length / VISIBLE) * 100}%`,
          }}
        >
          {limited.map((item, i) => (
            <div
              key={item.itemId}
              className="item-card carousel-card"
              style={{ width: `${100 / limited.length}%` }}
            >
              <div className="item-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="item-img" />
                ) : (
                  <ImgPlaceholder size={48} />
                )}
                <span className="item-badge">Available</span>
              </div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-owner">Owner ID: {item.ownerId}</div>
                <button className="borrow-btn">
                  <HandshakeIcon size={14} />
                  Request to Borrow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Arrow */}
      <button
        className={`carousel-arrow carousel-arrow-right ${current >= maxIndex ? "disabled" : ""}`}
        onClick={() => go("next")}
        disabled={current >= maxIndex}
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="carousel-dots">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === current ? "active" : ""}`}
            onClick={() => {
              if (isTransitioning) return;
              setIsTransitioning(true);
              setCurrent(i);
              setTimeout(() => setIsTransitioning(false), 500);
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── MAIN PAGE ───
const HomePage = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const firstName = user?.fName || "User";
  const initials = `${user?.fName?.[0] || ""}${user?.lName?.[0] || ""}`.toUpperCase() || "U";

  useEffect(() => {
    fetch("http://localhost:8080/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".nav-right")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (showProfile) {
    return <ProfilePage user={user} onBack={() => setShowProfile(false)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--green-mist)" }}>

      {/* NAVBAR */}
      <nav className="navbar">
        <span className="nav-logo-text">LendIt</span>

        <div className="nav-links">
          <button className={`nav-link ${activeNav === "home" ? "active" : ""}`} onClick={() => setActiveNav("home")}>
            <Home size={15} /> Home
          </button>
          <button className="nav-link" onClick={() => setActiveNav("borrow")}>
            <BookOpen size={15} /> Borrow Items
          </button>
          <button className="nav-link" onClick={() => setActiveNav("myitems")}>
            <Package size={15} /> My Items
          </button>
        </div>

        <div className="nav-right">
          <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {initials}
          </button>

          {dropdownOpen && (
            <div className="dropdown">
              <div className="dropdown-header">
                <div className="dropdown-name">{user?.fName} {user?.lName}</div>
                <div className="dropdown-email">{user?.email}</div>
              </div>

              <button className="dropdown-item" onClick={() => {
                setDropdownOpen(false);
                setShowProfile(true);
              }}>
                <User size={15} /> Profile
              </button>

              <button className="dropdown-item danger" onClick={() => {
                setDropdownOpen(false);
                setShowLogoutConfirm(true);
              }}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN */}
      <main className="dashboard-layout">

        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-greeting">Welcome back, {firstName}!</div>
          <div className="welcome-sub">Here's what's available to borrow today.</div>
          <div className="welcome-stats">
            <div className="welcome-stat">
              <div className="welcome-stat-num">{items.length}</div>
              <div className="welcome-stat-label">Items Listed</div>
            </div>
            <div className="welcome-stat">
              <div className="welcome-stat-num">0</div>
              <div className="welcome-stat-label">Active Borrows</div>
            </div>
          </div>
        </div>

        {/* Announcement */}
        {announcementVisible && (
          <div className="announcement-bar">
            <Info size={18} className="announcement-icon" />
            <span className="announcement-text">🎉 New items have been added! Browse and request to borrow.</span>
            <button className="announcement-close" onClick={() => setAnnouncementVisible(false)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Carousel Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recently Added Items</h2>
            <span className="section-link">View all →</span>
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>No items listed yet.</p>
            </div>
          ) : (
            <ItemCarousel items={items} />
          )}
        </div>

      </main>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAddModal(true)}>
        <Plus size={26} />
      </button>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onItemAdded={(newItem) => setItems(prev => [...prev, newItem])}
        />
      )}

      {showLogoutConfirm && (
        <LogoutPopup
          onConfirm={() => { setShowLogoutConfirm(false); onLogout(); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
};

export default HomePage;