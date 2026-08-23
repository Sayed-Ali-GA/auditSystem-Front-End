import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/UserServices";
import { useAuth } from "../../components/Authcontext/Authcontext";
import "./Login.css";

const REMEMBER_KEY = "audit_remember_identifier";

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

// An Oracle ID is always numeric (e.g. "102553"). A Store Code is not
// (e.g. "BHA-LC-1045"). This lets one field silently route to the right
// login endpoint instead of making the person pick a "login type" first.
const isOracleId = (value) => /^\d+$/.test(value);

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [identifier, setIdentifier] = useState("");
    const [Password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Restore a remembered identifier, if any.
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(REMEMBER_KEY) || "null");
            if (saved?.identifier) {
                setIdentifier(saved.identifier);
                setRememberMe(true);
            }
        } catch {
            // ignore malformed storage
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedIdentifier = identifier.trim();

        if (!trimmedIdentifier || !Password) {
            setError("Please enter your ID and password.");
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            const data = isOracleId(trimmedIdentifier)
                ? await userService.login({
                      OracleID: trimmedIdentifier,
                      Password,
                  })
                : await userService.storeLogin({
                      StoreCode: trimmedIdentifier,
                      Password,
                  });

            if (rememberMe) {
                localStorage.setItem(
                    REMEMBER_KEY,
                    JSON.stringify({ identifier: trimmedIdentifier })
                );
            } else {
                localStorage.removeItem(REMEMBER_KEY);
            }

            login(data);
            navigate("/");
        } catch (err) {
            setError(err.message || "Invalid ID or password.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <header className="navbar">
                <div className="navbar-brand">
                    <img src="images/logo.png" alt="Apparel Group" className="navbar-logo" />
                    <span className="navbar-title">Audit System</span>
                </div>
                <a href="mailto:support@auditsystem.com" className="navbar-support">
                    Need help?
                </a>
            </header>

            <div className="login-split">
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

                <div className="split-right">
                    <div className="login-form-block">
                        <div className="form-eyebrow">Restricted Access</div>
                        <h1 className="form-title">Sign in</h1>
                        <p className="form-subtitle">
                            Enter your ID and password to continue.
                        </p>

                        {error && (
                            <p className="luxury-error-alert" role="alert">
                                {error}
                            </p>
                        )}

                        <form className="luxury-form" onSubmit={handleSubmit} noValidate>
                            <div className="luxury-input-group">
                                <label className="luxury-label" htmlFor="identifier">
                                    ID
                                </label>
                                <div className="input-wrapper">
                                    <UserIcon />
                                    <input
                                        id="identifier"
                                        type="text"
                                        name="identifier"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        autoComplete="username"
                                        disabled={isSubmitting}
                                        placeholder="Oracle ID or Store Code"
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
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={isSubmitting}
                                    />
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