import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";
import { Home, BookOpen, Package, User, LogOut, Plus } from "lucide-react";
import ChatWidget from "../../features/chat/ChatWidget";
import "../css/Home.css";
import AddItemModal from "../../features/items/AddItemModal";

// ── Inline SVG logo component ──
const LendItLogo = () => (
  <svg
    width="148" height="36"
    viewBox="-6 0 148 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: "visible" }}
  >
    <style>{`
      .p1 { animation: floatA 3s   ease-in-out infinite 0s;   }
      .p2 { animation: floatB 3.4s ease-in-out infinite 0.3s; }
      .p3 { animation: floatA 2.8s ease-in-out infinite 0.6s; }
      .p4 { animation: floatB 3.2s ease-in-out infinite 0.1s; }
      .p5 { animation: floatA 3.6s ease-in-out infinite 0.4s; }
      .p6 { animation: floatB 2.9s ease-in-out infinite 0.7s; }
      .p7 { animation: floatA 3.1s ease-in-out infinite 0.2s; }
      @keyframes floatA {
        0%,100% { transform: translateY(0px);  opacity: 0.9; }
        50%      { transform: translateY(-3px); opacity: 0.5; }
      }
      @keyframes floatB {
        0%,100% { transform: translateY(0px);  opacity: 0.6; }
        50%      { transform: translateY(3px);  opacity: 0.3; }
      }
    `}</style>

    {/* particles left */}
    <circle className="p1" cx="10" cy="8"  r="3.2" fill="#AFEFAF"/>
    <circle className="p2" cx="3"  cy="18" r="2"   fill="#5F9EA0"/>
    <circle className="p3" cx="9"  cy="27" r="1.5" fill="#AFEFAF"/>
    <circle className="p4" cx="2"  cy="29" r="2.5" fill="#097969" opacity="0.3"/>

    {/* particles right */}
    <circle className="p5" cx="47" cy="7"  r="2.5" fill="#AFEFAF"/>
    <circle className="p6" cx="53" cy="18" r="1.8" fill="#5F9EA0"/>
    <circle className="p7" cx="46" cy="28" r="2"   fill="#AFEFAF"/>

    {/* arc — static, no animation */}
    <circle cx="27" cy="18" r="14" fill="none" stroke="#E8F5E9" strokeWidth="4"/>
    <path d="M27 4 A14 14 0 1 1 13 25"
          fill="none" stroke="#097969" strokeWidth="4" strokeLinecap="round"/>
    <path d="M13 25 L7 33 L17 30 Z" fill="#097969"/>

    {/* wordmark */}
    <text x="50" y="25"
          fontFamily="'Fraunces', Georgia, serif"
          fontWeight="900" fontSize="24" letterSpacing="-0.5">
      <tspan fill="#097969">Lend</tspan>
      <tspan fill="#4A6A5E">It</tspan>
    </text>
  </svg>
);

const Layout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const initials =
    `${user?.fName?.[0] || ""}${user?.lName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div>
      <nav className="navbar">

        {/* LOGO */}
        <button
          className="nav-logo"
          onClick={() => navigate("/home")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <LendItLogo />
        </button>

        {/* NAV LINKS */}
        <div className="nav-links">
          <button
            className={`nav-link ${location.pathname === "/home" ? "active" : ""}`}
            onClick={() => navigate("/home")}
          >
            <Home size={15} /> Home
          </button>
          <button
            className={`nav-link ${location.pathname === "/borrow" ? "active" : ""}`}
            onClick={() => navigate("/borrow")}
          >
            <BookOpen size={15} /> Borrow Items
          </button>
          <button
            className={`nav-link ${location.pathname === "/myitems" ? "active" : ""}`}
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
                <div className="dropdown-name">{user?.fName} {user?.lName}</div>
                <div className="dropdown-email">{user?.email}</div>
              </div>
              <button
                className="dropdown-item"
                onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
              >
                <User size={15} /> Profile
              </button>
              <button
                className="dropdown-item danger"
                onClick={() => { setDropdownOpen(false); onLogout(); }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="page-content">
        <Outlet />
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAddModal(true)}>
        <Plus size={26} />
      </button>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
        />
      )}

      <ChatWidget user={user} />
    </div>
  );
};

export default Layout;
