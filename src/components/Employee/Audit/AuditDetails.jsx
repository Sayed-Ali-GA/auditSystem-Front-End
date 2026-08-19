import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FiDollarSign,
    FiEdit3,
    FiX,
    FiPlus,
    FiTrash2,
    FiUser,
    FiUsers,
    FiCalendar,
    FiFileText,
    FiMinus,
    FiCheckCircle,
    FiAlertTriangle,
} from "react-icons/fi";

import { useAuth } from "../../Authcontext/Authcontext";
import auditPointServices from "../../../services/AuditPointsServices";
import auditServices from "../../../services/AuditorServices";
import "./audit.css";

const RATING_OPTIONS = [
    { value: "S.V", label: "S.V", full: "Satisfactory", cssKey: "SV" },
    { value: "NI", label: "NI", full: "Needs Improvement", cssKey: "NI" },
    { value: "UN", label: "UN", full: "Unsatisfactory", cssKey: "UN" },
    { value: "NA", label: "NA", full: "Not Applicable", cssKey: "NA" },
];

const BHD_DENOMINATIONS = [
    { key: "20", label: "20", value: 20, kind: "note", image: "/images/20BD.png" },
    { key: "10", label: "10", value: 10, kind: "note", image: "/images/10BD.png" },
    { key: "5", label: "5", value: 5, kind: "note", image: "/images/5BD.png" },
    { key: "1", label: "1", value: 1, kind: "note", image: "/images/1BD.png" },
    { key: "0.500", label: "0.500", value: 0.5, kind: "note", image: "/images/0.500BD.png" },
    { key: "0.100", label: "0.100", value: 0.1, kind: "coin", image: "/images/0.100Fils.png" },
    { key: "0.050", label: "0.050", value: 0.05, kind: "coin", image: "/images/0.50Fils.png" },
    { key: "0.025", label: "0.025", value: 0.025, kind: "coin", image: "/images/0.025Fils.png" },
    { key: "0.010", label: "0.010", value: 0.01, kind: "coin", image: "/images/0.010Fils.png" },
];

// Empty cash-count shape for ONE cashier (their own till)
const emptyCashierCount = () => ({
    denominations: BHD_DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d.key]: 0 }), {}),
    foreignCurrency: [
        { label: "", qty: 0, value: 0 },
        { label: "", qty: 0, value: 0 },
        { label: "", qty: 0, value: 0 },
    ],
    tillFloat: 0,
    saleCashPerReport: 0,
    // B. Paid Bills / IOUs
    paidBills: [
        { particular: "", amount: 0 },
        { particular: "", amount: 0 },
        { particular: "", amount: 0 },
        { particular: "", amount: 0 },
    ],
    // C. Statements Sent for Reimbursement to Office
    reimbursements: [
        { particular: "", amount: 0 },
        { particular: "", amount: 0 },
    ],
    remarks: "",
});

