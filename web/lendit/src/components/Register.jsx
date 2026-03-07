import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, ArrowRight } from "lucide-react";
import "../css/Auth.css";

const Register = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    const [fName, lName] = formData.name.split(" ");

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fName: fName || "",
          lName: lName || "",
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully!");
        onSwitchToLogin();
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

      <div className="glass-card register-card">
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start your journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper">
                <User size={20} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="input-field"
              />
            </div>
          </div>

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
            <span className="helper-text">At least 8 characters with letters and numbers</span>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-wrapper">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="input-field"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="toggle-password-btn"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                Create Account
                <CheckCircle size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <div className="toggle-mode">
            Already have an account?
            <span className="link-text" onClick={onSwitchToLogin}>
              Sign In
            </span>
            <ArrowRight size={16} className="inline-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;