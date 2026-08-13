import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

import auditServices from "../../../services/AuditorServices";
import { useAuth } from "../../Authcontext/Authcontext";
import "./audit.css";

const notify = (icon, title) => {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
  });
};

const STATUS_FILTERS = [
  "All",
  "Draft",
  "Submitted",
  "Needs Revision",
  "Rejected",
  "Forwarded",
  "Sent to Store",
  "Completed",
];

const AuditsList = () => {
  const { user } = useAuth();

  const roleId = Number(user?.RoleID ?? user?.roleid);

  // Admin only
  const canArchive = roleId === 1;

  // Same logic you already had
  const canCreateAudit = [1, 4, 5].includes(roleId);

  const [searchParams] = useSearchParams();

  const storeFilter = searchParams.get("store");

  const [audits, setAudits] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const [restoringId, setRestoringId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");

  const [showArchived, setShowArchived] = useState(false);

  // =====================================================
  // LOAD AUDITS
  // =====================================================

  const loadAudits = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await auditServices.index(storeFilter, showArchived);

      setAudits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load Audits Error:", err);

      setError("Could not load audits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeFilter, showArchived]);

  // =====================================================
  // ARCHIVE AUDIT
  // =====================================================

  const handleArchive = async (id) => {
    const result = await Swal.fire({
      title: "Archive this audit?",

      text: "The audit will be archived and can be restored later.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Yes, archive it",

      cancelButtonText: "Cancel",

      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(id);

      setError("");

      await auditServices.remove(id);

      // Remove it from current active list
      setAudits((prev) =>
        prev.filter((audit) => Number(audit.assignmentid) !== Number(id)),
      );

      notify("success", "Audit archived successfully.");
    } catch (err) {
      console.error("Archive Audit Error:", err);

      setError("Could not archive the audit. Please try again.");

      notify("error", "Could not archive the audit.");
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // RESTORE AUDIT
  // =====================================================

  const handleRestore = async (id) => {
    const result = await Swal.fire({
      title: "Restore this audit?",

      text: "The audit will become active again.",

      icon: "question",

      showCancelButton: true,

      confirmButtonText: "Yes, restore it",

      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setRestoringId(id);

      setError("");

      await auditServices.restore(id);

      // Remove it from archived list
      setAudits((prev) =>
        prev.filter((audit) => Number(audit.assignmentid) !== Number(id)),
      );

      notify("success", "Audit restored successfully.");
    } catch (err) {
      console.error("Restore Audit Error:", err);

      setError("Could not restore the audit. Please try again.");

      notify("error", "Could not restore the audit.");
    } finally {
      setRestoringId(null);
    }
  };

  // =====================================================
  // STORE LABEL
  // =====================================================

  const storeLabel =
    storeFilter && audits.length > 0
      ? `${audits[0].storecode} — ${audits[0].brandname}`
      : storeFilter
        ? `Store #${storeFilter}`
        : null;

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    if (!status) return "";

    switch (status) {
      case "Draft":
        return "draft";

      case "Submitted":
        return "submitted";

      case "Needs Revision":
        return "needs-revision";

      case "Rejected":
        return "rejected";

      case "Forwarded":
        return "forwarded";

      case "Sent to Store":
        return "sent-to-store";

      case "Completed":
        return "completed";

      default:
        return "";
    }
  };

  // =====================================================
  // STATUS FILTER
  // =====================================================

  const visibleAudits = useMemo(() => {
    if (statusFilter === "All") {
      return audits;
    }

    return audits.filter((audit) => audit.status === statusFilter);
  }, [audits, statusFilter]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="audit-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="audit-header">
        <div>
          <h1>
            {showArchived
              ? "Archived Audits"
              : storeLabel
                ? `Audits — ${storeLabel}`
                : "Audits"}
          </h1>

          <p className="subtitle">
            {showArchived
              ? "View and restore archived audits."
              : storeLabel
                ? "All active audits submitted for this store."
                : "All active audits across every stage — draft to completed."}
          </p>
        </div>

        {/* =================================================
            HEADER BUTTONS
        ================================================= */}

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          {storeFilter && (
            <Link to="/Audits" className="audit-btn secondary">
              Clear Filter
            </Link>
          )}

          {/* Archive / Active toggle - Admin only */}

          {canArchive && (
            <button
              type="button"
              className="audit-btn secondary"
              onClick={() => {
                setShowArchived((prev) => !prev);

                setStatusFilter("All");
              }}
            >
              {showArchived ? "Active Audits" : "Archived Audits"}
            </button>
          )}

          {/* New Audit */}

          {canCreateAudit && !showArchived && (
            <Link to="/audit" className="audit-btn">
              + New Audit
            </Link>
          )}
        </div>
      </div>

      {/* =================================================
          STATUS FILTERS
      ================================================= */}

      {!showArchived && (
        <div className="audit-filter-row">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              className={`audit-filter-chip ${
                statusFilter === s ? "active" : ""
              }`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && <div className="audit-error">{error}</div>}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div className="audit-empty">Loading audits…</div>
      ) : visibleAudits.length === 0 ? (
        <div className="audit-empty">
          {showArchived
            ? "No archived audits."
            : "No audits match this filter."}
        </div>
      ) : (
        /* =================================================
           TABLE
        ================================================= */

        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Date</th>

                <th>Store</th>

                <th>Brand</th>

                <th>Location</th>

                <th>Cashier</th>

                <th>Auditor</th>

                <th>Status</th>

                <th>Score</th>

                <th>Risk</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleAudits.map((audit) => {
                const isOwnDraft =
                  audit.status === "Draft" &&
                  Number(audit.auditorid) === Number(user?.UserID);

                return (
                  <tr key={audit.assignmentid}>
                    {/* DATE */}

                    <td>
                      {audit.auditdate
                        ? new Date(audit.auditdate).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* STORE */}

                    <td>{audit.storecode}</td>

                    {/* BRAND */}

                    <td>{audit.brandname}</td>

                    {/* LOCATION */}

                    <td>{audit.locationname}</td>

                    {/* CASHIER */}

                    <td>{audit.cashiername || "-"}</td>

                    {/* AUDITOR */}

                    <td>{audit.auditorname}</td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`audit-badge ${getStatusClass(
                          audit.status,
                        )}`}
                      >
                        {audit.status || "-"}
                      </span>
                    </td>

                    {/* SCORE */}

                    <td>
                      {audit.finalpercentage !== null &&
                      audit.finalpercentage !== undefined
                        ? `${Number(audit.finalpercentage).toFixed(2)}%`
                        : "-"}
                    </td>

                    {/* RISK */}

                    <td>
                      {audit.risklevel ? (
                        <span className={`audit-badge ${audit.risklevel}`}>
                          {audit.risklevel}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td
                      style={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      {/* ============================
                          ACTIVE AUDIT
                      ============================ */}

                      {!showArchived && (
                        <>
                          {isOwnDraft ? (
                            <Link
                              to={`/AuditDetails/${audit.storeserial}?draftId=${audit.assignmentid}`}
                              className="audit-btn secondary"
                            >
                              Continue
                            </Link>
                          ) : (
                            <Link
                              to={`/Audits/${audit.assignmentid}`}
                              className="audit-btn secondary"
                            >
                              View
                            </Link>
                          )}{" "}
                          {canArchive && (
                            <button
                              type="button"
                              className="audit-btn danger"
                              onClick={() => handleArchive(audit.assignmentid)}
                              disabled={deletingId === audit.assignmentid}
                            >
                              {deletingId === audit.assignmentid
                                ? "Archiving…"
                                : "Archive"}
                            </button>
                          )}
                        </>
                      )}

                      {/* ============================
                          ARCHIVED AUDIT
                      ============================ */}

                      {showArchived && (
                        <>
                          <button
                            type="button"
                            className="audit-btn"
                            onClick={() => handleRestore(audit.assignmentid)}
                            disabled={restoringId === audit.assignmentid}
                          >
                            {restoringId === audit.assignmentid
                              ? "Restoring…"
                              : "Restore"}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditsList;
