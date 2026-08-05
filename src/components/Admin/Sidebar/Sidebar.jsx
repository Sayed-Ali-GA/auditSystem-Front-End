import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FiHome,
    FiUsers,
    FiTag,
    FiCheckSquare,
    FiMapPin,
    FiUserCheck,
    FiUser,
    FiShoppingBag,
    FiClipboard,
    FiArchive,
    FiLogOut,
    FiMenu,
    FiChevronsLeft,
    FiX,
} from "react-icons/fi";

import { useAuth } from "../../../components/Authcontext/Authcontext";
import "./Sidebar.css";

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const menus = {
        admin: [
            { name: "Users", path: "/users", icon: <FiUsers /> },
            { name: "Brands", path: "/brands", icon: <FiTag /> },
            { name: "Criteria", path: "/criteria", icon: <FiCheckSquare /> },
            { name: "Location", path: "/location", icon: <FiMapPin /> },
            { name: "Ops Managers", path: "/opsmanagers", icon: <FiUserCheck /> },
            { name: "Store Managers", path: "/storemanagers", icon: <FiUser /> },
            { name: "Stores", path: "/stores", icon: <FiShoppingBag /> },
            { name: "Audit Point", path: "/audit-points", icon: <FiClipboard /> },
            { name: "Audits", path: "/Audits", icon: <FiArchive /> },
        ],
        opsManager: [
            { name: "Audit Point", path: "/audit-points", icon: <FiClipboard /> },
            { name: "Audits", path: "/Audits", icon: <FiArchive /> },
        ],
        auditor: [
            { name: "Audit", path: "/audit", icon: <FiClipboard /> },
            { name: "Past Audits", path: "/Audits", icon: <FiArchive /> },
        ],
    };

    const getMenu = () => {
        switch (user?.RoleID) {
            case 1: return menus.admin;
            case 2: return menus.opsManager;
            case 3: return menus.auditor;
            default: return [];
        }
    };

    return (
        <>
            {/* Mobile top bar */}
            <div className="ag-mobile-topbar">
                <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
                    <FiMenu />
                </button>
                <strong>Apparel Group · Audit</strong>
            </div>

            {mobileOpen && (
                <div
                    className="ag-sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`ag-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>

                <div className="ag-sidebar-brand">
                    <img src="/images/logo.png" alt="Apparel Group" />
                    <div className="brand-text">
                        <h2>Apparel Group</h2>
                        <span>Audit Console</span>
                    </div>

                    <button
                        className="ag-sidebar-collapse-btn"
                        onClick={() => setCollapsed((c) => !c)}
                        aria-label="Collapse sidebar"
                        style={{ display: "flex" }}
                    >
                        <FiChevronsLeft style={{ transform: collapsed ? "rotate(180deg)" : "none" }} />
                    </button>

                    <button
                        className="ag-sidebar-collapse-btn"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                        style={{ display: mobileOpen ? "flex" : "none" }}
                    >
                        <FiX />
                    </button>
                </div>

                <nav>
                    <NavLink to="/" end onClick={() => setMobileOpen(false)}>
                        <FiHome />
                        <span>Home</span>
                    </NavLink>

                    {getMenu().map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="ag-sidebar-footer">
                    <button
                        type="button"
                        className="ag-logout-button"
                        onClick={handleLogout}
                    >
                        <FiLogOut />
                        <span>Log out</span>
                    </button>
                </div>

            </aside>
        </>
    );
};

export default Sidebar;