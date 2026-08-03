import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../components/Authcontext/Authcontext";
import "./Sidebar.css";

const Sidebar = () => {

    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };


    const menus = {
        admin: [
            { name: "Users", path: "/users" },
            { name: "Brands", path: "/brands" },
            { name: "Criteria", path: "/criteria" },
            { name: "Location", path: "/location" },
            { name: "Ops Managers", path: "/opsmanagers" },
            { name: "Store Managers", path: "/storemanagers" },
            { name: "Stores", path: "/stores" },
            { name: "Audit Point", path: "/audit-points" },
            { name: "Audits", path: "/Audits" },
        ],

        opsManager: [
            { name: "Audit Point", path: "/audit-points" },
            { name: "Audits", path: "/Audits" },
        ],

        auditor: [
            { name: "Audit", path: "/audit" },
            { name: "Past Audits", path: "/Audits" },
        ]
    };


    const getMenu = () => {

        switch(user?.RoleID) {

            case 1:
                return menus.admin;

            case 2:
                return menus.opsManager;

            case 3:
                return menus.auditor;

            default:
                return [];
        }
    };


    return (
        <aside className="sidebar">

            <img 
                src="/images/logo.png" 
                alt="Logo" 
                className="logo" 
            />

            <h2>Audit System</h2>


            <nav>

                <NavLink to="/">
                    Home
                </NavLink>


                {getMenu().map((item) => (
                    <NavLink 
                        key={item.path}
                        to={item.path}
                    >
                        {item.name}
                    </NavLink>
                ))}


            </nav>


            <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
            >
                Log out
            </button>


        </aside>
    );
};

export default Sidebar;