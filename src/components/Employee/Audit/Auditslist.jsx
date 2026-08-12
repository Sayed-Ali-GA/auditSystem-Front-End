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
  const canDelete = roleId === 1;
  const canCreateAudit = [1, 4, 5].includes(roleId);

  const [searchParams] = useSearchParams();
  const storeFilter = searchParams.get("store");

  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const loadAudits = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await auditServices.index(storeFilter);
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
  }, [storeFilter]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this audit?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);
      setError("");
      await auditServices.remove(id);
      setAudits((prev) => prev.filter((audit) => audit.assignmentid !== id));
      notify("success", "Audit deleted.");
    } catch (err) {
      console.error("Delete Audit Error:", err);
      setError("Could not delete the audit. Please try again.");
      notify("error", "Could not delete the audit.");
    } finally {
      setDeletingId(null);
    }
  };

  const storeLabel =
    storeFilter && audits.length > 0
      ? `${audits[0].storecode} — ${audits[0].brandname}`
      : storeFilter
      ? `Store #${storeFilter}`
      : null;

  const getStatusClass = (status) => {
    if (!status) return "";
    switch (status) {
      case "Draft": return "draft";
      case "Submitted": return "submitted";
      case "Needs Revision": return "needs-revision";
      case "Rejected": return "rejected";
      case "Forwarded": return "forwarded";
      case "Sent to Store": return "sent-to-store";
      case "Completed": return "completed";
      default: return "";
    }
  };

  const visibleAudits = useMemo(() => {
    if (statusFilter === "All") return audits;
    return audits.filter((a) => a.status === statusFilter);
  }, [audits, statusFilter]);

  return (
    <div className="audit-page">
      <div className="audit-header">
        <div>
          <h1>{storeLabel ? `Audits — ${storeLabel}` : "Audits"}</h1>
          <p className="subtitle">
            {storeLabel
              ? "All audits submitted for this store."
              : "All audits across every stage — draft to completed."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {storeFilter && (
            <Link to="/Audits" className="audit-btn secondary">
              Clear Filter
            </Link>
          )}


            {canCreateAudit && (
            <Link to="/audit" className="audit-btn">
              + New Audit
            </Link>
          )}
          
        </div>
      </div>

      <div className="audit-filter-row">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className={`audit-filter-chip ${statusFilter === s ? "active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div className="audit-error">{error}</div>}

      {loading ? (
        <div className="audit-empty">Loading audits…</div>
      ) : visibleAudits.length === 0 ? (
        <div className="audit-empty">No audits match this filter.</div>
      ) : (
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
                    <td>
                      {audit.auditdate
                        ? new Date(audit.auditdate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{audit.storecode}</td>
                    <td>{audit.brandname}</td>
                    <td>{audit.locationname}</td>
                    <td>{audit.cashiername || "-"}</td>
                    <td>{audit.auditorname}</td>
                    <td>
                      <span className={`audit-badge ${getStatusClass(audit.status)}`}>
                        {audit.status || "-"}
                      </span>
                    </td>
                    <td>
                      {audit.finalpercentage !== null && audit.finalpercentage !== undefined
                        ? `${Number(audit.finalpercentage).toFixed(2)}%`
                        : "-"}
                    </td>
                    <td>
                      {audit.risklevel ? (
                        <span className={`audit-badge ${audit.risklevel}`}>
                          {audit.risklevel}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {isOwnDraft ? (
                        <Link
                          to={`/AuditDetails/${audit.storeserial}?draftId=${audit.assignmentid}`}
                          className="audit-btn secondary"
                        >
                          Continue
                        </Link>
                      ) : (
                        <Link to={`/Audits/${audit.assignmentid}`} className="audit-btn secondary">
                          View
                        </Link>
                      )}{" "}
                      {canDelete && (
                        <button
                          className="audit-btn danger"
                          onClick={() => handleDelete(audit.assignmentid)}
                          disabled={deletingId === audit.assignmentid}
                        >
                          {deletingId === audit.assignmentid ? "Deleting…" : "Delete"}
                        </button>
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