const emptyCashier = (name = "") => ({
    name,
    ...emptyCashierCount(),
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

// Parses the legacy single "CashierName" string into a list of names
const parseCashierNames = (value) => {
    const names = String(value || "")
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);

    return names.length > 0 ? names : [""];
};

const ratingCssKey = (rating) => {
    const found = RATING_OPTIONS.find((opt) => opt.value === rating);
    return found ? found.cssKey : "none";
};

// A = physical cash counted, B = paid bills/IOUs, C = reimbursement
// statements sent to office. Grand Total (A+B+C) is compared against
// the report figures (Till Float + Sale Cash) to get the difference.
const computeCashierSummary = (cashier) => {
    const denomTotal = BHD_DENOMINATIONS.reduce(
        (sum, d) => sum + (Number(cashier.denominations[d.key]) || 0) * d.value,
        0
    );

    const fcTotal = (cashier.foreignCurrency || []).reduce(
        (sum, fc) => sum + (Number(fc.qty) || 0) * (Number(fc.value) || 0),
        0
    );

    const totalWithCashier = denomTotal + fcTotal; // Total Cash (A)

    const paidBillsTotal = (cashier.paidBills || []).reduce(
        (sum, b) => sum + (Number(b.amount) || 0),
        0
    ); // Total (B)

    const reimbursementsTotal = (cashier.reimbursements || []).reduce(
        (sum, r) => sum + (Number(r.amount) || 0),
        0
    ); // Total (C)

    const grandTotal = totalWithCashier + paidBillsTotal + reimbursementsTotal; // A+B+C

    const totalAsPerReport =
        (Number(cashier.tillFloat) || 0) + (Number(cashier.saleCashPerReport) || 0);

    const difference = grandTotal - totalAsPerReport;

    return {
        denomTotal,
        fcTotal,
        totalWithCashier,
        paidBillsTotal,
        reimbursementsTotal,
        grandTotal,
        totalAsPerReport,
        difference,
    };
};

const AuditDetails = () => {
    const { user } = useAuth();
    const { storeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const draftId = searchParams.get("draftId");
    const store = location.state?.store || null;

    // Each entry: { name, denominations, foreignCurrency, tillFloat,
    // saleCashPerReport, paidBills, reimbursements, remarks }
    const [cashiers, setCashiers] = useState([emptyCashier()]);
    const [activeCashierIndex, setActiveCashierIndex] = useState(0);

    const [auditDate, setAuditDate] = useState("");
    const [auditOverstation, setAuditOverstation] = useState("");

    const [auditPoints, setAuditPoints] = useState([]);
    const [loadingPoints, setLoadingPoints] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [activeObservationIndex, setActiveObservationIndex] = useState(null);
    const [cashModalOpen, setCashModalOpen] = useState(false);

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
                    const names = parseCashierNames(existingDraft.cashiername);
                    const saved = existingDraft.cashcount;

                    let loadedCashiers;

                    if (Array.isArray(saved) && saved.length > 0) {
                        // New multi-cashier format
                        loadedCashiers = saved.map((c, i) => ({
                            name: c.name || names[i] || "",
                            denominations: {
                                ...emptyCashierCount().denominations,
                                ...(c.denominations || {}),
                            },
                            foreignCurrency:
                                c.foreignCurrency && c.foreignCurrency.length
                                    ? c.foreignCurrency
                                    : emptyCashierCount().foreignCurrency,
                            tillFloat: c.tillFloat ?? 0,
                            saleCashPerReport: c.saleCashPerReport ?? 0,
                            paidBills:
                                c.paidBills && c.paidBills.length
                                    ? c.paidBills
                                    : emptyCashierCount().paidBills,
                            reimbursements:
                                c.reimbursements && c.reimbursements.length
                                    ? c.reimbursements
                                    : emptyCashierCount().reimbursements,
                            remarks: c.remarks || "",
                        }));
                    } else if (saved && typeof saved === "object") {
                        // Legacy single-till format — assign it to the first cashier
                        loadedCashiers = names.map((name, i) => ({
                            name,
                            denominations:
                                i === 0
                                    ? { ...emptyCashierCount().denominations, ...(saved.denominations || {}) }
                                    : emptyCashierCount().denominations,
                            foreignCurrency:
                                i === 0 && saved.foreignCurrency
                                    ? saved.foreignCurrency
                                    : emptyCashierCount().foreignCurrency,
                            tillFloat: i === 0 ? saved.tillFloat ?? 0 : 0,
                            saleCashPerReport: i === 0 ? saved.saleCashPerReport ?? 0 : 0,
                            paidBills: emptyCashierCount().paidBills,
                            reimbursements: emptyCashierCount().reimbursements,
                            remarks: i === 0 ? saved.remarks || "" : "",
                        }));
                    } else {
                        loadedCashiers = names.map((name) => emptyCashier(name));
                    }

                    setCashiers(loadedCashiers.length ? loadedCashiers : [emptyCashier()]);

                    setAuditDate(
                        existingDraft.auditdate
                            ? new Date(existingDraft.auditdate).toISOString().split("T")[0]
                            : ""
                    );
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

    const openObservationModal = (index) => setActiveObservationIndex(index);
    const closeObservationModal = () => setActiveObservationIndex(null);

    // ---------------------------------------------------------------
    // Cashiers — each one has their own name + their own cash till
    // ---------------------------------------------------------------
    const handleCashierNameChange = (index, value) => {
        setCashiers((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], name: value };
            return updated;
        });
    };

    const addCashier = () => {
        setCashiers((prev) => [...prev, emptyCashier()]);
        setActiveCashierIndex(cashiers.length); // focus the newly added one
    };

    const removeCashier = (index) => {
        setCashiers((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((_, i) => i !== index);
        });

        setActiveCashierIndex((prev) => {
            if (index < prev) return prev - 1;
            if (index === prev) return Math.max(0, prev - 1);
            return prev;
        });
    };

    const cashierNameString = useMemo(
        () =>
            cashiers
                .map((c) => (c.name || "").trim())
                .filter(Boolean)
                .join(", "),
        [cashiers]
    );

    const handleDenomChange = (cashierIndex, key, value) => {
        setCashiers((prev) => {
            const updated = [...prev];
            updated[cashierIndex] = {
                ...updated[cashierIndex],
                denominations: { ...updated[cashierIndex].denominations, [key]: value },
            };
            return updated;
        });
    };

    const stepDenom = (cashierIndex, key, delta) => {
        setCashiers((prev) => {
            const updated = [...prev];
            const current = Number(updated[cashierIndex].denominations[key]) || 0;
            const next = Math.max(0, current + delta);
            updated[cashierIndex] = {
                ...updated[cashierIndex],
                denominations: { ...updated[cashierIndex].denominations, [key]: next },
            };
            return updated;
        });
    };

    const handleFcChange = (cashierIndex, fcIndex, field, value) => {
        setCashiers((prev) => {
            const updated = [...prev];
            const fcList = [...updated[cashierIndex].foreignCurrency];
            fcList[fcIndex] = { ...fcList[fcIndex], [field]: value };
            updated[cashierIndex] = { ...updated[cashierIndex], foreignCurrency: fcList };
            return updated;
        });
    };

    const handleCashierFieldChange = (cashierIndex, field, value) => {
        setCashiers((prev) => {
            const updated = [...prev];
            updated[cashierIndex] = { ...updated[cashierIndex], [field]: value };
            return updated;
        });
    };

    // Generic handler for the B/C "particulars" line-item lists
    const handleParticularChange = (cashierIndex, listName, rowIndex, field, value) => {
        setCashiers((prev) => {
            const updated = [...prev];
            const list = [...(updated[cashierIndex][listName] || [])];
            list[rowIndex] = { ...list[rowIndex], [field]: value };
            updated[cashierIndex] = { ...updated[cashierIndex], [listName]: list };
            return updated;
        });
    };

    const addParticularRow = (cashierIndex, listName) => {
        setCashiers((prev) => {
            const updated = [...prev];
            const list = [...(updated[cashierIndex][listName] || [])];
            list.push({ particular: "", amount: 0 });
            updated[cashierIndex] = { ...updated[cashierIndex], [listName]: list };
            return updated;
        });
    };

    const removeParticularRow = (cashierIndex, listName, rowIndex) => {
        setCashiers((prev) => {
            const updated = [...prev];
            const list = [...(updated[cashierIndex][listName] || [])];
            if (list.length <= 1) return prev;
            list.splice(rowIndex, 1);
            updated[cashierIndex] = { ...updated[cashierIndex], [listName]: list };
            return updated;
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

    // Per-cashier summaries + a combined total across every cashier
    const cashierSummaries = useMemo(
        () => cashiers.map(computeCashierSummary),
        [cashiers]
    );

    const overallCashSummary = useMemo(
        () =>
            cashierSummaries.reduce(
                (acc, s) => ({
                    totalWithCashier: acc.totalWithCashier + s.totalWithCashier,
                    paidBillsTotal: acc.paidBillsTotal + s.paidBillsTotal,
                    reimbursementsTotal: acc.reimbursementsTotal + s.reimbursementsTotal,
                    grandTotal: acc.grandTotal + s.grandTotal,
                    totalAsPerReport: acc.totalAsPerReport + s.totalAsPerReport,
                    difference: acc.difference + s.difference,
                }),
                {
                    totalWithCashier: 0,
                    paidBillsTotal: 0,
                    reimbursementsTotal: 0,
                    grandTotal: 0,
                    totalAsPerReport: 0,
                    difference: 0,
                }
            ),
        [cashierSummaries]
    );

    const safeActiveIndex = Math.min(activeCashierIndex, cashiers.length - 1);
    const activeCashier = cashiers[safeActiveIndex] || emptyCashier();
    const activeCashierSummary = cashierSummaries[safeActiveIndex] || computeCashierSummary(activeCashier);

    const riskLabel =
        summary.riskLevel === "Low"
            ? "SATISFACTORY"
            : summary.riskLevel === "Moderate"
            ? "NEEDS IMPROVEMENT"
            : summary.riskLevel === "High"
            ? "UNSATISFACTORY"
            : "Not rated yet";

    const validate = () => {
        if (!cashierNameString) return "Please enter at least one cashier name.";
        if (!auditDate) return "Please select an audit date.";
        if (!draftId && !store)
            return "Store information is missing — go back and select a store.";
        if (!user?.UserID)
            return "You must be logged in as an auditor to submit an audit.";
        if (auditPoints.some((p) => !p.rating))
            return "Please rate every audit point (use NA if not applicable).";
        return "";
    };


    const getLocalDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const today = getLocalDate();


    const buildEvaluationsPayload = () =>
        auditPoints.map((p) => ({
            AuditPointID: p.id,
            Rating: p.rating || null,
            Score: p.score,
            Percentage: p.percentage,
            Observation: p.observation
        }));

    // What gets stored in the CashCount column — one entry per cashier
    const buildCashCountPayload = () =>
        cashiers.map((c) => ({
            name: (c.name || "").trim(),
            denominations: c.denominations,
            foreignCurrency: c.foreignCurrency,
            tillFloat: c.tillFloat,
            saleCashPerReport: c.saleCashPerReport,
            paidBills: c.paidBills,
            reimbursements: c.reimbursements,
            remarks: c.remarks,
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
                    cashierName: cashierNameString || null,
                    auditDate: auditDate || null,
                    status: "Draft",
                    evaluations: buildEvaluationsPayload(),
                    cashCount: buildCashCountPayload()
                });
                notify("success", "Draft saved.");
            } else {
                const opsManagerID = store.opsmanagerid || store.OpsManagerID;

                const payload = {
                    storeSerial: Number(storeId),
                    opsManagerID,
                    auditorID: user.UserID,
                    cashierName: cashierNameString,
                    auditDate,
                    auditOverstation,
                    status: "Draft",
                    cashCount: buildCashCountPayload(),
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
                    cashierName: cashierNameString,
                    auditDate,
                    auditOverstation,
                    status: "Submitted",
                    evaluations: buildEvaluationsPayload(),
                    cashCount: buildCashCountPayload()
                });
            } else {
                const opsManagerID = store.opsmanagerid || store.OpsManagerID;

                const payload = {
                    storeSerial: Number(storeId),
                    opsManagerID,
                    auditorID: user.UserID,
                    cashierName: cashierNameString,
                    auditDate,
                    auditOverstation,
                    status: "Submitted",
                    cashCount: buildCashCountPayload(),
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

    const activePoint =
        activeObservationIndex !== null ? auditPoints[activeObservationIndex] : null;

    return (
        <div className="audit-page">
            {/* ==================== HEADER ==================== */}
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

            {/* ==================== AUDIT INFO CARD ==================== */}
            <div className="audit-card audit-section-card">
                <div className="audit-section-block">
                    <div className="audit-section-block-title">
                        <FiUsers /> Cashiers — each has their own cash till
                    </div>

                    <div className="audit-cashier-chip-list">
                        {cashiers.map((cashier, index) => (
                            <div className="audit-cashier-chip-row" key={index}>
                                <span className="audit-cashier-chip-number">{index + 1}</span>
                                <input
                                    type="text"
                                    value={cashier.name}
                                    placeholder={`Cashier ${index + 1} name`}
                                    onChange={(e) =>
                                        handleCashierNameChange(index, e.target.value)
                                    }
                                />
                                {cashiers.length > 1 && (
                                    <button
                                        type="button"
                                        className="audit-cashier-chip-remove"
                                        title="Remove cashier"
                                        onClick={() => removeCashier(index)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="audit-add-cashier-btn-row">
                        <button
                            type="button"
                            className="audit-btn secondary audit-add-cashier-btn"
                            onClick={addCashier}
                        >
                            <FiPlus /> Add another cashier
                        </button>
                    </div>
                </div>

                <div className="audit-section-block">
                    <div className="audit-section-block-title">
                        <FiFileText /> Audit Info
                    </div>

                    <div className="audit-info-fields-row">
                        <div className="audit-field">
                            <label><FiCalendar /> Audit Date</label>
                            <input
                                type="date"
                                min={today}
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
            </div>

            {/* ==================== CASH COUNT TRIGGER ==================== */}
            <div className="audit-card audit-cash-trigger-card">
                <div className="audit-cash-trigger-info">
                    <span className="audit-cash-trigger-label">
                        Cash Count — {cashiers.length} {cashiers.length === 1 ? "cashier" : "cashiers"} · Grand Total (A+B+C)
                    </span>
                    <span className="audit-cash-trigger-value">
                        {overallCashSummary.grandTotal.toFixed(3)} BHD
                    </span>
                    <span
                        className={`audit-cash-diff ${
                            Math.abs(overallCashSummary.difference) < 0.0005 ? "ok" : "off"
                        }`}
                    >
                        {Math.abs(overallCashSummary.difference) < 0.0005 ? (
                            <>
                                <FiCheckCircle /> Balanced with report
                            </>
                        ) : (
                            <>
                                <FiAlertTriangle /> Difference:{" "}
                                {overallCashSummary.difference.toFixed(3)} BHD
                            </>
                        )}
                    </span>
                </div>

                <button
                    type="button"
                    className="audit-btn"
                    onClick={() => setCashModalOpen(true)}
                >
                    <FiDollarSign /> Open Cash Count
                </button>
            </div>

            {/* ==================== AUDIT POINTS TABLE ==================== */}
            {loadingPoints ? (
                <div className="audit-empty">Loading audit points…</div>
            ) : (
                <div className="audit-table-wrap">
                    <table className="audit-table audit-points-table-flat">
                        <thead>
                            <tr>
                                <th className="col-sub">Sub Point</th>
                                <th className="col-criteria">Criteria</th>
                                <th className="col-point">Audit Point</th>
                                <th className="col-risk">Risk Matrix</th>
                                <th className="col-rating">Rating</th>
                                <th className="col-weightage">Weightage</th>
                                <th className="col-score">Score</th>
                                <th className="col-weightpct">Weight %</th>
                                <th className="col-observation">Observation</th>
                            </tr>
                        </thead>

                        <tbody>
                            {auditPoints.map((point, index) => (
                                <tr
                                    key={point.id}
                                    className={`audit-point-row rating-border-${ratingCssKey(
                                        point.rating
                                    )}`}
                                >
                                    <td data-label="Sub Point">{point.subPoint}</td>
                                    <td data-label="Criteria">{point.criteria}</td>
                                    <td data-label="Audit Point">{point.auditPoint}</td>

                                    <td data-label="Risk Matrix">
                                        <span className={`audit-badge ${point.risk}`}>
                                            {point.risk}
                                        </span>
                                    </td>

                                    <td data-label="Rating">
                                        <select
                                            className={`audit-rating-select rating-select-${
                                                point.rating
                                                    ? point.rating.replace(".", "")
                                                    : "none"
                                            }`}
                                            value={point.rating}
                                            onChange={(e) =>
                                                handleRating(index, e.target.value)
                                            }
                                        >
                                            <option value="">Select</option>
                                            {RATING_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td data-label="Weightage">
                                        <span className="audit-weight-chip">
                                            {point.weightage}
                                        </span>
                                    </td>

                                    <td data-label="Score">
                                        {point.score !== null
                                            ? point.score.toFixed(2)
                                            : "-"}
                                    </td>

                                    <td data-label="Weight %">
                                        {point.percentage !== null
                                            ? `${point.percentage}%`
                                            : "-"}
                                    </td>

                                    <td data-label="Observation">
                                        <button
                                            type="button"
                                            className={`audit-observation-btn ${
                                                point.observation ? "filled" : ""
                                            }`}
                                            onClick={() => openObservationModal(index)}
                                        >
                                            <FiEdit3 />
                                            {point.observation ? "Edit" : "Add"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ==================== RISK BANNER ==================== */}
            <div
                className={`audit-risk-banner risk-${summary.riskLevel || "none"}`}
                style={{ marginTop: 20 }}
            >
                <div>
                    <span className="audit-risk-banner-label">Final Percentage</span>
                    <span className="audit-risk-banner-value">
                        {summary.finalPercentage !== null
                            ? `${summary.finalPercentage.toFixed(2)}%`
                            : "-"}
                    </span>
                </div>

                <div className="audit-risk-banner-right">
                    <span className="audit-risk-banner-rating">{riskLabel}</span>
                    <span className="audit-risk-banner-meta">
                        {summary.ratedCount}/{summary.totalCount} points rated · Total
                        score {summary.totalScore.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* ==================== STICKY ACTIONS BAR ==================== */}
            <div className="audit-actions-bar">
                <div className="audit-actions-bar-summary">
                    <span className="label">Progress</span>
                    <span className="value">
                        {summary.ratedCount}/{summary.totalCount} points rated
                    </span>
                </div>

                <div className="audit-actions-bar-buttons">
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

            {/* ==================== OBSERVATION MODAL ==================== */}
            {activePoint && (
                <div
                    className="audit-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeObservationModal();
                    }}
                >
                    <div className="audit-modal">
                        <div className="audit-modal-header">
                            <div className="audit-modal-title">
                                <FiEdit3 />
                                <span>Observation</span>
                            </div>

                            <button
                                type="button"
                                className="audit-modal-close"
                                onClick={closeObservationModal}
                                aria-label="Close"
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="audit-modal-body">
                            <div className="audit-modal-point-meta">
                                <span className="audit-point-major">
                                    {activePoint.criteria}
                                </span>
                                <span className="audit-point-sub">
                                    {activePoint.subPoint}
                                </span>
                                <p>{activePoint.auditPoint}</p>
                            </div>

                            <textarea
                                autoFocus
                                className="audit-modal-textarea"
                                value={activePoint.observation}
                                placeholder="Write your observation..."
                                onChange={(e) =>
                                    handleObservation(activeObservationIndex, e.target.value)
                                }
                            />
                        </div>

                        <div className="audit-modal-footer">
                            <button
                                type="button"
                                className="audit-btn"
                                onClick={closeObservationModal}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== CASH COUNT MODAL (per cashier tabs) ==================== */}
            {cashModalOpen && (
                <div
                    className="audit-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setCashModalOpen(false);
                    }}
                >
                    <div className="audit-modal audit-modal-wide">
                        <div className="audit-modal-header">
                            <div className="audit-modal-title">
                                <FiDollarSign />
                                <span>Cash Count (BHD)</span>
                            </div>

                            <button
                                type="button"
                                className="audit-modal-close"
                                onClick={() => setCashModalOpen(false)}
                                aria-label="Close"
                            >
                                <FiX />
                            </button>
                        </div>

                        {/* Cashier tabs — pick which till you're counting */}
                        <div className="audit-cashier-tabs-row">
                            {cashiers.map((c, i) => {
                                const s = cashierSummaries[i];
                                const balanced = s && Math.abs(s.difference) < 0.0005;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        className={`audit-cashier-tab ${
                                            safeActiveIndex === i ? "active" : ""
                                        }`}
                                        onClick={() => setActiveCashierIndex(i)}
                                    >
                                        <span className="audit-cashier-tab-status">
                                            {s ? (balanced ? "✓" : "⚠") : ""}
                                        </span>
                                        {c.name.trim() || `Cashier ${i + 1}`}
                                        {cashiers.length > 1 && (
                                            <span
                                                role="button"
                                                tabIndex={-1}
                                                className="audit-cashier-tab-remove"
                                                title="Remove this cashier"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeCashier(i);
                                                }}
                                            >
                                                <FiX size={12} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                className="audit-cashier-tab-add"
                                onClick={addCashier}
                            >
                                <FiPlus /> Add cashier
                            </button>
                        </div>

                        {/* Live running-total ticker for the active cashier */}
                        <div className="cash-ticker">
                            <div className="cash-ticker-block">
                                <span>{activeCashier.name.trim() || `Cashier ${safeActiveIndex + 1}`} — Grand Total (A+B+C)</span>
                                <strong>{activeCashierSummary.grandTotal.toFixed(3)}</strong>
                            </div>
                            <div className="cash-ticker-op">−</div>
                            <div className="cash-ticker-block">
                                <span>As per report</span>
                                <strong>{activeCashierSummary.totalAsPerReport.toFixed(3)}</strong>
                            </div>
                            <div className="cash-ticker-op">=</div>
                            <div
                                className={`cash-ticker-diff ${
                                    Math.abs(activeCashierSummary.difference) < 0.0005 ? "ok" : "off"
                                }`}
                            >
                                {Math.abs(activeCashierSummary.difference) < 0.0005 ? (
                                    <FiCheckCircle />
                                ) : (
                                    <FiAlertTriangle />
                                )}
                                <strong>
                                    {activeCashierSummary.difference > 0 ? "+" : ""}
                                    {activeCashierSummary.difference.toFixed(3)}
                                </strong>
                                <span>BHD</span>
                            </div>
                        </div>

                        <div className="audit-modal-body">
                            <section className="cash-section">
                                <div className="cash-section-head">
                                    <h3>Notes &amp; Coins</h3>
                                    <span className="cash-section-subtotal">
                                        {activeCashierSummary.denomTotal.toFixed(3)} BHD
                                    </span>
                                </div>

                                <div className="cash-denom-grid">
                                    {BHD_DENOMINATIONS.map((d) => {
                                        const qty = Number(activeCashier.denominations[d.key]) || 0;
                                        const lineTotal = qty * d.value;
                                        return (
                                            <div
                                                className={`cash-denom-card kind-${d.kind}`}
                                                key={d.key}
                                            >
                                                <div className="cash-denom-image-wrap">
                                                    <img
                                                        src={d.image}
                                                        alt={`${d.label} BHD`}
                                                        className="cash-denom-image"
                                                    />
                                                </div>

                                                <span className="cash-denom-label">
                                                    {d.label}
                                                    <em>BHD</em>
                                                </span>

                                                <div className="cash-denom-stepper">
                                                    <button
                                                        type="button"
                                                        onClick={() => stepDenom(safeActiveIndex, d.key, -1)}
                                                        aria-label={`Decrease ${d.label}`}
                                                    >
                                                        <FiMinus />
                                                    </button>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={activeCashier.denominations[d.key]}
                                                        onChange={(e) =>
                                                            handleDenomChange(safeActiveIndex, d.key, e.target.value)
                                                        }
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => stepDenom(safeActiveIndex, d.key, 1)}
                                                        aria-label={`Increase ${d.label}`}
                                                    >
                                                        <FiPlus />
                                                    </button>
                                                </div>

                                                <span className="cash-denom-subtotal">
                                                    {lineTotal.toFixed(3)} BHD
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="cash-section">
                                <div className="cash-section-head">
                                    <h3>Foreign Currency</h3>
                                    <span className="cash-section-subtotal">
                                        {activeCashierSummary.fcTotal.toFixed(3)} BHD
                                    </span>
                                </div>

                                <div className="cash-fc-list">
                                    {activeCashier.foreignCurrency.map((fc, i) => (
                                        <div className="cash-fc-card" key={`fc-${i}`}>
                                            <input
                                                type="text"
                                                className="cash-fc-currency"
                                                placeholder={`Currency ${i + 1}`}
                                                value={fc.label}
                                                onChange={(e) =>
                                                    handleFcChange(safeActiveIndex, i, "label", e.target.value)
                                                }
                                            />
                                            <div className="cash-fc-field">
                                                <label>Qty</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    value={fc.qty}
                                                    onChange={(e) =>
                                                        handleFcChange(safeActiveIndex, i, "qty", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="cash-fc-field">
                                                <label>Value (BHD)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0.000"
                                                    value={fc.value}
                                                    onChange={(e) =>
                                                        handleFcChange(safeActiveIndex, i, "value", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <span className="cash-fc-line-total">
                                                {(
                                                    (Number(fc.qty) || 0) * (Number(fc.value) || 0)
                                                ).toFixed(3)}{" "}
                                                BHD
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ==================== B. PAID BILLS / IOUs ==================== */}
                            <section className="cash-section">
                                <div className="cash-section-head">
                                    <h3>B. Paid Bills / IOUs</h3>
                                    <span className="cash-section-subtotal">
                                        {activeCashierSummary.paidBillsTotal.toFixed(3)} BHD
                                    </span>
                                </div>

                                <div className="cash-particulars-list">
                                    {(activeCashier.paidBills || []).map((row, i) => (
                                        <div className="cash-particulars-row" key={`bill-${i}`}>
                                            <input
                                                type="text"
                                                placeholder="Particulars"
                                                value={row.particular}
                                                onChange={(e) =>
                                                    handleParticularChange(
                                                        safeActiveIndex,
                                                        "paidBills",
                                                        i,
                                                        "particular",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="0.000"
                                                value={row.amount}
                                                onChange={(e) =>
                                                    handleParticularChange(
                                                        safeActiveIndex,
                                                        "paidBills",
                                                        i,
                                                        "amount",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            {(activeCashier.paidBills || []).length > 1 && (
                                                <button
                                                    type="button"
                                                    className="cash-particulars-remove"
                                                    title="Remove line"
                                                    onClick={() =>
                                                        removeParticularRow(safeActiveIndex, "paidBills", i)
                                                    }
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="cash-particulars-add-row">
                                    <button
                                        type="button"
                                        className="audit-btn secondary"
                                        onClick={() => addParticularRow(safeActiveIndex, "paidBills")}
                                    >
                                        <FiPlus /> Add line
                                    </button>
                                </div>
                            </section>

                            {/* ==================== C. STATEMENTS SENT FOR REIMBURSEMENT ==================== */}
                            <section className="cash-section">
                                <div className="cash-section-head">
                                    <h3>C. Statements Sent for Reimbursement to Office</h3>
                                    <span className="cash-section-subtotal">
                                        {activeCashierSummary.reimbursementsTotal.toFixed(3)} BHD
                                    </span>
                                </div>

                                <div className="cash-particulars-list">
                                    {(activeCashier.reimbursements || []).map((row, i) => (
                                        <div className="cash-particulars-row" key={`reimb-${i}`}>
                                            <input
                                                type="text"
                                                placeholder="Particulars"
                                                value={row.particular}
                                                onChange={(e) =>
                                                    handleParticularChange(
                                                        safeActiveIndex,
                                                        "reimbursements",
                                                        i,
                                                        "particular",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="0.000"
                                                value={row.amount}
                                                onChange={(e) =>
                                                    handleParticularChange(
                                                        safeActiveIndex,
                                                        "reimbursements",
                                                        i,
                                                        "amount",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            {(activeCashier.reimbursements || []).length > 1 && (
                                                <button
                                                    type="button"
                                                    className="cash-particulars-remove"
                                                    title="Remove line"
                                                    onClick={() =>
                                                        removeParticularRow(safeActiveIndex, "reimbursements", i)
                                                    }
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="cash-particulars-add-row">
                                    <button
                                        type="button"
                                        className="audit-btn secondary"
                                        onClick={() => addParticularRow(safeActiveIndex, "reimbursements")}
                                    >
                                        <FiPlus /> Add line
                                    </button>
                                </div>
                            </section>

                            <section className="cash-section">
                                <div className="cash-section-head">
                                    <h3>Report Figures</h3>
                                </div>

                                <div className="cash-report-grid">
                                    <div className="audit-field">
                                        <label>Tills Float</label>
                                        <input
                                            type="number"
                                            value={activeCashier.tillFloat}
                                            onChange={(e) =>
                                                handleCashierFieldChange(safeActiveIndex, "tillFloat", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="audit-field">
                                        <label>Sale Cash (per report)</label>
                                        <input
                                            type="number"
                                            value={activeCashier.saleCashPerReport}
                                            onChange={(e) =>
                                                handleCashierFieldChange(
                                                    safeActiveIndex,
                                                    "saleCashPerReport",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* ==================== A/B/C/GRAND TOTAL/DIFFERENCE SUMMARY ==================== */}
                            <section className="cash-section">
                                <div className="cash-section-head">
                                    <h3>Summary</h3>
                                </div>

                                <div className="cash-abc-summary">
                                    <div className="cash-abc-row">
                                        <span className="label">Total Cash (A)</span>
                                        <span className="value">
                                            {activeCashierSummary.totalWithCashier.toFixed(3)} BHD
                                        </span>
                                    </div>
                                    <div className="cash-abc-row">
                                        <span className="label">Paid Bills / IOUs (B)</span>
                                        <span className="value">
                                            {activeCashierSummary.paidBillsTotal.toFixed(3)} BHD
                                        </span>
                                    </div>
                                    <div className="cash-abc-row">
                                        <span className="label">Statements Sent for Reimbursement (C)</span>
                                        <span className="value">
                                            {activeCashierSummary.reimbursementsTotal.toFixed(3)} BHD
                                        </span>
                                    </div>
                                    <div className="cash-abc-row total grand">
                                        <span className="label">Grand Total (A+B+C)</span>
                                        <span className="value">
                                            {activeCashierSummary.grandTotal.toFixed(3)} BHD
                                        </span>
                                    </div>
                                    <div className="cash-abc-row">
                                        <span className="label">As per Report (Till Float + Sale Cash)</span>
                                        <span className="value">
                                            {activeCashierSummary.totalAsPerReport.toFixed(3)} BHD
                                        </span>
                                    </div>
                                    <div
                                        className={`cash-abc-row total diff ${
                                            Math.abs(activeCashierSummary.difference) < 0.0005 ? "ok" : "off"
                                        }`}
                                    >
                                        <span className="label">Difference Excess/Shortage BD</span>
                                        <span className="value">
                                            {activeCashierSummary.difference > 0 ? "+" : ""}
                                            {activeCashierSummary.difference.toFixed(3)}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <div className="audit-field" style={{ marginTop: 4 }}>
                                <label>Remarks (if any)</label>
                                <textarea
                                    value={activeCashier.remarks}
                                    onChange={(e) =>
                                        handleCashierFieldChange(safeActiveIndex, "remarks", e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="audit-modal-footer">
                            <div className="audit-modal-footer-split">
                                <span className="audit-cash-trigger-label" style={{ margin: 0 }}>
                                    {cashiers.length} {cashiers.length === 1 ? "cashier" : "cashiers"} total ·{" "}
                                    {overallCashSummary.grandTotal.toFixed(3)} BHD grand total
                                </span>

                                <button
                                    type="button"
                                    className="audit-btn"
                                    onClick={() => setCashModalOpen(false)}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditDetails;