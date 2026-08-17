import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/UserServices";
import { useAuth } from "../../components/Authcontext/Authcontext";
import "./Login.css";

/* Small inline icons — no external icon font dependency */
const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" strokeLinecap="round" />
    </svg>
);

const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="10.5" width="14" height="9.5" rx="1.5" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [OracleID, setOracleID] = useState("");
    const [Password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!OracleID.trim() || !Password) {
            setError("Please enter your Oracle ID and password.");
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            const data = await userService.login({
                OracleID,
                Password,
            });
            login(data);
            navigate("/");
        } catch (err) {
            setError(err.message || "Failed to log in.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            {/* Top navbar */}
            <header className="navbar">
                <div className="navbar-brand">
                    <img src="images/logo.png" alt="Apparel Group" className="navbar-logo" />
                    <span className="navbar-title">Audit System</span>
                </div>
                <a href="mailto:support@auditsystem.com" className="navbar-support">
                    Need help?
                </a>
            </header>

            {/* 50/50 split */}
            <div className="login-split">
                {/* Left: the company, presented clearly */}
                <div className="split-left">
                    <div className="left-content">
                        <div className="left-logo-plate">
                            <img src="images/logo.png" alt="Apparel Group" className="left-logo" />
                        </div>
                        <p className="left-tagline">
                            Performance &amp; Corporate Compliance Management System
                        </p>
                    </div>
                </div>

                {/* Right: the form */}
                <div className="split-right">
                    <div className="login-form-block">
                        <div className="form-eyebrow">Restricted Access</div>
                        <h1 className="form-title">Sign in</h1>
                        <p className="form-subtitle">
                            Enter your Oracle ID and password to continue.
                        </p>

                        {error && (
                            <p className="luxury-error-alert" role="alert">
                                {error}
                            </p>
                        )}

                        <form className="luxury-form" onSubmit={handleSubmit} noValidate>
                            <div className="luxury-input-group">
                                <label className="luxury-label" htmlFor="OracleID">
                                    Oracle ID
                                </label>
                                <div className="input-wrapper">
                                    <UserIcon />
                                    <input
                                        id="OracleID"
                                        type="text"
                                        name="OracleID"
                                        value={OracleID}
                                        onChange={(e) => setOracleID(e.target.value)}
                                        autoComplete="username"
                                        disabled={isSubmitting}
                                        placeholder="Enter your ID"
                                        className="luxury-input"
                                    />
                                </div>
                            </div>

                            <div className="luxury-input-group">
                                <label className="luxury-label" htmlFor="Password">
                                    Password
                                </label>
                                <div className="input-wrapper">
                                    <LockIcon />
                                    <input
                                        id="Password"
                                        type="password"
                                        name="Password"
                                        value={Password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        disabled={isSubmitting}
                                        placeholder="••••••••"
                                        className="luxury-input"
                                    />
                                </div>
                            </div>

                            <div className="form-footer-actions">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span>Remember me</span>
                                </label>
                                <a href="mailto:support@auditsystem.com" className="forgot-password">
                                    Forgot password?
                                </a>
                            </div>

                            <button type="submit" className="luxury-submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Authorizing...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </button>

                            <p className="login-copyright">
                                © {new Date().getFullYear()} Apparel Group. All rights reserved.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;