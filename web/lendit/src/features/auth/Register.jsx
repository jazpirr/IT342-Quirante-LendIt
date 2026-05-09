import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, ArrowRight, Phone } from "lucide-react";
import "./Auth.css";
import SuccessPopup from "../../shared/components/SuccessPopup";
import { supabase } from "../../lib/supabase";

const LendItLogo = () => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <rect width="36" height="36" rx="10" fill="url(#authLg2)"/>
    <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5 20.5 H22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
    <circle cx="26" cy="12" r="3.5" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="1.5"/>
    <defs>
      <linearGradient id="authLg2" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#097969"/>
        <stop offset="1" stopColor="#5F9EA0"/>
      </linearGradient>
    </defs>
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Register = ({ onSwitchToLogin, onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name, phone: formData.phone } },
      });
      if (error) alert(error.message);
      else setShowSuccess(true);
    } catch (err) {
      alert("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) { alert("Google sign up failed"); setGoogleLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="background-blob-1" />
      <div className="background-blob-2" />
      <div className="background-blob-3" />
      <div className="background-blob-4" />
      <div className="background-blob-5" />

      <div className="glass-card register-card">
        {onBack && (
          <button className="auth-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        )}

        <div className="logo-container">
          <div className="logo-glow" />
          <div className="logo-icon-box"><LendItLogo /></div>
          <span className="auth-logo-wordmark">LendIt</span>
        </div>

        <div className="accent-bar" />

        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start your journey today</p>
        </div>

        {/* Google first — top position */}
        <button className="google-btn" onClick={handleGoogleRegister} disabled={googleLoading} type="button" style={{marginBottom:"18px"}}>
          <GoogleIcon />
          <span>{googleLoading ? "Redirecting..." : "Continue with Google"}</span>
        </button>

        <div className="auth-divider" style={{marginBottom:"18px"}}>
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or register with email</span>
          <span className="auth-divider-line" />
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper"><User size={18} /></div>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="input-field" />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper"><Mail size={18} /></div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" required className="input-field" />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper"><Phone size={18} /></div>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required className="input-field" />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper"><Lock size={18} /></div>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="input-field" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-password-btn">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper"><Lock size={18} /></div>
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required className="input-field" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="toggle-password-btn">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="loading-spinner" /> : <><span>Create Account</span><CheckCircle size={18} /></>}
          </button>
        </form>

        <div className="auth-links">
          <div className="toggle-mode">
            Already have an account?
            <span className="link-text" onClick={onSwitchToLogin}>Sign In</span>
            <ArrowRight size={16} className="inline-arrow" />
          </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessPopup
          title="Check Your Email!"
          message="A verification link has been sent. Please verify your account before logging in."
          onClose={() => { setShowSuccess(false); onSwitchToLogin(); }}
        />
      )}
    </div>
  );
};

export default Register;
