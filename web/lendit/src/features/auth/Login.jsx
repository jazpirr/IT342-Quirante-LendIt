import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import "./Auth.css";
import SuccessPopup from "../../shared/components/SuccessPopup";
import { supabase } from "../../lib/supabase";

// ── LendIt Logo SVG ──
const LendItLogo = () => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <rect width="36" height="36" rx="10" fill="url(#authLg1)"/>
    <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5 20.5 H22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
    <circle cx="26" cy="12" r="3.5" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.5"/>
  </svg>
);

// ── Google Icon ──
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25..." fill="#4285F4"/>
  </svg>
);

const Login = ({ onSwitchToRegister, setUser, onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const navigate = useNavigate();

  const googleHandled = useRef(false);


  // ✅ GOOGLE LOGIN FLOW
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (event !== "SIGNED_IN") return;
        if (!session?.user) return;

        // ✅ THIS LINE FIXES YOUR ISSUE
        if (!session.provider_token) return;

        if (googleHandled.current) return;

        googleHandled.current = true;

        try {
          const res = await fetch("http://localhost:8080/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.user_metadata.full_name,
              imageUrl: session.user.user_metadata.avatar_url
            })
          });

          const data = await res.json();

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          setUser(data.user);

          // ✅ FORCE REDIRECT (VERY IMPORTANT)
          navigate("/home");

        } catch (err) {
          console.error(err);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [setUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/login"
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await response.text();

      if (!text || text === "undefined") return;

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        alert(text);
        return;
      }

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setPendingUser(data.user);
        setShowSuccess(true);
      } else {
        alert(data);
      }

    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="background-blob-1" />
      <div className="background-blob-2" />
      <div className="background-blob-3" />
      <div className="background-blob-4" />
      <div className="background-blob-5" />

      <div className="glass-card">

        {/* Back */}
        {onBack && (
          <button className="auth-back-btn" onClick={onBack}>
            Back
          </button>
        )}

        {/* Logo */}
        <div className="logo-container">
          <div className="logo-icon-box">
            <LendItLogo />
          </div>
          <span className="auth-logo-wordmark">LendIt</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Ready to continue your journey?</p>
        </div>

        {/* ✅ FORM (RESTORED UI) */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper"><Mail size={18} /></div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper"><Lock size={18} /></div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="input-field"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-btn"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="loading-spinner" /> : <>Login <ArrowRight size={18} /></>}
          </button>
        </form>

        {/* Google */}
        <button className="google-btn" onClick={handleGoogleLogin}>
          {googleLoading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>

      {/* SUCCESS */}
      {showSuccess && (
        <SuccessPopup
          title="Welcome Back!"
          message="You've successfully logged in."
          onClose={() => {
            setShowSuccess(false);
            setUser(pendingUser);
          }}
        />
      )}

    </div>
  );
};

export default Login;
