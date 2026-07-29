import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/UserServices";
import { useAuth } from "../../components/Authcontext/Authcontext";


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
            const data = await userService.login({ OracleID, Password });

            // Updates context state as well as localStorage, so the
            // Sidebar and route guards react immediately.
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
            <form className="login-form" onSubmit={handleSubmit} noValidate>

                <h1 className="login-title">Sign in</h1>

                {error && (
                    <p className="login-error" role="alert">
                        {error}
                    </p>
                )}

                <p>
                    <label className="login-field">
                        <span>Oracle ID</span>
                        <input
                            type="text"
                            name="OracleID"
                            value={OracleID}
                            onChange={(e) => setOracleID(e.target.value)}
                            autoComplete="username"
                            disabled={isSubmitting}
                        />
                    </label>
                </p>

                <p>
                    <label className="login-field">
                        <span>Password</span>
                        <input
                            type="password"
                            name="Password"
                            value={Password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            disabled={isSubmitting}
                        />
                    </label>
                </p>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign in"}
                </button>

            </form>
        </div>
    );
};

export default Login;