import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";

import { useAuth } from "../../Authcontext/Authcontext";
import auditPointServices from "../../../services/AuditPointsServices";
import auditServices from "../../../services/AuditorServices";
import "./audit.css";



const RATING_OPTIONS = [
    { value: "S.V", label: "S.V" },
    { value: "NI", label: "NI" },
    { value: "UN", label: "UN" },
    { value: "NA", label: "NA" }
];

const AuditDetails = () => {
    const { user } = useAuth();
    const { storeSerial } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const store = location.state?.store || null;


    const [cashierName, setCashierName] = useState("");
    const [auditDate, setAuditDate] = useState("");
    const [auditOverstation, setAuditOverstation] = useState("");

    const [auditPoints, setAuditPoints] = useState([]);
    const [loadingPoints, setLoadingPoints] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const getAuditPoints = async () => {
            try {
                setLoadingPoints(true);
                const response = await auditPointServices.index();
                const data = response.map((point) => ({
                    id: point.auditpointid,
                    criteria: point.majorcriterianame,
                    subPoint: point.subpointcriteria,
                    auditPoint: point.auditcomment,
                    risk: point.riskmatrix,
                    rating: "",
                    weightage: Number(point.weightage),
                    score: null,
                    percentage: null,
                    observation: ""
                }));
                setAuditPoints(data);
            } catch (error) {
                console.log(error);
                setError("Could not load audit points. Please try again.");
            } finally {
                setLoadingPoints(false);
            }
        };
        getAuditPoints();
    }, []);

    const handleRating = (index, value) => {
        const updated = [...auditPoints];
        updated[index].rating = value;

        if (value === "S.V") {
            updated[index].score = 2;
            updated[index].percentage = 100;
        } else if (value === "NI") {
            updated[index].score = 1;
            updated[index].percentage = 50;
        } else if (value === "UN") {
            updated[index].score = 0;
            updated[index].percentage = 0;
        } else {
            updated[index].score = null;
            updated[index].percentage = null;
        }

        setAuditPoints(updated);
    };

    const handleObservation = (index, value) => {
        const updated = [...auditPoints];
        updated[index].observation = value;
        setAuditPoints(updated);
    };


    const summary = useMemo(() => {
        const rated = auditPoints.filter((p) => p.score !== null);
        const totalScore = rated.reduce((sum, p) => sum + p.score, 0);
        const weightTotal = rated.reduce((sum, p) => sum + p.weightage, 0);
        const weightedSum = rated.reduce(
            (sum, p) => sum + p.percentage * p.weightage,
            0
        );
        const finalPercentage =
            weightTotal > 0 ? weightedSum / weightTotal : null;

        let riskLevel = null;
        if (finalPercentage !== null) {
            if (finalPercentage >= 90) riskLevel = "Low";
            else if (finalPercentage >= 75) riskLevel = "Moderate";
            else riskLevel = "High";
        }

        return {
            totalScore,
            finalPercentage,
            riskLevel,
            ratedCount: rated.length,
            totalCount: auditPoints.length
        };
    }, [auditPoints]);

    const validate = () => {
        if (!cashierName.trim()) return "Please enter the cashier name."
        ;
        if (!auditDate) return "Please select an audit date.";

        if (!store) return "Store information is missing — go back and select a store.";

        if (!user?.UserID)
            return "You must be logged in as an auditor to submit an audit.";

        if (auditPoints.some((p) => !p.rating))
            return "Please rate every audit point (use NA if not applicable).";

        return "";
    };

    const submitAudit = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            const opsManagerID =
                store.opsmanagerid || store.OpsManagerID;

                const payload = {
                storeSerial:
                    Number(storeSerial),
                opsManagerID,
                auditorID: user.UserID,
                cashierName,
                auditDate,
                auditOverstation,
                auditPoints: auditPoints.map((p) => ({
                    id: p.id,
                    rating: p.rating,
                    score: p.score,
                    percentage: p.percentage,
                    percentageWeightage: p.weightage,
                    observation: p.observation
                }))
            };
            const result = await auditServices.create(payload);
            navigate(`/Audits/${result.assignmentID}`, {
                state: { justCreated: true }
            });
        } catch (error) {
            console.log(error);
            setError("Failed to submit the audit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="audit-page">
            <div className="audit-header">
                <div>
                    <h1>Audit Details</h1>
                    <p className="subtitle">
                        {store
                            ? `${store.storecode || store.StoreCode} — ${
                                  store.brandname || store.BrandName
                              }`
                            : `Store #${storeSerial}`}
                    </p>
                </div>
                <Link to="/audit" className="audit-btn secondary">
                    Change Store
                </Link>
            </div>

            {error && <div className="audit-error">{error}</div>}

            <div className="audit-card">
                <div className="audit-field-row">
                    <div className="audit-field">
                        <label>Cashier Name</label>
                        <input
                            type="text"
                            value={cashierName}
                            placeholder="e.g. Ali"
                            onChange={(e) => setCashierName(e.target.value)}
                        />
                    </div>

                    <div className="audit-field">
                        <label>Audit Date</label>
                        <input
                            type="date"
                            value={auditDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setAuditDate(e.target.value)}
                        />
                    </div>

                    <div className="audit-field">
                        <label>Additional Notes / Overstation</label>
                        <input
                            type="text"
                            value={auditOverstation}
                            placeholder="Optional"
                            onChange={(e) =>
                                setAuditOverstation(e.target.value)
                            }
                        />
                    </div>
                </div>
            </div>

            {loadingPoints ? (
                <div className="audit-empty">Loading audit points…</div>
            ) : (
                <div className="audit-table-wrap">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Criteria</th>
                                <th>Sub Point</th>
                                <th>Audit Point</th>
                                <th>Risk Matrix</th>
                                <th>Rating</th>
                                <th>Weightage</th>
                                <th>Score</th>
                                <th>Weight %</th>
                                <th>Observation</th>
                            </tr>
                        </thead>

                        <tbody>
                            {auditPoints.map((point, index) => (
                                <tr key={point.id}>
                                    <td>{point.criteria}</td>
                                    <td>{point.subPoint}</td>
                                    <td>{point.auditPoint}</td>
                                    <td>{point.risk}</td>
                                    <td>
                                        <select
                                            value={point.rating}
                                            onChange={(e) =>
                                                handleRating(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">Select</option>
                                            {RATING_OPTIONS.map((opt) => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>{point.weightage}</td>
                                    <td>
                                        {point.score !== null
                                            ? point.score.toFixed(2)
                                            : "-"}
                                    </td>
                                    <td>
                                        {point.percentage !== null
                                            ? `${point.percentage}%`
                                            : "-"}
                                    </td>
                                    <td>
                                        <textarea
                                            value={point.observation}
                                            placeholder="Write..."
                                            onChange={(e) =>
                                                handleObservation(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="audit-card" style={{ marginTop: 20 }}>
                <div className="audit-store-summary">
                    <div className="audit-store-item">
                        <span>Points Rated</span>
                        <strong>
                            {summary.ratedCount}/{summary.totalCount}
                        </strong>
                    </div>
                    <div className="audit-store-item">
                        <span>Total Score</span>
                        <strong>{summary.totalScore.toFixed(2)}</strong>
                    </div>
                    <div className="audit-store-item">
                        <span>Final Percentage</span>
                        <strong>
                            {summary.finalPercentage !== null
                                ? `${summary.finalPercentage.toFixed(2)}%`
                                : "-"}
                        </strong>
                    </div>
                    <div className="audit-store-item">
                        <span>Risk Level</span>
                        <strong>
                            {summary.riskLevel && (
                                <span
                                    className={`audit-badge ${summary.riskLevel}`}
                                >
                                    {summary.riskLevel}
                                </span>
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="audit-actions">
                <button
                    className="audit-btn"
                    onClick={submitAudit}
                    disabled={submitting || loadingPoints}
                >
                    {submitting ? "Submitting…" : "Submit Audit"}
                </button>
            </div>
        </div>
    );
};

export default AuditDetails;