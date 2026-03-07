import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import "../css/Auth.css";

const Login = ({ onSwitchToRegister, setUser }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
      } else {
        alert(data);
      }
    } catch (error) {
      alert("Server error. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="background-blob-1"></div>
      <div className="background-blob-2"></div>
      <div className="background-blob-3"></div>
      <div className="background-blob-4"></div>
      <div className="background-blob-5"></div>

      <div className="glass-card">
        {/* Logo with glow effect */}
        <div className="logo-container">
          <div className="logo-glow"></div>
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" className="leaf-icon">
              <path
                d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* Accent bar */}
        <div className="accent-bar"></div>

        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Ready to continue your journey?</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper">
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper">
                <Lock size={20} />
              </div>
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
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="forgot-password-wrapper">
            <a href="#" className="forgot-password-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                Login
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <div className="toggle-mode">
            Don't have an account?
            <span className="link-text" onClick={onSwitchToRegister}>
              Sign Up
            </span>
            <ArrowRight size={16} className="inline-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;