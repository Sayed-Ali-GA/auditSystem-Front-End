import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Authcontext/Authcontext";


const ProtectedRoute = ({ allowedRoles }) => {

    const { user, isAuthenticated } = useAuth();


    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }


    if (
        allowedRoles &&
        !allowedRoles.includes(user.RoleID)
    ) {
        return <Navigate to="/" replace />;
    }


    return <Outlet />;
};


export default ProtectedRoute;