import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";

import auditServices from "../../../services/AuditorServices";
import { useAuth } from "../../Authcontext/Authcontext";
import "./audit.css";


const STATUS_OPTIONS = [
    "Completed",
    "Reviewed",
    "Approved",
    "Needs Follow-up",
    "Rejected"
];

const AuditView = () => {
    const { id } = useParams();
    const location = useLocation();
    const { user } = useAuth();

    const canChangeStatus = user?.RoleID === 1 || user?.RoleID === 2;

    const [audit, setAudit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savingStatus, setSavingStatus] = useState(false);

    useEffect(() => {
        const loadAudit = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await auditServices.show(id);
                setAudit(data);
            } catch (error) {
                console.log(error);
                setError("Could not load this audit.");
            } finally {
                setLoading(false);
            }
        };
        loadAudit();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        if (!newStatus || newStatus === audit.status) return;

        try {
            setSavingStatus(true);
            setError("");
            const updated = await auditServices.update(id, {
                status: newStatus
            });
            setAudit((prev) => ({ ...prev, status: updated.status }));
        } catch (error) {
            console.log(error);
            setError("Could not update the status. Please try again.");
        } finally {
            setSavingStatus(false);
        }
    };

    if (loading) {
        return (
            <div className="audit-page">
                <div className="audit-empty">Loading audit…</div>
            </div>
        );
    }

    if (error || !audit) {
        return (
            <div className="audit-page">
                <div className="audit-error">
                    {error || "Audit not found."}
                </div>
                <Link to="/Audits" className="audit-btn secondary">
                    Back to Audits
                </Link>
            </div>
        );
    }

    return (
        <div className="audit-page">
            <div className="audit-header">
                <div>
                    <h1>
                        {audit.storecode} — {audit.brandname}
                    </h1>
                    <p className="subtitle">
                        {audit.locationname} · Audited{" "}
                        {new Date(audit.auditdate).toLocaleDateString()}
                    </p>
                </div>
                <Link to="/Audits" className="audit-btn secondary">
                    Back to Audits
                </Link>
            </div>

            {location.state?.justCreated && (
                <div
                    className="audit-card"
                    style={{
                        background: "#e4f3ea",
                        borderColor: "#bfe2cd"
                    }}
                >
                    Audit submitted successfully.
                </div>
            )}

            <div className="audit-card">
                <div className="audit-store-summary">
                    <div className="audit-store-item">
                        <span>Cashier</span>
                        <strong>{audit.cashiername}</strong>
                    </div>
                    <div className="audit-store-item">
                        <span>Ops Manager</span>
                        <strong>{audit.opsmanagername}</strong>
                    </div>
                    <div className="audit-store-item">
                        <span>Auditor</span>
                        <strong>{audit.auditorname}</strong>
                    </div>
                    <div className="audit-store-item">
                        <span>Status</span>
                        {canChangeStatus ? (
                            <select
                                value={audit.status}
                                onChange={(e) =>
                                    handleStatusChange(e.target.value)
                                }
                                disabled={savingStatus}
                            >
                                {!STATUS_OPTIONS.includes(audit.status) && (
                                    <option value={audit.status}>
                                        {audit.status}
                                    </option>
                                )}
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <strong>{audit.status}</strong>
                        )}
                    </div>
                    <div className="audit-store-item">
                        <span>Total Score</span>
                        <strong>{audit.totalscore ?? "-"}</strong>
                    </div>
                    <div className="audit-store-item">
                        <span>Final Percentage</span>
                        <strong>
                            {audit.finalpercentage !== null
                                ? `${Number(audit.finalpercentage).toFixed(
                                      2
                                  )}%`
                                : "-"}
                        </strong>
                    </div>
                    <div className="audit-store-item">
                        <span>Risk Level</span>
                        <strong>
                            {audit.risklevel && (
                                <span
                                    className={`audit-badge ${audit.risklevel}`}
                                >
                                    {audit.risklevel}
                                </span>
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="audit-table-wrap">
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>Audit Point ID</th>
                            <th>Rating</th>
                            <th>Score</th>
                            <th>Weight %</th>
                            <th>Observation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audit.evaluations.map((ev) => (
                            <tr key={ev.EvaluationID}>
                                <td>{ev.AuditPointID}</td>
                                <td>{ev.Rating}</td>
                                <td>{ev.Score ?? "-"}</td>
                                <td>
                                    {ev.Percentage !== null
                                        ? `${ev.Percentage}%`
                                        : "-"}
                                </td>
                                <td>{ev.Observation || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditView;