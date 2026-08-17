import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import Swal from "sweetalert2";

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

const emptyCashCount = () => ({
    denominations: BHD_DENOMINATIONS.reduce(
        (acc, d) => ({ ...acc, [d.key]: 0 }),
        {}
    ),
    foreignCurrency: [
        { label: "", qty: 0, value: 0 },
        { label: "", qty: 0, value: 0 },
        { label: "", qty: 0, value: 0 },
    ],
    tillFloat: 0,
    saleCashPerReport: 0,
    remarks: "",
});

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

const AuditDetails = () => {
    const { user } = useAuth();
    const { storeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const draftId = searchParams.get("draftId");
    const store = location.state?.store || null;

    const [cashierName, setCashierName] = useState("");
    const [auditDate, setAuditDate] = useState("");
    const [auditOverstation, setAuditOverstation] = useState("");

    const [auditPoints, setAuditPoints] = useState([]);
    const [loadingPoints, setLoadingPoints] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [cashCount, setCashCount] = useState(emptyCashCount());

    useEffect(() => {
        const init = async () => {
            try {
                setLoadingPoints(true);
                setError("");

                const pointsResponse = await auditPointServices.index();

                let existingDraft = null;
                if (draftId) {
                    existingDraft = await auditServices.show(draftId);
                }

                const evalMap = new Map();
                if (existingDraft?.evaluations) {
                    existingDraft.evaluations.forEach((ev) => {
                        evalMap.set(ev.AuditPointID, ev);
                    });
                }

                const data = pointsResponse.map((point) => {
                    const existing = evalMap.get(point.auditpointid);
                    return {
                        id: point.auditpointid,
                        criteria: point.majorcriterianame,
                        subPoint: point.subpointcriteria,
                        auditPoint: point.auditcomment,
                        risk: point.riskmatrix,
                        rating: existing?.Rating || "",
                        weightage: Number(point.weightage),
                        score: existing?.Score ?? null,
                        percentage: existing?.Percentage ?? null,
                        observation: existing?.Observation || ""
                    };
                });

                setAuditPoints(data);

                if (existingDraft) {
                    setCashierName(existingDraft.cashiername || "");
                    setAuditDate(
                        existingDraft.auditdate
                            ? new Date(existingDraft.auditdate).toISOString().split("T")[0]
                            : ""
                    );

                    if (existingDraft.cashcount) {
                        setCashCount({ ...emptyCashCount(), ...existingDraft.cashcount });
                    }
                }
            } catch (err) {
                console.log(err);
                setError("Could not load audit points. Please try again.");
            } finally {
                setLoadingPoints(false);
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftId]);

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

    const handleDenomChange = (key, value) => {
        setCashCount((prev) => ({
            ...prev,
            denominations: { ...prev.denominations, [key]: value },
        }));
    };

    const handleFcChange = (index, field, value) => {
        setCashCount((prev) => {
            const updated = [...prev.foreignCurrency];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, foreignCurrency: updated };
        });
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
            else if (finalPercentage > 70) riskLevel = "Moderate";
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

    const cashSummary = useMemo(() => {
        const denomTotal = BHD_DENOMINATIONS.reduce(
            (sum, d) =>
                sum + (Number(cashCount.denominations[d.key]) || 0) * d.value,
            0
        );

        const fcTotal = cashCount.foreignCurrency.reduce(
            (sum, fc) => sum + (Number(fc.qty) || 0) * (Number(fc.value) || 0),
            0
        );

        const totalWithCashier = denomTotal + fcTotal;

        const totalAsPerReport =
            (Number(cashCount.tillFloat) || 0) +
            (Number(cashCount.saleCashPerReport) || 0);

        return {
            totalWithCashier,
            totalAsPerReport,
            difference: totalWithCashier - totalAsPerReport,
        };
    }, [cashCount]);

    const validate = () => {
        if (!cashierName.trim()) return "Please enter the cashier name.";
        if (!auditDate) return "Please select an audit date.";
        if (!draftId && !store)
            return "Store information is missing — go back and select a store.";
        if (!user?.UserID)
            return "You must be logged in as an auditor to submit an audit.";
        if (auditPoints.some((p) => !p.rating))
            return "Please rate every audit point (use NA if not applicable).";
        return "";
    };

    const buildEvaluationsPayload = () =>
        auditPoints.map((p) => ({
            AuditPointID: p.id,
            Rating: p.rating || null,
            Score: p.score,
            Percentage: p.percentage,
            Observation: p.observation
        }));

    const saveDraft = async () => {
        if (!draftId && !store) {
            setError("Store information is missing — go back and select a store.");
            return;
        }

        setError("");
        setSaving(true);

        try {
            if (draftId) {
                await auditServices.update(draftId, {
                    cashierName: cashierName || null,
                    auditDate: auditDate || null,
                    status: "Draft",
                    evaluations: buildEvaluationsPayload(),
                    cashCount
                });
                notify("success", "Draft saved.");
            } else {
                const opsManagerID = store.opsmanagerid || store.OpsManagerID;

                const payload = {
                    storeSerial: Number(storeId),
                    opsManagerID,
                    auditorID: user.UserID,
                    cashierName,
                    auditDate,
                    auditOverstation,
                    status: "Draft",
                    cashCount,
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
                setSearchParams({ draftId: String(result.assignmentID) });
                notify("success", "Draft saved. You can continue anytime from 'Start an Audit'.");
            }
        } catch (err) {
            console.log(err);
            setError("Failed to save draft. Please try again.");
            notify("error", "Failed to save draft.");
        } finally {
            setSaving(false);
        }
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
            let assignmentId = draftId;

            if (draftId) {
                await auditServices.update(draftId, {
                    cashierName,
                    auditDate,
                    auditOverstation,
                    status: "Submitted",
                    evaluations: buildEvaluationsPayload(),
                    cashCount
                });
            } else {
                const opsManagerID = store.opsmanagerid || store.OpsManagerID;

                const payload = {
                    storeSerial: Number(storeId),
                    opsManagerID,
                    auditorID: user.UserID,
                    cashierName,
                    auditDate,
                    auditOverstation,
                    status: "Submitted",
                    cashCount,
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
                assignmentId = result.assignmentID;
            }

            navigate(`/Audits/${assignmentId}`, { state: { justCreated: true } });
        } catch (err) {
            console.log(err);
            setError("Failed to submit the audit. Please try again.");
            notify("error", "Failed to submit the audit.");
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
                            : `Store #${storeId}`}
                    </p>
                </div>
                <Link to="/audit" className="audit-btn secondary">
                    Change Store
                </Link>
            </div>

            {draftId && (
                <div className="audit-draft-status-banner">
                    📝 You're editing a saved draft. Your progress is preserved — save
                    anytime and come back later.
                </div>
            )}

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
                            onChange={(e) => setAuditDate(e.target.value)}
                        />
                    </div>

                    <div className="audit-field">
                        <label>Additional Notes / Overstation</label>
                        <input
                            type="text"
                            value={auditOverstation}
                            placeholder="Optional"
                            onChange={(e) => setAuditOverstation(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="audit-card">
                <h3 style={{ marginTop: 0 }}>Cash Count (BHD)</h3>

                <div className="audit-table-wrap">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Denomination</th>
                                <th>Qty</th>
                                <th>Amount (BHD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {BHD_DENOMINATIONS.map((d) => (
                                <tr key={d.key}>
                                    <td>{d.label}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            value={cashCount.denominations[d.key]}
                                            onChange={(e) =>
                                                handleDenomChange(d.key, e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        {(
                                            (Number(cashCount.denominations[d.key]) || 0) *
                                            d.value
                                        ).toFixed(3)}
                                    </td>
                                </tr>
                            ))}

                            {cashCount.foreignCurrency.map((fc, i) => (
                                <tr key={`fc-${i}`}>
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="FC currency"
                                            value={fc.label}
                                            onChange={(e) =>
                                                handleFcChange(i, "label", e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Qty"
                                            value={fc.qty}
                                            onChange={(e) =>
                                                handleFcChange(i, "qty", e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Value in BHD"
                                            value={fc.value}
                                            onChange={(e) =>
                                                handleFcChange(i, "value", e.target.value)
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="audit-store-summary" style={{ marginTop: 14 }}>
                    <div className="audit-field">
                        <label>Tills Float</label>
                        <input
                            type="number"
                            value={cashCount.tillFloat}
                            onChange={(e) =>
                                setCashCount((p) => ({ ...p, tillFloat: e.target.value }))
                            }
                        />
                    </div>

                    <div className="audit-field">
                        <label>Sale Cash (per report)</label>
                        <input
                            type="number"
                            value={cashCount.saleCashPerReport}
                            onChange={(e) =>
                                setCashCount((p) => ({
                                    ...p,
                                    saleCashPerReport: e.target.value
                                }))
                            }
                        />
                    </div>

                    <div className="audit-store-item">
                        <span>Total Cash with Cashier</span>
                        <strong>{cashSummary.totalWithCashier.toFixed(3)} BHD</strong>
                    </div>

                    <div className="audit-store-item">
                        <span>Total Cash as per Report</span>
                        <strong>{cashSummary.totalAsPerReport.toFixed(3)} BHD</strong>
                    </div>

                    <div className="audit-store-item">
                        <span>Difference (Excess/Shortage)</span>
                        <strong
                            style={{
                                color:
                                    cashSummary.difference === 0 ?    "#c94f4f" :  "#1f7a4d"  
                            }}
                        >
                            {cashSummary.difference.toFixed(3)} BHD
                        </strong>
                    </div>
                </div>

                <div className="audit-field" style={{ marginTop: 12 }}>
                    <label>Remarks (if any)</label>
                    <textarea
                        value={cashCount.remarks}
                        onChange={(e) =>
                            setCashCount((p) => ({ ...p, remarks: e.target.value }))
                        }
                    />
                </div>
            </div>

            {loadingPoints ? (
                <div className="audit-empty">Loading audit points…</div>
            ) : (
                <div className="audit-table-wrap">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                 <th>Sub Point</th>
                                <th>Criteria</th>                              
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
                                     <td>{point.subPoint}</td>
                                    <td>{point.criteria}</td>
                                    <td>{point.auditPoint}</td>
                                    <td>{point.risk}</td>
                                    <td>
                                        <select
                                            value={point.rating}
                                            onChange={(e) => handleRating(index, e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            {RATING_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>{point.weightage}</td>
                                    <td>{point.score !== null ? point.score.toFixed(2) : "-"}</td>
                                    <td>
                                        {point.percentage !== null ? `${point.percentage}%` : "-"}
                                    </td>
                                    <td>
                                        <textarea
                                            value={point.observation}
                                            placeholder="Write..."
                                            onChange={(e) => handleObservation(index, e.target.value)}
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
                                <span className={`audit-badge ${summary.riskLevel}`}>
                                    {summary.riskLevel === "Low"
                                        ? "SATISFACTORY"
                                        : summary.riskLevel === "Moderate"
                                        ? "NEEDS IMPROVEMENT"
                                        : "UNSATISFACTORY"}
                                </span>
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="audit-actions">
                <button
                    className="audit-btn secondary"
                    onClick={saveDraft}
                    disabled={saving || submitting || loadingPoints}
                >
                    {saving ? "Saving…" : "Save Draft"}
                </button>

                <button
                    className="audit-btn"
                    onClick={submitAudit}
                    disabled={submitting || saving || loadingPoints}
                >
                    {submitting ? "Submitting…" : "Submit Audit"}
                </button>
            </div>
        </div>
    );
};

export default AuditDetails;