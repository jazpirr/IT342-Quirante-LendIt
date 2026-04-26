import React, { useState, useEffect, useRef } from "react";
import { useNavigate,useLocation  } from "react-router-dom";
import {
  Home, BookOpen, Package, Plus, X, Info,
  LogOut, User, HandshakeIcon, AlertTriangle, Search
} from "lucide-react";
import "../css/Home.css";
import "../css/popup.css";
import ProfilePage from "./ProfilePage";
import AddItemModal from "../components/AddItemModal";
import ItemViewModal from "../components/ItemViewModal";
import MyItems from "./MyItems";

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

const HomePage = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBarSticky, setSearchBarSticky] = useState(false);
  const [myItems, setMyItems] = useState([]);

  const searchSectionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const firstName = user?.fName || "User";
  const initials = `${user?.fName?.[0] || ""}${user?.lName?.[0] || ""}`.toUpperCase() || "U";

  useEffect(() => {
    fetch("http://localhost:8080/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (searchSectionRef.current) {
        const rect = searchSectionRef.current.getBoundingClientRect();
        setSearchBarSticky(rect.top <= 64);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".nav-right")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/api/items/my", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setMyItems(data))
      .catch(err => console.error(err));
  }, []);
  const myTotal = myItems.length;
  const myAvailable = myItems.filter(i => i.availability === "AVAILABLE").length;
  const myBorrowed = myItems.filter(i => i.availability !== "AVAILABLE").length;

  const filteredItems = items.filter(item =>
    item.ownerId !== user?.id &&
    item.availability === "AVAILABLE" &&   // ✅ ADD THIS
    (
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleBorrow = async (item, returnDate) => {
    try {
      const token = localStorage.getItem("token");

      if (!returnDate) {
        alert("Please select a return date");
        return;
      }

      const res = await fetch("http://localhost:8080/api/requests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: item.itemId,
          returnDate: returnDate
        })
      });

      if (!res.ok) throw new Error("Failed request");

      alert("Request sent!");
    } catch (err) {
      console.error(err);
      alert("Error sending request");
    }
  };

  if (showProfile) {
    return <ProfilePage user={user} onBack={() => setShowProfile(false)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--green-mist)" }}>


      {/* STICKY SEARCH BAR */}
      {searchBarSticky && (
        <div className="sticky-search-bar">
          <div className="sticky-search-inner">
            <Search size={16} className="sticky-search-icon" />
            <input
              className="sticky-search-input"
              placeholder="Search items to borrow..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button className="sticky-search-clear" onClick={() => setSearchQuery("")}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="dashboard-layout">
          <>
            {/* Welcome Banner */}
            <div className="welcome-banner">
              <div className="welcome-greeting">Welcome back, {firstName}!</div>
              <div className="welcome-sub">Here's what's available to borrow today.</div>
              <div className="welcome-stats">
                <div className="welcome-stats">
                  <div className="welcome-stat">
                    <div className="welcome-stat-num">{myTotal}</div>
                    <div className="welcome-stat-label">Your Items</div>
                  </div>

                  <div className="welcome-stat">
                    <div className="welcome-stat-num">{myAvailable}</div>
                    <div className="welcome-stat-label">Available</div>
                  </div>

                  <div className="welcome-stat">
                    <div className="welcome-stat-num">{myBorrowed}</div>
                    <div className="welcome-stat-label">Borrowed</div>
                  </div>
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

            {/* Search Section */}
            <div ref={searchSectionRef} className="search-section">
              <div className="search-bar-inline">
                <Search size={16} className="search-icon-inline" />
                <input
                  className="search-input-inline"
                  placeholder="Search items to borrow..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="search-clear-inline" onClick={() => setSearchQuery("")}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Items Grid */}
            <div className="section">
              <div className="section-header">
                <h2 className="section-title">
                  {searchQuery ? `Results for "${searchQuery}"` : "Available Items"}
                </h2>
                <span className="section-count">
                  {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{searchQuery ? "🔍" : "📦"}</div>
                  <p>{searchQuery ? "No items match your search." : "No items listed yet."}</p>
                </div>
              ) : (
                <div className="items-grid">
                  {filteredItems.map((item, i) => (
                    <div
                      key={item.itemId}
                      className="item-card"
                      style={{ animationDelay: `${i * 0.06}s` }}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="item-image">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="item-img" />
                        ) : (
                          <ImgPlaceholder size={48} />
                        )}
                        <span className="item-badge">
                          {item.availability === "AVAILABLE" ? "Available" : "Borrowed"}
                        </span>
                      </div>
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-owner">Owner ID: {item.ownerId}</div>
                        <button className="borrow-btn" onClick={e => { e.stopPropagation(); setSelectedItem(item); }}>
                          <HandshakeIcon size={14} /> Request to Borrow
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
      </main>


      {selectedItem && (
        <ItemViewModal
          item={selectedItem}
          user={user}
          onClose={() => setSelectedItem(null)}
          onBorrow={handleBorrow}
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