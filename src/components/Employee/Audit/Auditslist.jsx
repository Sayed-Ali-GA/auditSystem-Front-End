import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import auditServices from "../../../services/AuditorServices";
import { useAuth } from "../../Authcontext/Authcontext";
import "./audit.css";

const AuditsList = () => {
    const { user } = useAuth();
    const canDelete = user?.RoleID === 1;

    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const loadAudits = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await auditServices.index();
            setAudits(data);
        } catch (error) {
            console.log(error);
            setError("Could not load audits. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAudits();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this audit? This cannot be undone.")) {
            return;
        }

        try {
            setDeletingId(id);
            await auditServices.remove(id);
            setAudits((prev) =>
                prev.filter((a) => a.assignmentid !== id)
            );
        } catch (error) {
            console.log(error);
            setError("Could not delete the audit. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="audit-page">
            <div className="audit-header">
                <div>
                    <h1>Audits</h1>
                    <p className="subtitle">
                        All audits submitted so far.
                    </p>
                </div>
                <Link to="/audit" className="audit-btn">
                    + New Audit
                </Link>
            </div>

            {error && <div className="audit-error">{error}</div>}

            {loading ? (
                <div className="audit-empty">Loading audits…</div>
            ) : audits.length === 0 ? (
                <div className="audit-empty">
                    No audits yet. Start your first one.
                </div>
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
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {audits.map((audit) => (
                                <tr key={audit.assignmentid}>
                                    <td>
                                        {new Date(
                                            audit.auditdate
                                        ).toLocaleDateString()}
                                    </td>
                                    <td>{audit.storecode}</td>
                                    <td>{audit.brandname}</td>
                                    <td>{audit.locationname}</td>
                                    <td>{audit.cashiername}</td>
                                    <td>{audit.auditorname}</td>
                                    <td>{audit.status}</td>
                                    <td>
                                        {audit.finalpercentage !== null
                                            ? `${Number(
                                                  audit.finalpercentage
                                              ).toFixed(2)}%`
                                            : "-"}
                                    </td>
                                    <td>
                                        {audit.risklevel && (
                                            <span
                                                className={`audit-badge ${audit.risklevel}`}
                                            >
                                                {audit.risklevel}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        <Link
                                            to={`/Audits/${audit.assignmentid}`}
                                            className="audit-btn secondary"
                                        >
                                            View
                                        </Link>{" "}
                                        {canDelete && (
                                            <button
                                                className="audit-btn danger"
                                                onClick={() =>
                                                    handleDelete(
                                                        audit.assignmentid
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    audit.assignmentid
                                                }
                                            >
                                                {deletingId ===
                                                audit.assignmentid
                                                    ? "Deleting…"
                                                    : "Delete"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditsList;