import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiArrowLeft,
  FiPrinter,
  FiCheck,
  FiSave,
  FiSend,
  FiXCircle,
  FiRotateCcw,
  FiCheckCircle,
} from "react-icons/fi";

import auditServices from "../../../services/AuditorServices";
import { useAuth } from "../../Authcontext/Authcontext";
import "./audit.css";

const RATING_OPTIONS = [
  { value: "S.V", label: "S.V — Satisfactory" },
  { value: "NI", label: "NI — Needs Improvement" },
  { value: "UN", label: "UN — Unsatisfactory" },
  { value: "NA", label: "NA — Not Applicable" },
];

const WORKFLOW_STEPS = [
  { key: "Submitted", label: "Submitted" },
  { key: "Forwarded", label: "Ops Review" },
  { key: "Sent to Store", label: "Store Review" },
  { key: "Completed", label: "Completed" },
];

const BHD_DENOMINATIONS = [
  { key: "20", label: "20", value: 20 },
  { key: "10", label: "10", value: 10 },
  { key: "5", label: "5", value: 5 },
  { key: "1", label: "1", value: 1 },
  { key: "0.500", label: ".500", value: 0.5 },
  { key: "0.100", label: "0.100", value: 0.1 },
  { key: "0.050", label: "0.050", value: 0.05 },
  { key: "0.025", label: "0.025", value: 0.025 },
  { key: "0.010", label: "0.010", value: 0.01 },
];

const scoreFromRating = (rating) => {
  if (rating === "S.V") return { score: 2, percentage: 100 };
  if (rating === "NI") return { score: 1, percentage: 50 };
  if (rating === "UN") return { score: 0, percentage: 0 };
  return { score: null, percentage: null };
};

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

const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const formatDateDisplay = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const getRatingLabel = (risk) => {
  if (risk === "Low") return "SATISFACTORY";
  if (risk === "Moderate") return "NEEDS IMPROVEMENT";
  if (risk === "High") return "UNSATISFACTORY";
  return "-";
};

const buildReportSections = (evaluations) => {
  const majorMap = new Map();

  evaluations.forEach((ev) => {
    const majorName = ev.MajorCriteriaName || "General";
    const subName = ev.SubPointCriteria || "General";

    if (!majorMap.has(majorName)) majorMap.set(majorName, new Map());
    const subMap = majorMap.get(majorName);

    if (!subMap.has(subName)) subMap.set(subName, []);
    subMap.get(subName).push(ev);
  });

  const sections = [];
  let majorIndex = 0;

  majorMap.forEach((subMap, majorName) => {
    majorIndex += 1;
    let subIndex = 0;
    const subsections = [];

    subMap.forEach((items, subName) => {
      subIndex += 1;
      subsections.push({
        number: `${majorIndex}.${subIndex}`,
        name: subName,
        items: items.map((it, i) => ({ ...it, number: `${majorIndex}.${subIndex}.${i + 1}` })),
      });
    });

    sections.push({ number: majorIndex, name: majorName, subsections });
  });

  return sections;
};

const AuditView = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  /* ROLES — 1 Admin, 2 Ops Manager, 3 Store Manager, 4 Auditor, 5 Audit Manager */
  const isAdmin = user?.RoleID === 1;
  const isAuditManager = user?.RoleID === 5 || isAdmin;
  const isOpsManager = user?.RoleID === 2 || isAdmin;
  const isStoreManager = user?.RoleID === 3 || isAdmin;
  const isAuditor = user?.RoleID === 4;

  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const [draftEvaluations, setDraftEvaluations] = useState([]);

  const [revisionReason, setRevisionReason] = useState("");
  const [showRevisionBox, setShowRevisionBox] = useState(false);

  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  const [opsCommentInput, setOpsCommentInput] = useState("");
  const [auditManagerNoteInput, setAuditManagerNoteInput] = useState(""); 
  
  
  const loadAudit = async () => {
    try {
        setLoading(true);
        setError("");

        const data = await auditServices.show(id);

        setAudit(data);

        setDraftEvaluations(
            Array.isArray(data.evaluations)
                ? data.evaluations
                : []
        );

        setOpsCommentInput(data.actionnote ?? "");

        setAuditManagerNoteInput(
            data.auditmanagernote ?? ""
        );

    } catch (err) {
        console.error("Load Audit Error:", err);
        setError(err.message || "Could not load this audit.");
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    loadAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const runUpdate = async (payload, successMessage) => {
    try {
      setWorking(true);
      setError("");

      await auditServices.update(id, payload);
      await loadAudit();

      setShowRevisionBox(false);
      setShowRejectBox(false);
      setRevisionReason("");
      setRejectionReason("");

      if (successMessage) notify("success", successMessage);
    } catch (err) {
      console.error("Update Audit Error:", err);
      const message = err?.message || "Could not save your changes. Please try again.";
      setError(message);
      notify("error", message);
    } finally {
      setWorking(false);
    }
  };

  const handleDraftChange = (index, field, value) => {
    const updated = [...draftEvaluations];

    if (field === "Rating") {
      const { score, percentage } = scoreFromRating(value);
      updated[index] = { ...updated[index], Rating: value, Score: score, Percentage: percentage };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    setDraftEvaluations(updated);
  };

  /* -------------------- AUDIT MANAGER -------------------- */
  const requestRevision = () => {
    if (!revisionReason.trim()) { setError("Please enter a revision reason."); return; }
    runUpdate({ status: "Needs Revision", revisionReason: revisionReason.trim() }, "Revision requested — sent back to the auditor.");
  };

  const rejectAudit = () => {
    if (!rejectionReason.trim()) { setError("Please enter a rejection reason."); return; }
    runUpdate({ status: "Rejected", rejectionReason: rejectionReason.trim() }, "Audit rejected.");
  };

  const approveAndForward = () => {
    runUpdate(
        {
            auditManagerNote: auditManagerNoteInput.trim(),
            status: "Forwarded"
        },
        "Approved and forwarded to Ops Manager."
    );
};

  /* -------------------- AUDITOR -------------------- */
  const saveDraft = () => {
    runUpdate({ evaluations: draftEvaluations }, "Draft saved.");
  };

  const resubmitAudit = () => {
    runUpdate({ evaluations: draftEvaluations, status: "Submitted" }, "Audit resubmitted for review.");
  };

  /* -------------------- OPS MANAGER -------------------- */
  const sendToStoreManager = () => {
    if (!opsCommentInput.trim()) { setError("Please add a comment before sending to the Store Manager."); return; }
    runUpdate(
      { actionNote: opsCommentInput.trim(), status: "Sent to Store" },
      "Sent to Store Manager."
    );
  };

  /* -------------------- STORE MANAGER -------------------- */
  const saveActionPlan = () => {
    runUpdate({ evaluations: draftEvaluations }, "Action plan saved.");
  };

  const markCompleted = () => {
    runUpdate({ evaluations: draftEvaluations, status: "Completed" }, "Audit marked as completed.");
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="audit-page">
        <div className="audit-empty">Loading audit…</div>
      </div>
    );
  }

  if (error && !audit) {
    return (
      <div className="audit-page">
        <div className="audit-error">{error}</div>
        <Link to="/Audits" className="audit-btn secondary">
          <FiArrowLeft /> Back to Audits
        </Link>
      </div>
    );
  }

  if (!audit) return null;

  const status = audit.status;
  const canEditFindings = isAuditor && status === "Needs Revision";
  const canEditActionPlan = isStoreManager && status === "Sent to Store";

  const currentStepIndex =
    status === "Rejected"
      ? -1
      : status === "Needs Revision"
      ? 0
      : WORKFLOW_STEPS.findIndex((s) => s.key === status);

  const reportSections = buildReportSections(draftEvaluations);
  const ratingLabel = getRatingLabel(audit.risklevel);
  const cc = audit.cashcount;

  return (
    <div className="audit-page">
      {/* ==================== HEADER ==================== */}
      <div className="audit-header no-print">
        <div>
          <h1>{audit.storecode} — {audit.brandname}</h1>
          <p className="subtitle">
            {audit.locationname} · Audited {new Date(audit.auditdate).toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="audit-btn secondary" onClick={handlePrint}>
            <FiPrinter /> Print Report
          </button>
          <Link to="/Audits" className="audit-btn secondary">
            <FiArrowLeft /> Back to Audits
          </Link>
        </div>
      </div>

{/* ==================== STATUS STEPPER ==================== */}
      {status === "Draft" ? (
        <div className="audit-draft-status-banner no-print">
          📝 This audit is still a draft. Go to "Start an Audit" → "Continue a
          Draft" to finish filling it in and submit it.
        </div>
      ) : status !== "Rejected" ? (
        <div className="audit-stepper no-print">
          {WORKFLOW_STEPS.map((step, i) => {
            const isDone = i < currentStepIndex;
            const isActive = i === currentStepIndex;
            return (
              <div className="audit-step-wrap" key={step.key}>
                <div className={`audit-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                  <span className="audit-step-circle">{isDone ? <FiCheck /> : i + 1}</span>
                  <span className="audit-step-label">{step.label}</span>
                  {isActive && status === "Needs Revision" && (
                    <span className="audit-badge Moderate audit-step-chip">Needs Revision</span>
                  )}
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className={`audit-step-line ${isDone ? "done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="audit-error no-print">
          <FiXCircle /> This audit has been rejected and is no longer active.
        </div>
      )}

      {location.state?.justCreated && (
        <div className="audit-card no-print" style={{ background: "#e4f3ea", borderColor: "#bfe2cd" }}>
          Audit submitted successfully.
        </div>
      )}

      {error && <div className="audit-error no-print">{error}</div>}

      {/* ==================== SUMMARY ==================== */}
      <div className="audit-card no-print">
        <div className="audit-store-summary">
          <div className="audit-store-item"><span>Cashier</span><strong>{audit.cashiername}</strong></div>
          <div className="audit-store-item"><span>Auditor</span><strong>{audit.auditorname}</strong></div>
          <div className="audit-store-item"><span>Store Manager</span><strong>{audit.storemanagername || "-"}</strong></div>
          <div className="audit-store-item"><span>Ops Manager</span><strong>{audit.opsmanagername}</strong></div>
          <div className="audit-store-item"><span>Status</span><strong>{status}</strong></div>
          <div className="audit-store-item">
            <span>Final Percentage</span>
            <strong>
              {audit.finalpercentage !== null && audit.finalpercentage !== undefined
                ? `${Number(audit.finalpercentage).toFixed(2)}%`
                : "-"}
            </strong>
          </div>
          <div className="audit-store-item">
            <span>Overall Rating</span>
            <strong>
              {audit.risklevel && <span className={`audit-badge ${audit.risklevel}`}>{ratingLabel}</span>}
            </strong>
          </div>
        </div>

        {audit.actionnote && (
          <div style={{ marginTop: 14 }}>
            <span className="audit-note-label">Ops Manager Comment</span>
            <p style={{ margin: 0 }}>{audit.actionnote}</p>
          </div>
        )}

        {audit.auditmanagernote && (
    <div style={{ marginTop: 14 }}>
        <span className="audit-note-label">
            Audit Manager Comment
        </span>

        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {audit.auditmanagernote}
        </p>
    </div>
)}

        {audit.revisionreason && (
          <div style={{ marginTop: 14 }}>
            <span className="audit-note-label danger">Revision Request</span>
            <p style={{ margin: 0 }}>{audit.revisionreason}</p>
          </div>
        )}

        {audit.rejectionreason && (
          <div style={{ marginTop: 14 }}>
            <span className="audit-note-label danger">Rejection Reason</span>
            <p style={{ margin: 0 }}>{audit.rejectionreason}</p>
          </div>
        )}
      </div>

      {/* ==================== CASH COUNT (READ-ONLY) ==================== */}
      {cc && (
        <div className="audit-card no-print">
          <div className="audit-card-title" style={{ fontWeight: 700, marginBottom: 10 }}>
            Cash Count (BHD)
          </div>
          <div className="audit-store-summary">
            <div className="audit-store-item">
              <span>Tills Float</span>
              <strong>{Number(cc.tillFloat || 0).toFixed(3)}</strong>
            </div>
            <div className="audit-store-item">
              <span>Sale Cash (report)</span>
              <strong>{Number(cc.saleCashPerReport || 0).toFixed(3)}</strong>
            </div>
            {cc.remarks && (
              <div className="audit-store-item">
                <span>Remarks</span>
                <strong>{cc.remarks}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== AUDIT MANAGER ACTIONS ==================== */}
      {isAuditManager && status === "Submitted" && (
        <div className="audit-card no-print">

          <div className="audit-field">
    <label>Audit Manager Comment</label>

    <textarea
        value={auditManagerNoteInput}
        onChange={(e) => setAuditManagerNoteInput(e.target.value)}
        placeholder="Write your review comment before forwarding to Ops Manager..."
        rows={4}
    />
</div>

          <div className="audit-actions" style={{ justifyContent: "flex-start", marginTop: 0, marginBottom: showRevisionBox || showRejectBox ? 12 : 0 }}>
            <button className="audit-btn secondary" onClick={() => { setShowRevisionBox((v) => !v); setShowRejectBox(false); setError(""); }} disabled={working}>
              <FiRotateCcw /> Request Revision
            </button>
            <button className="audit-btn danger" onClick={() => { setShowRejectBox((v) => !v); setShowRevisionBox(false); setError(""); }} disabled={working}>
              <FiXCircle /> Reject
            </button>
            <button className="audit-btn" onClick={approveAndForward} disabled={working}>
              <FiCheckCircle /> {working ? "Processing…" : "Approve & Forward"}
            </button>
          </div>

          {showRevisionBox && (
            <div style={{ marginTop: 14 }}>
              <div className="audit-field">
                <label>Revision Reason</label>
                <textarea value={revisionReason} onChange={(e) => setRevisionReason(e.target.value)} placeholder="Explain what the Auditor needs to review or correct..." />
              </div>
              <button className="audit-btn secondary" style={{ marginTop: 10 }} onClick={requestRevision} disabled={working || !revisionReason.trim()}>
                <FiSend /> {working ? "Sending…" : "Send Back to Auditor"}
              </button>
            </div>
          )}

          {showRejectBox && (
            <div style={{ marginTop: 14 }}>
              <div className="audit-field">
                <label>Rejection Reason</label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why this audit is being rejected..." />
              </div>
              <button className="audit-btn danger" style={{ marginTop: 10 }} onClick={rejectAudit} disabled={working || !rejectionReason.trim()}>
                {working ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== AUDITOR — NEEDS REVISION ==================== */}
      {isAuditor && status === "Needs Revision" && (
        <div className="audit-card no-print">
          <p style={{ marginTop: 0 }}>
            The Audit Manager requested changes to this audit. Update your findings below, save your progress, then resubmit when ready.
          </p>
          <div className="audit-actions" style={{ justifyContent: "flex-start", marginTop: 0 }}>
            <button className="audit-btn secondary" onClick={saveDraft} disabled={working}>
              <FiSave /> {working ? "Saving…" : "Save Draft"}
            </button>
            <button className="audit-btn" onClick={resubmitAudit} disabled={working}>
              <FiSend /> {working ? "Resubmitting…" : "Submit for Review"}
            </button>
          </div>
        </div>
      )}

      {/* ==================== OPS MANAGER — FORWARDED ==================== */}
      {isOpsManager && status === "Forwarded" && (
        <div className="audit-card no-print">
          <p style={{ marginTop: 0 }}>
            Review the audit and add your comment, then send it to the Store Manager to complete the action plan.
          </p>

          <div className="audit-field">
            <label>Ops Manager Comment</label>
            <textarea
              value={opsCommentInput}
              onChange={(e) => setOpsCommentInput(e.target.value)}
              placeholder="Write your review comment before sending to the Store Manager..."
            />
          </div>

          <div className="audit-actions" style={{ justifyContent: "flex-start", marginTop: 10 }}>
            <button className="audit-btn" onClick={sendToStoreManager} disabled={working}>
              <FiSend /> {working ? "Sending…" : "Send to Store Manager"}
            </button>
          </div>
        </div>
      )}

      {/* ==================== STORE MANAGER — SENT TO STORE ==================== */}
      {isStoreManager && status === "Sent to Store" && (
        <div className="audit-card no-print">
          <p style={{ marginTop: 0 }}>
            Add the corrective action plan and target date for each finding below, then mark the audit completed.
          </p>
          <div className="audit-actions" style={{ justifyContent: "flex-start", marginTop: 0 }}>
            <button className="audit-btn secondary" onClick={saveActionPlan} disabled={working}>
              <FiSave /> {working ? "Saving…" : "Save Progress"}
            </button>
            <button className="audit-btn" onClick={markCompleted} disabled={working}>
              <FiCheckCircle /> {working ? "Completing…" : "Mark Completed"}
            </button>
          </div>
        </div>
      )}

      {/* ==================== COMPLETED ==================== */}
      {status === "Completed" && (
        <div className="audit-card no-print" style={{ background: "#e4f3ea", borderColor: "#bfe2cd" }}>
          <strong>Audit Completed</strong>
          <p style={{ marginBottom: 0 }}>
            This audit has completed the full review process. Use "Print Report" for the formal document.
          </p>
        </div>
      )}

      {/* ==================== EVALUATIONS TABLE (SCREEN) ==================== */}
      <div className="audit-table-wrap no-print">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Audit Point</th>
              <th>Rating</th>
              <th>Score</th>
              <th>Weight %</th>
              <th>Observation</th>
              <th>Action Plan</th>
              <th>Target Date</th>
            </tr>
          </thead>
          <tbody>
            {draftEvaluations.map((ev, index) => (
              <tr key={ev.EvaluationID}>
                <td>
                  <div className="audit-point-cell">
                    {ev.MajorCriteriaName && <span className="audit-point-major">{ev.MajorCriteriaName}</span>}
                    {ev.SubPointCriteria && <span className="audit-point-sub">{ev.SubPointCriteria}</span>}
                    <p>{ev.AuditComment || `Audit Point #${ev.AuditPointID}`}</p>
                  </div>
                </td>

                <td>
                  {canEditFindings ? (
                    <select value={ev.Rating || ""} onChange={(e) => handleDraftChange(index, "Rating", e.target.value)}>
                      <option value="">Select</option>
                      {RATING_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    ev.Rating || "-"
                  )}
                </td>

                <td>{ev.Score ?? "-"}</td>

                <td>{ev.Percentage !== null && ev.Percentage !== undefined ? `${ev.Percentage}%` : "-"}</td>

                <td>
                  {canEditFindings ? (
                    <textarea value={ev.Observation || ""} onChange={(e) => handleDraftChange(index, "Observation", e.target.value)} placeholder="Enter observation..." />
                  ) : (
                    ev.Observation || "-"
                  )}
                </td>

                <td>
                  {canEditActionPlan ? (
                    <textarea value={ev.ActionPlan || ""} onChange={(e) => handleDraftChange(index, "ActionPlan", e.target.value)} placeholder="Corrective action..." />
                  ) : (
                    ev.ActionPlan || "-"
                  )}
                </td>

                <td>
                  {canEditActionPlan ? (
                    <input type="date" value={toDateInputValue(ev.TargetDate)} onChange={(e) => handleDraftChange(index, "TargetDate", e.target.value)} />
                  ) : (
                    formatDateDisplay(ev.TargetDate)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==================================================================== */}
      {/* PRINT-ONLY FORMAL REPORT                                             */}
      {/* ==================================================================== */}
      <div className="audit-print-report print-only">
        <div className="audit-print-letterhead">
          <div className="audit-print-brand">
            <img src="/images/logo.png" alt="Apparel Group" />
            <div>
              <h2>Apparel Group</h2>
              <span>Store Operations Audit Report</span>
            </div>
          </div>

          <div className="audit-print-rating">
            <span className="audit-print-rating-value">
              {audit.finalpercentage !== null && audit.finalpercentage !== undefined
                ? `${Number(audit.finalpercentage).toFixed(2)}%`
                : "-"}
            </span>
            <span className={`audit-badge ${audit.risklevel || ""}`}>{ratingLabel}</span>
          </div>
        </div>

        <table className="audit-print-meta">
          <tbody>
            <tr>
              <td><span>Store Name</span><strong>{audit.brandname}</strong></td>
              <td><span>Audited By</span><strong>{audit.auditorname}</strong></td>
            </tr>
            <tr>
              <td><span>Store Location</span><strong>{audit.locationname}</strong></td>
              <td><span>Store Manager</span><strong>{audit.storemanagername || "-"}</strong></td>
            </tr>
            <tr>
              <td><span>Store Code</span><strong>{audit.storecode}</strong></td>
              <td><span>Ops Manager</span><strong>{audit.opsmanagername}</strong></td>
            </tr>
            <tr>
              <td><span>Audit Date</span><strong>{formatDateDisplay(audit.auditdate)}</strong></td>
              <td><span>Cashier</span><strong>{audit.cashiername}</strong></td>
            </tr>
          </tbody>
        </table>

        <table className="audit-print-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Main Process</th>
              <th>Rating</th>
              <th>Weight Applied</th>
              <th>Weight Score</th>
              <th>%age Scored</th>
              <th>Auditor Observation / Remarks</th>
              <th>Action Plan</th>
              <th>Target Date</th>
            </tr>
          </thead>
          <tbody>
            {reportSections.map((section) => (
              <React.Fragment key={section.number}>
                <tr className="audit-print-major-row">
                  <td>{section.number}</td>
                  <td colSpan={8}>{section.name}</td>
                </tr>

                {section.subsections.map((sub) => (
                  <React.Fragment key={sub.number}>
                    <tr className="audit-print-sub-row">
                      {/* <td>{sub.number}</td> */}
                      {/* <td colSpan={8}>{sub.name}</td> */}
                    </tr>

                    {sub.items.map((item) => {
                      const weightApplied = item.Weightage !== null && item.Weightage !== undefined ? Number(item.Weightage) : null;
                      const weightScore =
                        weightApplied !== null && item.Percentage !== null && item.Percentage !== undefined
                          ? (weightApplied * Number(item.Percentage)) / 100
                          : null;

                      return (
                        <tr key={item.EvaluationID}>
                          <td>{item.number}</td>
                          <td>{item.AuditComment}</td>
                          <td>{item.Rating || "-"}</td>
                          <td>{weightApplied !== null ? weightApplied.toFixed(2) : "-"}</td>
                          <td>{weightScore !== null ? weightScore.toFixed(2) : "-"}</td>
                          <td>{item.Percentage !== null && item.Percentage !== undefined ? `${item.Percentage}%` : "-"}</td>
                          <td>{item.Observation || "-"}</td>
                          <td>{item.ActionPlan || "-"}</td>
                          <td>{formatDateDisplay(item.TargetDate)}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {cc && (
          <table className="audit-print-meta" style={{ marginTop: 16 }}>
            <tbody>
              <tr>
                <td colSpan={2}>
                  <span>Cash Reconciliation (BHD)</span>
                </td>
              </tr>

              {BHD_DENOMINATIONS.map((d) => {
                const qty = Number(cc.denominations?.[d.key] || 0);
                const amount = qty * d.value;
                if (!qty) return null;
                return (
                  <tr key={d.key}>
                    <td><span>{d.label}</span><strong>{qty}</strong></td>
                    <td><span>Amount</span><strong>{amount.toFixed(3)}</strong></td>
                  </tr>
                );
              })}

              {(cc.foreignCurrency || [])
                .filter((fc) => fc.label || fc.qty)
                .map((fc, i) => (
                  <tr key={`fc-print-${i}`}>
                    <td><span>{fc.label || "FC"}</span><strong>{fc.qty}</strong></td>
                    <td><span>Amount</span><strong>{((Number(fc.qty) || 0) * (Number(fc.value) || 0)).toFixed(3)}</strong></td>
                  </tr>
                ))}

              <tr>
                <td><span>Tills Float</span><strong>{Number(cc.tillFloat || 0).toFixed(3)}</strong></td>
                <td><span>Sale Cash (report)</span><strong>{Number(cc.saleCashPerReport || 0).toFixed(3)}</strong></td>
              </tr>

              {cc.remarks && (
                <tr>
                  <td colSpan={2}>
                    <span>Remarks</span>
                    <strong>{cc.remarks}</strong>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="audit-print-signoff audit-print-signoff-4">
          <div>
            <span>Auditor</span>
            <div className="audit-print-signoff-line" />
            <em>{audit.auditorname}</em>
          </div>
          <div>
            <span>Audit Manager</span>
            <div className="audit-print-signoff-line" />
            <em>&nbsp;</em>
          </div>
          <div>
            <span>Ops Manager</span>
            <div className="audit-print-signoff-line" />
            <em>{audit.opsmanagername}</em>
          </div>
          <div>
            <span>Store Manager</span>
            <div className="audit-print-signoff-line" />
            <em>{audit.storemanagername || ""}</em>
          </div>
        </div>

        <div className="audit-print-footer">
          Apparel Group — Internal Audit &amp; Compliance Division · Confidential
        </div>
      </div>
    </div>
  );
};

export default AuditView;