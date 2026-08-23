// src/components/Admin/HomePage/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiAward,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiInbox,
  FiMapPin,
  FiPlayCircle,
  FiSettings,
  FiShoppingBag,
  FiTag,
  FiUser,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

import { useAuth } from "../../Authcontext/Authcontext";

import storeServices from "../../../services/StoreServices";
import brandService from "../../../services/BrandServices";
import locationServices from "../../../services/locationServices";
import OpsManagerServices from "../../../services/OpsManagerServices";
import storeManagerServices from "../../../services/StoreManagerServices";
import usersServices from "../../../services/UserServices";
import auditServices from "../../../services/AuditorServices";

import { filterMyTaskAudits } from "../../../utils/auditWorkflow";

import LoadingState from "../Shared/LoadingState";
import "../Shared/theme.css";
import "./HomePage.css";

const ROLE_NAMES = {
  1: "Administrator",
  2: "Operations Manager",
  3: "Store Manager",
  4: "Auditor",
  5: "Audit Manager",
};

const getAuditStatus = (audit) =>
  String(
    audit?.Status ??
      audit?.status ??
      audit?.FinalStatus ??
      audit?.finalStatus ??
      "",
  )
    .trim()
    .toLowerCase();

const HomePage = () => {
  const { user: currentUser } = useAuth();

  const roleId = Number(currentUser?.RoleID);
  const isAdmin = roleId === 1;
  const isAuditor = roleId === 4;
  const isStoreAccount = Boolean(currentUser?.IsStoreAccount);
  const canViewAudits = [1, 2, 3, 5].includes(roleId);

  const [audits, setAudits] = useState([]);
  const [stores, setStores] = useState([]);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [opsManagers, setOpsManagers] = useState([]);
  const [storeManagers, setStoreManagers] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadCoreData = async () => {
      try {
        setLoading(true);

        const [auditResult, storeResult] = await Promise.all([
          auditServices.index(),
          isAdmin ? storeServices.index() : Promise.resolve([]),
        ]);

        if (!mounted) return;

        setAudits(Array.isArray(auditResult) ? auditResult : []);

        setStores(Array.isArray(storeResult) ? storeResult : []);
      } catch (error) {
        console.error("HomePage: failed to load dashboard data", error);

        if (mounted) {
          setAudits([]);
          setStores([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCoreData();

    return () => {
      mounted = false;
    };
  }, [currentUser, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    let mounted = true;

    const loadAdminData = async () => {
      try {
        setAdminLoading(true);

        const results = await Promise.allSettled([
          usersServices.index(),
          brandService.index(),
          locationServices.index(),
          OpsManagerServices.index(),
          storeManagerServices.index(),
        ]);

        if (!mounted) return;

        const [
          usersResult,
          brandsResult,
          locationsResult,
          opsManagersResult,
          storeManagersResult,
        ] = results;

        setUsers(
          usersResult.status === "fulfilled" && Array.isArray(usersResult.value)
            ? usersResult.value
            : [],
        );

        setBrands(
          brandsResult.status === "fulfilled" &&
            Array.isArray(brandsResult.value)
            ? brandsResult.value
            : [],
        );

        setLocations(
          locationsResult.status === "fulfilled" &&
            Array.isArray(locationsResult.value)
            ? locationsResult.value
            : [],
        );

        setOpsManagers(
          opsManagersResult.status === "fulfilled" &&
            Array.isArray(opsManagersResult.value)
            ? opsManagersResult.value
            : [],
        );

        setStoreManagers(
          storeManagersResult.status === "fulfilled" &&
            Array.isArray(storeManagersResult.value)
            ? storeManagersResult.value
            : [],
        );
      } catch (error) {
        console.error("HomePage: failed to load administration data", error);
      } finally {
        if (mounted) {
          setAdminLoading(false);
        }
      }
    };

    loadAdminData();

    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  const roleName = isStoreAccount
    ? `Store Account${currentUser?.BrandName ? ` — ${currentUser.BrandName}` : ""}`
    : ROLE_NAMES[roleId] || "User";

  const pendingAudits = useMemo(() => {
    if (!currentUser || !Array.isArray(audits)) {
      return [];
    }

    try {
      const result = filterMyTaskAudits(audits, currentUser);

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("HomePage: failed to calculate pending tasks", error);

      return [];
    }
  }, [audits, currentUser]);

  const auditStats = useMemo(() => {
    const stats = {
      total: audits.length,
      submitted: 0,
      completed: 0,
      active: 0,
    };

    audits.forEach((audit) => {
      const status = getAuditStatus(audit);

      if (status === "completed" || status.includes("completed")) {
        stats.completed += 1;
        return;
      }

      if (
        status === "submitted" ||
        status === "forwarded" ||
        status === "sent to store"
      ) {
        stats.submitted += 1;
        return;
      }

      stats.active += 1;
    });

    return stats;
  }, [audits]);

  const heroDescription = isStoreAccount
    ? "Review your store's audit activity, findings and required actions."
    : (
        {
          1: "Centralized control of users, stores, operational structure and audit activity.",
          2: "Monitor assigned operational activity, audit workflow and outstanding actions.",
          3: "Review store audit activity, findings and required operational actions.",
          4: "Conduct assigned audits, record observations and submit accurate findings.",
          5: "Review submitted audits, manage findings and control the audit workflow.",
        }[roleId] ||
        "Centralized access to your assigned activities and audit workspace."
      );

  const quickActions = useMemo(() => {
    if (isAdmin) {
      return [
        {
          title: "Audit Management",
          description: "Review and manage audit records",
          icon: FiClipboard,
          to: "/Audits",
        },
        {
          title: "Store Management",
          description: "Manage stores and assignments",
          icon: FiShoppingBag,
          to: "/stores",
        },
        {
          title: "User Management",
          description: "Manage users and access",
          icon: FiUsers,
          to: "/users",
        },
        {
          title: "Operational Structure",
          description: "Manage locations and management",
          icon: FiSettings,
          to: "/location",
        },
      ];
    }

    if (isAuditor) {
      return [
        {
          title: "Start Audit",
          description: "Begin an assigned store audit",
          icon: FiPlayCircle,
          to: "/audit",
          primary: true,
        },
        {
          title: "My Tasks",
          description: "Review assigned workflow actions",
          icon: FiInbox,
          to: "/tasks",
        },
      ];
    }

    return [
      {
        title: "My Tasks",
        description: "Review assigned workflow actions",
        icon: FiInbox,
        to: "/tasks",
      },
      {
        title: "Audit Management",
        description: "Review available audit records",
        icon: FiClipboard,
        to: "/Audits",
      },
    ];
  }, [isAdmin, isAuditor]);

  if (loading) {
    return (
      <div className="ag-main">
        <LoadingState label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="ag-main ag-home-page">
      <section className="ag-home-header">
        <div className="ag-home-header-main">
          <div className="ag-home-overline">
            APPAREL GROUP
            <span />
            AUDIT MANAGEMENT SYSTEM
          </div>

          <h1>
            Welcome back, <strong>{currentUser?.UserName || "User"}</strong>
          </h1>

          <p>{heroDescription}</p>
        </div>

        <div className="ag-home-role">
          <div className="ag-home-role-icon">
            <FiAward />
          </div>

          <div>
            <span>ACCESS LEVEL</span>
            <strong>{roleName}</strong>
          </div>
        </div>
      </section>

      <section className="ag-home-kpis">
        <Link to="/tasks" className="ag-home-kpi">
          <div className="ag-home-kpi-icon">
            <FiInbox />
          </div>

          <div className="ag-home-kpi-content">
            <span>MY TASKS</span>
            <strong>{pendingAudits.length}</strong>
            <small>Pending actions</small>
          </div>

          <FiArrowRight className="ag-home-kpi-arrow" />
        </Link>

        {canViewAudits && (
          <Link to="/Audits" className="ag-home-kpi">
            <div className="ag-home-kpi-icon">
              <FiClipboard />
            </div>

            <div className="ag-home-kpi-content">
              <span>AUDITS</span>
              <strong>{auditStats.total}</strong>
              <small>Accessible records</small>
            </div>

            <FiArrowRight className="ag-home-kpi-arrow" />
          </Link>
        )}

        {canViewAudits && (
          <div className="ag-home-kpi">
            <div className="ag-home-kpi-icon">
              <FiCheckCircle />
            </div>

            <div className="ag-home-kpi-content">
              <span>COMPLETED</span>
              <strong>{auditStats.completed}</strong>
              <small>Closed audits</small>
            </div>
          </div>
        )}

        {isAdmin && (
          <Link to="/stores" className="ag-home-kpi">
            <div className="ag-home-kpi-icon">
              <FiShoppingBag />
            </div>

            <div className="ag-home-kpi-content">
              <span>STORES</span>
              <strong>{stores.length}</strong>
              <small>Registered stores</small>
            </div>

            <FiArrowRight className="ag-home-kpi-arrow" />
          </Link>
        )}

        {isAdmin && (
          <Link to="/users" className="ag-home-kpi">
            <div className="ag-home-kpi-icon">
              <FiUsers />
            </div>

            <div className="ag-home-kpi-content">
              <span>USERS</span>
              <strong>{users.length}</strong>
              <small>System users</small>
            </div>

            <FiArrowRight className="ag-home-kpi-arrow" />
          </Link>
        )}
      </section>

      <section className="ag-home-workspace">
        <div className="ag-home-panel">
          <div className="ag-home-panel-header">
            <div>
              <span>WORKSPACE</span>
              <h2>Quick Actions</h2>
              <p>Access the areas most relevant to your role.</p>
            </div>

            <FiActivity />
          </div>

          <div className="ag-home-actions">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  to={action.to}
                  className={`ag-home-action ${action.primary ? "is-primary" : ""}`}
                >
                  <div className="ag-home-action-icon">
                    <Icon />
                  </div>

                  <div>
                    <strong>{action.title}</strong>

                    <span>{action.description}</span>
                  </div>

                  <FiArrowRight />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="ag-home-panel">
          <div className="ag-home-panel-header">
            <div>
              <span>WORKFLOW</span>
              <h2>My Work</h2>
              <p>Current activity requiring your attention.</p>
            </div>

            <FiClock />
          </div>

          <div className="ag-home-work-stats">
            <div>
              <span>PENDING</span>
              <strong>{pendingAudits.length}</strong>
            </div>

            <div>
              <span>COMPLETED</span>
              <strong>{auditStats.completed}</strong>
            </div>
          </div>

          <div
            className={`ag-home-work-message ${
              pendingAudits.length > 0 ? "has-pending" : "is-clear"
            }`}
          >
            <div>
              {pendingAudits.length > 0 ? <FiAlertCircle /> : <FiCheckCircle />}
            </div>

            <section>
              <strong>
                {pendingAudits.length > 0 ? "Action required" : "No pending actions"}
              </strong>

              <p>
                {pendingAudits.length > 0
                  ? `You currently have ${pendingAudits.length} ${
                      pendingAudits.length === 1 ? "task" : "tasks"
                    } requiring your attention.`
                  : "Your assigned workflow is currently up to date."}
              </p>

              {pendingAudits.length > 0 && (
                <Link to="/tasks">
                  Review tasks
                  <FiArrowRight />
                </Link>
              )}
            </section>
          </div>
        </div>
      </section>

      {isAdmin && (
        <section className="ag-home-panel ag-home-section">
          <div className="ag-home-panel-header">
            <div>
              <span>ADMINISTRATION</span>
              <h2>Management Overview</h2>
              <p>Maintain the operational structure of the system.</p>
            </div>

            <FiSettings />
          </div>

          <div className="ag-home-management">
            <Link to="/stores">
              <FiShoppingBag />

              <div>
                <strong>Stores</strong>
                <span>{stores.length} registered</span>
              </div>

              <FiArrowRight />
            </Link>

            <Link to="/brands">
              <FiTag />

              <div>
                <strong>Brands</strong>
                <span>{brands.length} registered</span>
              </div>

              <FiArrowRight />
            </Link>

            <Link to="/location">
              <FiMapPin />

              <div>
                <strong>Locations</strong>
                <span>{locations.length} registered</span>
              </div>

              <FiArrowRight />
            </Link>

            <Link to="/opsmanagers">
              <FiUserCheck />

              <div>
                <strong>Operations Managers</strong>
                <span>{opsManagers.length} registered</span>
              </div>

              <FiArrowRight />
            </Link>

            <Link to="/storemanagers">
              <FiUser />

              <div>
                <strong>Store Managers</strong>
                <span>{storeManagers.length} registered</span>
              </div>

              <FiArrowRight />
            </Link>

            <Link to="/users">
              <FiUsers />

              <div>
                <strong>System Users</strong>
                <span>{users.length} registered</span>
              </div>

              <FiArrowRight />
            </Link>
          </div>

          {adminLoading && (
            <div className="ag-home-admin-loading">
              Updating management figures...
            </div>
          )}
        </section>
      )}

      {canViewAudits && (
        <section className="ag-home-panel ag-home-section">
          <div className="ag-home-panel-header">
            <div>
              <span>AUDIT CONTROL</span>
              <h2>Audit Overview</h2>
              <p>Current audit activity available to your account.</p>
            </div>

            <Link to="/Audits" className="ag-home-view-link">
              View audits
              <FiArrowRight />
            </Link>
          </div>

          <div className="ag-home-audit-stats">
            <div>
              <span>TOTAL AUDITS</span>
              <strong>{auditStats.total}</strong>
              <small>All accessible records</small>
            </div>

            <div>
              <span>UNDER REVIEW</span>
              <strong>{auditStats.submitted}</strong>
              <small>Submitted workflow items</small>
            </div>

            <div>
              <span>ACTIVE</span>
              <strong>{auditStats.active}</strong>
              <small>Non-completed records</small>
            </div>

            <div>
              <span>COMPLETED</span>
              <strong>{auditStats.completed}</strong>
              <small>Closed audit records</small>
            </div>
          </div>
        </section>
      )}

      {isAuditor && (
        <section className="ag-home-auditor">
          <div className="ag-home-auditor-icon">
            <FiPlayCircle />
          </div>

          <div className="ag-home-auditor-content">
            <span>AUDIT EXECUTION</span>

            <h2>Ready to perform an audit?</h2>

            <p>Start an assigned store audit and record your findings.</p>
          </div>

          <Link to="/audit" className="ag-home-auditor-button">
            Start Audit
            <FiArrowRight />
          </Link>
        </section>
      )}
    </div>
  );
};

export default HomePage;