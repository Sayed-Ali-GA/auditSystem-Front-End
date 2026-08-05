import { useNavigate, useLocation } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../components/Authcontext/Authcontext";
import "./NavBar.css";

const NavBar = () => {

    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const roleNames = {
        1: "Administrator",
        2: "Operations Manager",
        3: "Auditor",
    };

    const pageTitles = {
        "/": "Dashboard",
        "/users": "Users",
        "/brands": "Brands",
        "/criteria": "Criteria",
        "/location": "Locations",
        "/opsmanagers": "Operations Managers",
        "/storemanagers": "Store Managers",
        "/stores": "Stores",
        "/audit-points": "Audit Points",
        "/audit": "New Audit",
        "/Audits": "Audit History",
    };

    const today = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <header className="navbar">

            <div className="navbar-left">

                <img
                    src="/images/logo.png"
                    alt="Logo"
                    className="navbar-logo"
                />

                <div>
                    <h2>{pageTitles[location.pathname] || "Audit System"}</h2>
                    <p>{today}</p>
                </div>

            </div>


            <div className="navbar-right">

                <div className="user-info">

                    <div className="avatar">
                        {user?.UserName?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <strong>{user?.UserName}</strong>
                        <p>{roleNames[user?.RoleID]}</p>
                    </div>

                </div>


                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <FiLogOut />
                    <span>Log out</span>
                </button>

            </div>

        </header>
    );
};

export default NavBar;