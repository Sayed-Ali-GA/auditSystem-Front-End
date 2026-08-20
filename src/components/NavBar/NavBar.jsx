import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiBell } from "react-icons/fi";
import { useAuth } from "../../components/Authcontext/Authcontext";
import notificationServices from "../../services/NotificationServices";
import "./NavBar.css";

const typeIcon = {
  success: "✅",
  warning: "⚠️",
  error: "⛔",
  info: "🔔",
};

const NavBar = () => {
  const { logout, user } = useAuth();
  // console.log("CURRENT USER:", user);
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await notificationServices.index();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isread).length;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isread) {
        await notificationServices.markRead(notification.notificationid);
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationid === notification.notificationid
              ? { ...n, isread: true }
              : n
          )
        );
      }
    } catch (error) {
      console.log(error);
    }

    setOpen(false);

    if (notification.relatedassignmentid) {
      navigate(`/Audits/${notification.relatedassignmentid}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationServices.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isread: true })));
    } catch (error) {
      console.log(error);
    }
  };

  const roleNames = {
    1: "Administrator",
    2: "Operations Manager",
    3: "Store Manager",
    4: "Auditor",
    5: "Audit Manager",
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
    "/tasks": "My Tasks",
    "/Audits": "Audit History",
    "/Reports": "Reports",
  };

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formatTimeAgo = (value) => {
    const diffMs = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <img src="/images/logo.png" alt="Logo" className="navbar-logo" />
        <div>
          <h2>{pageTitles[location.pathname] || "Audit System"}</h2>
          <p>{today}</p>
        </div>
      </div>

      <div className="navbar-right">
        <div className="nav-bell-wrap" ref={dropdownRef}>
          <button
            className="nav-bell-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label="Notifications"
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="nav-bell-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="nav-bell-dropdown">
              <div className="nav-bell-dropdown-header">
                <strong>Notifications</strong>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead}>Mark all read</button>
                )}
              </div>

              <div className="nav-bell-list">
                {notifications.length === 0 && (
                  <div className="nav-bell-empty">No notifications yet.</div>
                )}

                {notifications.map((n) => (
                  <button
                    key={n.notificationid}
                    className={`nav-bell-item ${n.isread ? "" : "unread"}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <span className="nav-bell-item-icon">
                      {typeIcon[n.type] || "🔔"}
                    </span>
                    <span className="nav-bell-item-body">
                      <span className="nav-bell-item-msg">{n.message}</span>
                      <span className="nav-bell-item-time">
                        {formatTimeAgo(n.createdat)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
<div className="user-info">
  <div className="avatar">
    {user?.UserName?.charAt(0).toUpperCase()}
  </div>

  <div>
    <strong>{user?.UserName}</strong>
    <p>
      {user?.IsStoreAccount ? "Store Account" : roleNames[user?.RoleID]}
    </p>
  </div>
</div>

        <button className="logout-button" onClick={handleLogout}>
          <FiLogOut />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
};

export default NavBar;