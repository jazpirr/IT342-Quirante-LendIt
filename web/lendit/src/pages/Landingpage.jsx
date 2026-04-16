import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/LandingPage.css";

// Soft pastel colors for item placeholders (like image 2)
const PLACEHOLDER_COLORS = [
  "#A8E6CF", // mint green
  "#AED6F1", // soft blue
  "#FAD7A0", // warm yellow
  "#F9A8D4", // soft pink
  "#C8B6E2", // lavender
  "#B2DFDB", // teal
  "#FFCCBC", // peach
  "#D7CCC8", // warm grey
];

const DISTANCES = ["0.2km away", "0.5km away", "1km away", "1.2km away", "0.8km away"];

const LandingPage = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  // Auto-scroll through items 3 at a time
  useEffect(() => {
    if (items.length <= 3) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 3;
        return next >= items.length ? 0 : next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [items.length]);

  const displayItems = items.length > 0
    ? items.slice(currentIndex, currentIndex + 3).concat(
        currentIndex + 3 > items.length
          ? items.slice(0, (currentIndex + 3) % items.length)
          : []
      ).slice(0, 3)
    : [];

  return (
    <div className="landing-root">
      {/* NAV */}
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-mark">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="10" fill="url(#lg1)" />
                <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.5 20.5 H22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
                <circle cx="26" cy="12" r="3.5" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.5" />
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#097969" />
                    <stop offset="1" stopColor="#5F9EA0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="landing-logo-text">LendIt</span>
          </div>

          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how" className="landing-nav-link">How it Works</a>
          </div>

          <div className="landing-nav-actions">
            <button className="landing-btn-ghost" onClick={() => navigate("/login")}>
              Log in
            </button>
            <button className="landing-btn-primary" onClick={onGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero">
        <div className="hero-bg-orb orb-1" />
        <div className="hero-bg-orb orb-2" />
        <div className="hero-bg-orb orb-3" />
        <div className="hero-grid-lines" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Community Borrowing Platform
          </div>

          <h1 className="hero-title">
            Borrow what you need.<br />
            <span className="hero-title-accent">Lend what you have.</span>
          </h1>

          <p className="hero-sub">
            LendIt connects students to share items — so you never have to buy something you'll only use once.
          </p>

          <div className="hero-actions">
            <button className="landing-btn-primary hero-cta" onClick={onGetStarted}>
              Start Borrowing Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="hero-btn-secondary" onClick={onGetStarted}>
              Browse Items
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">test</span>
              <span className="hero-stat-label">Items Listed</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">test</span>
              <span className="hero-stat-label">Active Users</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">test</span>
              <span className="hero-stat-label">Happy Borrows</span>
            </div>
          </div>
        </div>

        {/* Floating item cards — each is its own card, no outer panel */}
        <div className="floating-cards-list">
          {displayItems.map((item, index) => {
            const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
            const distance = DISTANCES[index % DISTANCES.length];
            return (
              <div
                key={item.itemId}
                className="fp-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="fp-thumb" style={{ background: color }} />
                <div className="fp-info">
                  <div className="fp-name">{item.name}</div>
                  <div className="fp-meta">Available · {distance}</div>
                </div>
                <div className="fp-badge">Free</div>
              </div>
            );
          })}

          {items.length > 3 && (
            <div className="fp-dots">
              {Array.from({ length: Math.ceil(items.length / 3) }).map((_, i) => (
                <span
                  key={i}
                  className={`fp-dot ${Math.floor(currentIndex / 3) === i ? "active" : ""}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-section" id="how">
        <div className="landing-section-inner">
          <div className="section-label">Simple Process</div>
          <h2 className="section-heading">How LendIt Works</h2>
          <p className="section-sub">Three steps to borrow anything from your community</p>

          <div className="how-grid">
            {[
              { num: "01", icon: "🔍", title: "Browse Items", desc: "Explore items listed by people in your community. Filter by category or distance." },
              { num: "02", icon: "🤝", title: "Request to Borrow", desc: "Send a borrow request to the owner. They'll confirm availability and arrange pickup." },
              { num: "03", icon: "📦", title: "Return & Review", desc: "Use the item and return it on time. Leave a review to build community trust." },
            ].map((step) => (
              <div className="how-card" key={step.num}>
                <div className="how-num">{step.num}</div>
                <div className="how-icon">{step.icon}</div>
                <h3 className="how-title">{step.title}</h3>
                <p className="how-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-section landing-section-alt" id="features">
        <div className="landing-section-inner">
          <div className="section-label">Why LendIt</div>
          <h2 className="section-heading">Everything you need to share</h2>

          <div className="features-grid">
            {[
              { icon: "🛡️", title: "Trusted Community", desc: "Verified profiles and ratings keep every transaction safe." },
              { icon: "⚡", title: "Instant Requests", desc: "Send and receive borrow requests in seconds." },
              { icon: "🌿", title: "Eco Friendly", desc: "Reduce waste by sharing instead of buying new." },
              { icon: "📍", title: "Nearby First", desc: "Find items close to you — no long trips needed." },
              { icon: "💬", title: "In-App Chat", desc: "Coordinate pickups and returns right in the app." },
              { icon: "🎁", title: "Always Free", desc: "Borrowing on LendIt is completely free for everyone." },
            ].map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta-section">
        <div className="cta-orb" />
        <h2 className="cta-heading">Ready to start sharing?</h2>
        <p className="cta-sub">Join hundreds of community members already using LendIt.</p>
        <button className="landing-btn-primary hero-cta cta-btn" onClick={onGetStarted}>
          Create Free Account
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-logo" style={{ justifyContent: "center", marginBottom: "8px" }}>
          <div className="landing-logo-mark" style={{ width: 28, height: 28 }}>
            <svg viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="url(#lg2)" />
              <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.5 20.5 H22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="26" cy="12" r="3.5" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.5" />
              <defs>
                <linearGradient id="lg2" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#097969" />
                  <stop offset="1" stopColor="#5F9EA0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="landing-logo-text" style={{ fontSize: 18 }}>LendIt</span>
        </div>
        <p className="footer-copy">© 2026 LendIt. Made with 💚 for communities.</p>
      </footer>
    </div>
  );
};

export default LandingPage;