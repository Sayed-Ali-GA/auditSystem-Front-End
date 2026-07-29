import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../components/Authcontext/Authcontext";

// Wraps routes that should NOT be visible to an already-logged-in user
// (currently just /login). Redirects to the home page if a token exists.
const PublicRoute = () => {

    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;



