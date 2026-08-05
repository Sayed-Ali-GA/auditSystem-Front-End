import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/UserServices";
import { useAuth } from "../../components/Authcontext/Authcontext";
import "./LoginLuxury.css"; 


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
                Password 
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
        <div className="login-luxury-container">
            {/* Left Side: Visual Elements & Info */}
            <div className="login-luxury-visual">
                <div className="visual-overlay">
                    <div className="brand--info">
                        <img src='images/logo.png' alt="Audit System Logo" className="large-brand-logo" width="50%" />
                        <h2 className="brand-title">Audit<span className="highlight"> System</span></h2>
                        <p className="brand-subtitle">Performance & Corporate Compliance Management System</p>
                    </div>
                    <div className="floating-elements">
                        <div className="dot-grid"></div>
                        <div className="glow-orb"></div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="login-luxury-form-section">
                <form className="luxury-form" onSubmit={handleSubmit} noValidate>
                    
                    <div className="form-header">
                        <h1 className="luxury-welcome-title">Welcome Back</h1>
                        <p className="luxury-welcome-subtitle">Sign in to continue to Audit System</p>
                    </div>

                    {error && (
                        <p className="luxury-error-alert" role="alert">
                            {error}
                        </p>
                    )}

                    <div className="luxury-input-group">
                        <label className="luxury-label" htmlFor="OracleID">Oracle ID</label>
                        <div className="input-wrapper">
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
                            <i className="icon-user"></i>
                        </div>
                    </div>

                    <div className="luxury-input-group">
                        <label className="luxury-label" htmlFor="Password">Password</label>
                        <div className="input-wrapper">
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
                            <i className="icon-lock"></i>
                        </div>
                    </div>

                    <div className="form-footer-actions">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <a href="mailto:support@auditsystem.com" className="forgot-password">Forgot password?</a>
                    </div>

                    <button type="submit" className="luxury-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="spinner"></span>
                                Authorizing...
                            </>
                        ) : (
                            "Sign In Securely"
                        )}
                    </button>
                    
                    <p className="login-copyright">© {new Date().getFullYear()} Apparel Group. All rights reserved.</p>

                </form>
            </div>
        </div>
    );
};

export default Login;