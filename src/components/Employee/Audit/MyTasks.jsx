import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiInbox, FiArrowRight } from "react-icons/fi";

import auditServices from "../../../services/AuditorServices";
import { useAuth } from "../../Authcontext/Authcontext";
import { filterMyTaskAudits, TASK_LABELS } from "../../../utils/auditWorkflow";
import "./audit.css";

const ROLE_SUBTITLES = {
  1: "Everything currently waiting on any team member.",
  2: "Audits forwarded to you for review and comment.",
  3: "Audits sent to you to add the action plan and target date.",
  4: "Your drafts and audits sent back for revision.",
  5: "Newly submitted audits awaiting your review.",
};

const getTaskLink = (audit) => {
  if (audit.status === "Draft") {
    return `/AuditDetails/${audit.storeserial}?draftId=${audit.assignmentid}`;
  }
  return `/Audits/${audit.assignmentid}`;
};

const getStatusClass = (status) => {
  switch (status) {
    case "Draft":
      return "draft";
    case "Submitted":
      return "submitted";
    case "Needs Revision":
      return "needs-revision";
    case "Forwarded":
      return "forwarded";
    case "Sent to Store":
      return "sent-to-store";
    default:
      return "";
  }
};

const MyTasks = () => {
  const { user } = useAuth();

  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await auditServices.index();
        setAudits(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load your tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const tasks = filterMyTaskAudits(audits, user);

  const grouped = tasks.reduce((acc, audit) => {
    const key = audit.status;
    if (!acc[key]) acc[key] = [];
    acc[key].push(audit);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="audit-page">
        <div className="audit-empty">Loading your tasks…</div>
      </div>
    );
  }

  return (
    <div className="audit-page">
      <div className="audit-header">
        <div>
          <h1>My Tasks</h1>
          <p className="subtitle">
            {ROLE_SUBTITLES[user?.RoleID] || "Audits currently waiting on you."}
          </p>
        </div>
      </div>

      {error && <div className="audit-error">{error}</div>}

      {tasks.length === 0 ? (
        <div className="audit-card audit-tasks-empty">
          <FiInbox size={32} />
          <p>You're all caught up — nothing needs your attention right now.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([status, items]) => (
          <div className="audit-card audit-tasks-group" key={status}>
            <div className="audit-tasks-group-header">
              <span className={`audit-badge ${getStatusClass(status)}`}>{status}</span>
              <span className="audit-tasks-count">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="audit-table-wrap">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Brand</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((audit) => (
                    <tr key={audit.assignmentid}>
                      <td>{audit.storecode}</td>
                      <td>{audit.brandname}</td>
                      <td>{audit.locationname}</td>
                      <td>
                        {audit.auditdate
                          ? new Date(audit.auditdate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <Link
                          to={getTaskLink(audit)}
                          className="audit-btn secondary audit-task-link"
                        >
                          {TASK_LABELS[status] || "Open"} <FiArrowRight />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyTasks;