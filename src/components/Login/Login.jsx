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

const StoreIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 9l1-5h14l1 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9v10h14V9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 19v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
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

    // "employee" = دخول شخصي بالـ Oracle ID
    // "store"    = دخول حساب متجر بالـ Store Code (لا يتأثر بتغيير المدير)
    const [loginMode, setLoginMode] = useState("employee");

    const [identifier, setIdentifier] = useState(""); // Oracle ID أو Store Code
    const [Password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const switchMode = (mode) => {
        setLoginMode(mode);
        setIdentifier("");
        setPassword("");
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!identifier.trim() || !Password) {
            setError(
                loginMode === "store"
                    ? "Please enter the Store Code and password."
                    : "Please enter your Oracle ID and password."
            );
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            const data =
                loginMode === "store"
                    ? await userService.storeLogin({
                          StoreCode: identifier.trim(),
                          Password,
                      })
                    : await userService.login({
                          OracleID: identifier.trim(),
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
                            {loginMode === "store"
                                ? "Enter the store code and its login password."
                                : "Enter your Oracle ID and password to continue."}
                        </p>

                        {/* Login mode switch */}
                        <div className="login-mode-switch" role="tablist">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={loginMode === "employee"}
                                className={`login-mode-btn ${loginMode === "employee" ? "active" : ""}`}
                                onClick={() => switchMode("employee")}
                                disabled={isSubmitting}
                            >
                                <UserIcon />
                                Employee Login
                            </button>

                            <button
                                type="button"
                                role="tab"
                                aria-selected={loginMode === "store"}
                                className={`login-mode-btn ${loginMode === "store" ? "active" : ""}`}
                                onClick={() => switchMode("store")}
                                disabled={isSubmitting}
                            >
                                <StoreIcon />
                                Store Login
                            </button>
                        </div>

                        {error && (
                            <p className="luxury-error-alert" role="alert">
                                {error}
                            </p>
                        )}

                        <form className="luxury-form" onSubmit={handleSubmit} noValidate>
                            <div className="luxury-input-group">
                                <label className="luxury-label" htmlFor="identifier">
                                    {loginMode === "store" ? "Store Code" : "Oracle ID"}
                                </label>
                                <div className="input-wrapper">
                                    {loginMode === "store" ? <StoreIcon /> : <UserIcon />}
                                    <input
                                        id="identifier"
                                        type="text"
                                        name="identifier"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        autoComplete="username"
                                        disabled={isSubmitting}
                                        placeholder={
                                            loginMode === "store"
                                                ? "e.g. BHA-LC-1045"
                                                : "Enter your ID"
                                        }
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