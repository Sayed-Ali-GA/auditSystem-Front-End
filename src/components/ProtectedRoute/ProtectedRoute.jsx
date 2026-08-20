import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Authcontext/Authcontext";

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    console.log("========== PROTECTED ROUTE ==========");
    console.log("Path:", location.pathname);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("user.RoleID:", user?.RoleID);
    console.log("allowedRoles:", allowedRoles);
    console.log("=====================================");

    // Not logged in
    if (!isAuthenticated) {
        console.log("❌ NOT AUTHENTICATED");

        return <Navigate to="/login" replace />;
    }

    // User object missing
    if (!user) {
        console.log("❌ USER IS MISSING");

        return <Navigate to="/login" replace />;
    }

    // Convert everything to numbers
    const userRole = Number(user.RoleID);

    const roles = Array.isArray(allowedRoles)
        ? allowedRoles.map(Number)
        : null;

    console.log("USER ROLE:", userRole);
    console.log("ALLOWED ROLES:", roles);

    // Route doesn't have role restrictions
    if (!roles) {
        console.log("✅ NO ROLE RESTRICTION");

        return <Outlet />;
    }

    // Check role
    if (!roles.includes(userRole)) {
        console.log("❌ ACCESS DENIED");

        return (
            <Navigate
                to="/"
                replace
                state={{
                    unauthorized: true,
                    from: location.pathname,
                }}
            />
        );
    }

    console.log("✅ ACCESS GRANTED");

    return <Outlet />;
};

export default ProtectedRoute;